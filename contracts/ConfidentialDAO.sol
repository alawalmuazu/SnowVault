// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./PrivacyToken.sol";

/**
 * @title ConfidentialDAO
 * @dev Privacy-preserving DAO voting system with encrypted votes and token weights
 * Prevents vote buying, coercion, and strategic voting while maintaining verifiability
 */
contract ConfidentialDAO is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    PrivacyToken public immutable governanceToken;

    struct Proposal {
        bytes32 proposalId;
        address proposer;
        string title;
        string description;
        bytes32 contentHash;
        uint256 startTime;
        uint256 endTime;
        uint256 executionTime;
        ProposalStatus status;
        bytes encryptedVoteCount;
        bytes32[] nullifiers;
        mapping(bytes32 => bool) usedNullifiers;
        bytes executionData;
        address targetContract;
        uint256 requiredQuorum;
        bytes zkProofRequirement;
    }

    struct EncryptedVote {
        bytes32 voteId;
        address voter;
        bytes32 proposalId;
        bytes encryptedChoice;
        bytes encryptedWeight;
        bytes zkProof;
        uint256 timestamp;
        bytes32 nullifier;
    }

    struct VotingPower {
        address holder;
        bytes encryptedBalance;
        uint256 snapshotBlock;
        bytes delegationProof;
        bool isDelegated;
        address delegateTo;
    }

    struct DAOConfig {
        uint256 proposalThreshold;
        uint256 votingDelay;
        uint256 votingPeriod;
        uint256 executionDelay;
        uint256 quorumPercentage;
        bool requiresStaking;
        bytes encryptedTreasuryBalance;
    }

    enum ProposalStatus {
        Pending,
        Active,
        Succeeded,
        Defeated,
        Queued,
        Executed,
        Cancelled
    }

    enum VoteChoice {
        Against,
        For,
        Abstain
    }

    // State variables
    DAOConfig public daoConfig;
    uint256 public proposalCount;
    uint256 public currentSnapshotBlock;
    
    // Mappings
    mapping(bytes32 => Proposal) public proposals;
    mapping(bytes32 => EncryptedVote) public votes;
    mapping(address => VotingPower) public votingPowers;
    mapping(bytes32 => bool) public nullifierHashes;
    mapping(address => bytes32[]) public userProposals;
    mapping(address => bytes32[]) public userVotes;
    mapping(bytes32 => bytes32[]) public proposalVotes;
    mapping(address => mapping(bytes32 => bool)) public hasVoted;
    mapping(bytes32 => bytes) public encryptedResults;

    // Events
    event ProposalCreated(
        bytes32 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 startTime,
        uint256 endTime
    );
    
    event EncryptedVoteCast(
        bytes32 indexed proposalId,
        bytes32 indexed voteId,
        address indexed voter,
        bytes encryptedChoice,
        bytes encryptedWeight
    );
    
    event ProposalExecuted(
        bytes32 indexed proposalId,
        bytes result
    );
    
    event ProposalCancelled(
        bytes32 indexed proposalId,
        address indexed canceller
    );
    
    event VotingPowerDelegated(
        address indexed delegator,
        address indexed delegatee,
        bytes encryptedAmount
    );
    
    event SnapshotTaken(
        uint256 indexed blockNumber,
        bytes32 indexed proposalId
    );
    
    event QuorumReached(
        bytes32 indexed proposalId,
        bytes encryptedQuorum
    );

    constructor(
        address _governanceToken,
        uint256 _proposalThreshold,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _executionDelay,
        uint256 _quorumPercentage
    ) {
        governanceToken = PrivacyToken(_governanceToken);
        
        daoConfig = DAOConfig({
            proposalThreshold: _proposalThreshold,
            votingDelay: _votingDelay,
            votingPeriod: _votingPeriod,
            executionDelay: _executionDelay,
            quorumPercentage: _quorumPercentage,
            requiresStaking: false,
            encryptedTreasuryBalance: ""
        });
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
        _grantRole(GUARDIAN_ROLE, msg.sender);
    }

    /**
     * @dev Create a new proposal
     */
    function createProposal(
        string calldata title,
        string calldata description,
        bytes calldata executionData,
        address targetContract,
        uint256 votingDuration,
        bytes calldata proposalProof,
        bytes32 nullifier
    ) external nonReentrant whenNotPaused returns (bytes32) {
        require(!nullifierHashes[nullifier], "Nullifier already used");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(votingDuration > 0, "Invalid voting duration");
        require(_verifyProposalThreshold(msg.sender, proposalProof), "Insufficient proposal threshold");
        
        bytes32 proposalId = keccak256(abi.encodePacked(
            msg.sender,
            title,
            description,
            block.timestamp,
            nullifier
        ));
        
        nullifierHashes[nullifier] = true;
        proposalCount++;
        
        uint256 startTime = block.timestamp + daoConfig.votingDelay;
        uint256 endTime = startTime + votingDuration;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.proposalId = proposalId;
        proposal.proposer = msg.sender;
        proposal.title = title;
        proposal.description = description;
        proposal.contentHash = keccak256(abi.encodePacked(title, description, executionData));
        proposal.startTime = startTime;
        proposal.endTime = endTime;
        proposal.executionTime = endTime + daoConfig.executionDelay;
        proposal.status = ProposalStatus.Pending;
        proposal.executionData = executionData;
        proposal.targetContract = targetContract;
        proposal.requiredQuorum = daoConfig.quorumPercentage;
        
        userProposals[msg.sender].push(proposalId);
        
        // Take snapshot for voting power calculation
        _takeSnapshot(proposalId);
        
        emit ProposalCreated(proposalId, msg.sender, title, startTime, endTime);
        
        return proposalId;
    }

    /**
     * @dev Cast an encrypted vote
     */
    function castEncryptedVote(
        bytes32 proposalId,
        bytes calldata encryptedChoice,
        bytes calldata encryptedWeight,
        bytes calldata voteProof,
        bytes32 nullifier
    ) external nonReentrant whenNotPaused {
        require(!nullifierHashes[nullifier], "Nullifier already used");
        require(!hasVoted[msg.sender][proposalId], "Already voted");
        
        Proposal storage proposal = proposals[proposalId];
        require(proposal.proposalId != bytes32(0), "Proposal does not exist");
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(proposal.status == ProposalStatus.Active || proposal.status == ProposalStatus.Pending, "Proposal not active");
        
        require(_verifyVoteProof(msg.sender, proposalId, encryptedChoice, encryptedWeight, voteProof), "Invalid vote proof");
        require(!proposal.usedNullifiers[nullifier], "Nullifier already used for this proposal");
        
        bytes32 voteId = keccak256(abi.encodePacked(
            msg.sender,
            proposalId,
            encryptedChoice,
            block.timestamp,
            nullifier
        ));
        
        nullifierHashes[nullifier] = true;
        proposal.usedNullifiers[nullifier] = true;
        proposal.nullifiers.push(nullifier);
        
        // Store encrypted vote
        votes[voteId] = EncryptedVote({
            voteId: voteId,
            voter: msg.sender,
            proposalId: proposalId,
            encryptedChoice: encryptedChoice,
            encryptedWeight: encryptedWeight,
            zkProof: voteProof,
            timestamp: block.timestamp,
            nullifier: nullifier
        });
        
        // Update proposal vote count (homomorphically)
        _updateEncryptedVoteCount(proposalId, encryptedChoice, encryptedWeight);
        
        // Mark as voted
        hasVoted[msg.sender][proposalId] = true;
        userVotes[msg.sender].push(voteId);
        proposalVotes[proposalId].push(voteId);
        
        // Update proposal status if needed
        if (proposal.status == ProposalStatus.Pending) {
            proposal.status = ProposalStatus.Active;
        }
        
        emit EncryptedVoteCast(proposalId, voteId, msg.sender, encryptedChoice, encryptedWeight);
    }

    /**
     * @dev Delegate voting power
     */
    function delegateVotingPower(
        address delegatee,
        bytes calldata encryptedAmount,
        bytes calldata delegationProof,
        bytes32 nullifier
    ) external nonReentrant whenNotPaused {
        require(!nullifierHashes[nullifier], "Nullifier already used");
        require(delegatee != address(0), "Invalid delegatee");
        require(delegatee != msg.sender, "Cannot delegate to self");
        require(_verifyDelegationProof(msg.sender, delegatee, encryptedAmount, delegationProof), "Invalid delegation proof");
        
        nullifierHashes[nullifier] = true;
        
        // Update voting power
        votingPowers[msg.sender].isDelegated = true;
        votingPowers[msg.sender].delegateTo = delegatee;
        votingPowers[msg.sender].delegationProof = delegationProof;
        
        // Update delegatee's voting power
        _updateDelegatedVotingPower(delegatee, encryptedAmount, true);
        
        emit VotingPowerDelegated(msg.sender, delegatee, encryptedAmount);
    }

    /**
     * @dev Finalize proposal after voting period
     */
    function finalizeProposal(
        bytes32 proposalId,
        bytes calldata decryptionProof
    ) external nonReentrant whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.proposalId != bytes32(0), "Proposal does not exist");
        require(block.timestamp > proposal.endTime, "Voting still active");
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(_verifyDecryptionProof(proposalId, decryptionProof), "Invalid decryption proof");
        
        // Decrypt and tally votes
        (bool succeeded, bytes memory result) = _tallyEncryptedVotes(proposalId, decryptionProof);
        
        if (succeeded) {
            proposal.status = ProposalStatus.Succeeded;
            if (proposal.executionData.length > 0) {
                proposal.status = ProposalStatus.Queued;
            }
        } else {
            proposal.status = ProposalStatus.Defeated;
        }
        
        encryptedResults[proposalId] = result;
        
        if (succeeded) {
            emit QuorumReached(proposalId, result);
        }
    }

    /**
     * @dev Execute a successful proposal
     */
    function executeProposal(
        bytes32 proposalId,
        bytes calldata executionProof
    ) external nonReentrant whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Queued, "Proposal not queued");
        require(block.timestamp >= proposal.executionTime, "Execution delay not met");
        require(_verifyExecutionProof(proposalId, executionProof), "Invalid execution proof");
        
        proposal.status = ProposalStatus.Executed;
        
        // Execute the proposal
        if (proposal.executionData.length > 0 && proposal.targetContract != address(0)) {
            (bool success, bytes memory result) = proposal.targetContract.call(proposal.executionData);
            require(success, "Proposal execution failed");
            
            emit ProposalExecuted(proposalId, result);
        }
    }

    /**
     * @dev Cancel a proposal (guardian role)
     */
    function cancelProposal(
        bytes32 proposalId,
        bytes calldata cancellationProof
    ) external onlyRole(GUARDIAN_ROLE) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Pending || proposal.status == ProposalStatus.Active, "Cannot cancel proposal");
        require(_verifyCancellationProof(proposalId, cancellationProof), "Invalid cancellation proof");
        
        proposal.status = ProposalStatus.Cancelled;
        
        emit ProposalCancelled(proposalId, msg.sender);
    }

    /**
     * @dev Get proposal votes
     */
    function getProposalVotes(bytes32 proposalId) external view returns (bytes32[] memory) {
        return proposalVotes[proposalId];
    }

    /**
     * @dev Get user's votes
     */
    function getUserVotes(address user) external view returns (bytes32[] memory) {
        return userVotes[user];
    }

    /**
     * @dev Get user's proposals
     */
    function getUserProposals(address user) external view returns (bytes32[] memory) {
        return userProposals[user];
    }

    /**
     * @dev Get encrypted voting results
     */
    function getEncryptedResults(bytes32 proposalId) external view returns (bytes memory) {
        return encryptedResults[proposalId];
    }

    /**
     * @dev Audit proposal for compliance
     */
    function auditProposal(bytes32 proposalId) external onlyRole(AUDITOR_ROLE) returns (
        address proposer,
        uint256 startTime,
        uint256 endTime,
        ProposalStatus status,
        bytes memory encryptedVoteCount
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.proposer,
            proposal.startTime,
            proposal.endTime,
            proposal.status,
            proposal.encryptedVoteCount
        );
    }

    /**
     * @dev Audit vote for compliance
     */
    function auditVote(bytes32 voteId) external onlyRole(AUDITOR_ROLE) returns (EncryptedVote memory) {
        return votes[voteId];
    }

    // Internal functions
    function _takeSnapshot(bytes32 proposalId) internal {
        currentSnapshotBlock = block.number;
        emit SnapshotTaken(currentSnapshotBlock, proposalId);
    }

    function _updateEncryptedVoteCount(
        bytes32 proposalId,
        bytes calldata encryptedChoice,
        bytes calldata encryptedWeight
    ) internal {
        Proposal storage proposal = proposals[proposalId];
        // Homomorphic addition of encrypted votes
        proposal.encryptedVoteCount = abi.encode(
            proposal.encryptedVoteCount,
            encryptedChoice,
            encryptedWeight,
            "add_vote"
        );
    }

    function _updateDelegatedVotingPower(
        address delegatee,
        bytes calldata encryptedAmount,
        bool isAddition
    ) internal {
        if (isAddition) {
            votingPowers[delegatee].encryptedBalance = abi.encode(
                votingPowers[delegatee].encryptedBalance,
                encryptedAmount,
                "add"
            );
        } else {
            votingPowers[delegatee].encryptedBalance = abi.encode(
                votingPowers[delegatee].encryptedBalance,
                encryptedAmount,
                "sub"
            );
        }
    }

    function _tallyEncryptedVotes(
        bytes32 proposalId,
        bytes calldata decryptionProof
    ) internal view returns (bool succeeded, bytes memory result) {
        // This would decrypt and tally the votes using the decryption proof
        // Implementation depends on the specific encryption scheme
        return (true, abi.encode("proposal_passed", block.timestamp));
    }

    // Verification functions (ZK proof verification)
    function _verifyProposalThreshold(address proposer, bytes calldata proof) internal view returns (bool) {
        // Verify proposer meets minimum token threshold
        return true; // Placeholder
    }

    function _verifyVoteProof(
        address voter,
        bytes32 proposalId,
        bytes calldata encryptedChoice,
        bytes calldata encryptedWeight,
        bytes calldata proof
    ) internal view returns (bool) {
        // Verify vote proof (voter has voting power, choice is valid)
        return true; // Placeholder
    }

    function _verifyDelegationProof(
        address delegator,
        address delegatee,
        bytes calldata encryptedAmount,
        bytes calldata proof
    ) internal view returns (bool) {
        // Verify delegation proof
        return true; // Placeholder
    }

    function _verifyDecryptionProof(bytes32 proposalId, bytes calldata proof) internal view returns (bool) {
        // Verify decryption proof for vote tallying
        return true; // Placeholder
    }

    function _verifyExecutionProof(bytes32 proposalId, bytes calldata proof) internal view returns (bool) {
        // Verify execution proof
        return true; // Placeholder
    }

    function _verifyCancellationProof(bytes32 proposalId, bytes calldata proof) internal view returns (bool) {
        // Verify cancellation proof
        return true; // Placeholder
    }

    /**
     * @dev Update DAO configuration
     */
    function updateDAOConfig(
        uint256 _proposalThreshold,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _executionDelay,
        uint256 _quorumPercentage
    ) external onlyRole(ADMIN_ROLE) {
        daoConfig.proposalThreshold = _proposalThreshold;
        daoConfig.votingDelay = _votingDelay;
        daoConfig.votingPeriod = _votingPeriod;
        daoConfig.executionDelay = _executionDelay;
        daoConfig.quorumPercentage = _quorumPercentage;
    }

    /**
     * @dev Emergency pause
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}