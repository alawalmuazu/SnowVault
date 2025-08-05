// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./PrivacyToken.sol";

/**
 * @title ConfidentialLending
 * @dev Privacy-preserving lending protocol with encrypted loan amounts and collateral
 */
contract ConfidentialLending is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    PrivacyToken public immutable privacyToken;

    struct EncryptedLoan {
        address borrower;
        address lender;
        bytes encryptedAmount;
        bytes encryptedCollateral;
        bytes encryptedInterestRate;
        uint256 duration;
        uint256 startTime;
        uint256 maturityTime;
        LoanStatus status;
        bytes32 loanId;
        bytes zkProof;
    }

    struct CreditScore {
        bytes encryptedScore;
        uint256 lastUpdated;
        bytes zkProof;
        bool isValid;
    }

    enum LoanStatus {
        Pending,
        Active,
        Repaid,
        Defaulted,
        Liquidated
    }

    // Mappings
    mapping(bytes32 => EncryptedLoan) public loans;
    mapping(address => CreditScore) public creditScores;
    mapping(address => bytes32[]) public userLoans;
    mapping(address => bytes) public encryptedCollateralBalances;
    mapping(bytes32 => bool) public nullifierHashes;
    
    // Lending pool
    mapping(address => bytes) public encryptedLendingBalances;
    mapping(address => uint256) public lastInteractionTime;
    
    // Risk parameters (encrypted)
    bytes public encryptedMinCollateralRatio;
    bytes public encryptedLiquidationThreshold;
    bytes public encryptedMaxLoanAmount;

    // Events
    event LoanRequested(
        bytes32 indexed loanId,
        address indexed borrower,
        bytes encryptedAmount,
        bytes encryptedCollateral,
        uint256 duration
    );
    
    event LoanFunded(
        bytes32 indexed loanId,
        address indexed lender,
        bytes encryptedAmount
    );
    
    event LoanRepaid(
        bytes32 indexed loanId,
        address indexed borrower,
        bytes encryptedAmount
    );
    
    event LoanDefaulted(
        bytes32 indexed loanId,
        address indexed borrower
    );
    
    event CollateralLiquidated(
        bytes32 indexed loanId,
        address indexed liquidator,
        bytes encryptedAmount
    );
    
    event CreditScoreUpdated(
        address indexed user,
        bytes encryptedScore,
        uint256 timestamp
    );
    
    event DepositToPool(
        address indexed lender,
        bytes encryptedAmount
    );
    
    event WithdrawFromPool(
        address indexed lender,
        bytes encryptedAmount
    );

    constructor(address _privacyToken) {
        privacyToken = PrivacyToken(_privacyToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
    }

    /**
     * @dev Request a confidential loan
     */
    function requestLoan(
        bytes calldata encryptedAmount,
        bytes calldata encryptedCollateral,
        bytes calldata encryptedInterestRate,
        uint256 duration,
        bytes calldata creditProof,
        bytes32 nullifier
    ) external nonReentrant whenNotPaused {
        require(!nullifierHashes[nullifier], "Nullifier already used");
        require(duration > 0 && duration <= 365 days, "Invalid loan duration");
        require(_verifyCreditScore(msg.sender, creditProof), "Invalid credit proof");
        
        bytes32 loanId = keccak256(abi.encodePacked(
            msg.sender,
            encryptedAmount,
            block.timestamp,
            nullifier
        ));
        
        nullifierHashes[nullifier] = true;
        
        loans[loanId] = EncryptedLoan({
            borrower: msg.sender,
            lender: address(0),
            encryptedAmount: encryptedAmount,
            encryptedCollateral: encryptedCollateral,
            encryptedInterestRate: encryptedInterestRate,
            duration: duration,
            startTime: 0,
            maturityTime: 0,
            status: LoanStatus.Pending,
            loanId: loanId,
            zkProof: creditProof
        });
        
        userLoans[msg.sender].push(loanId);
        
        // Lock collateral
        _lockCollateral(msg.sender, encryptedCollateral);
        
        emit LoanRequested(
            loanId,
            msg.sender,
            encryptedAmount,
            encryptedCollateral,
            duration
        );
    }

    /**
     * @dev Fund a loan (lender provides liquidity)
     */
    function fundLoan(
        bytes32 loanId,
        bytes calldata fundingProof,
        bytes32 nullifier
    ) external nonReentrant whenNotPaused {
        require(!nullifierHashes[nullifier], "Nullifier already used");
        EncryptedLoan storage loan = loans[loanId];
        require(loan.status == LoanStatus.Pending, "Loan not available for funding");
        require(loan.borrower != msg.sender, "Cannot fund own loan");
        require(_verifyFundingCapacity(msg.sender, loan.encryptedAmount, fundingProof), "Insufficient funds");
        
        nullifierHashes[nullifier] = true;
        
        // Update loan details
        loan.lender = msg.sender;
        loan.status = LoanStatus.Active;
        loan.startTime = block.timestamp;
        loan.maturityTime = block.timestamp + loan.duration;
        
        // Transfer funds to borrower (encrypted)
        _transferEncryptedFunds(msg.sender, loan.borrower, loan.encryptedAmount);
        
        userLoans[msg.sender].push(loanId);
        
        emit LoanFunded(loanId, msg.sender, loan.encryptedAmount);
    }

    /**
     * @dev Repay loan with interest
     */
    function repayLoan(
        bytes32 loanId,
        bytes calldata encryptedRepaymentAmount,
        bytes calldata repaymentProof,
        bytes32 nullifier
    ) external nonReentrant whenNotPaused {
        require(!nullifierHashes[nullifier], "Nullifier already used");
        EncryptedLoan storage loan = loans[loanId];
        require(loan.borrower == msg.sender, "Not the borrower");
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(_verifyRepaymentAmount(loanId, encryptedRepaymentAmount, repaymentProof), "Invalid repayment");
        
        nullifierHashes[nullifier] = true;
        
        // Transfer repayment to lender
        _transferEncryptedFunds(msg.sender, loan.lender, encryptedRepaymentAmount);
        
        // Release collateral
        _releaseCollateral(msg.sender, loan.encryptedCollateral);
        
        // Update loan status
        loan.status = LoanStatus.Repaid;
        
        // Update credit score positively
        _updateCreditScore(msg.sender, true);
        
        emit LoanRepaid(loanId, msg.sender, encryptedRepaymentAmount);
    }

    /**
     * @dev Liquidate defaulted loan
     */
    function liquidateLoan(
        bytes32 loanId,
        bytes calldata liquidationProof
    ) external nonReentrant whenNotPaused {
        EncryptedLoan storage loan = loans[loanId];
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(block.timestamp > loan.maturityTime, "Loan not yet matured");
        require(_verifyLiquidationConditions(loanId, liquidationProof), "Liquidation not allowed");
        
        // Transfer collateral to lender
        _transferCollateralToLender(loan.lender, loan.encryptedCollateral);
        
        // Update loan status
        loan.status = LoanStatus.Liquidated;
        
        // Update credit score negatively
        _updateCreditScore(loan.borrower, false);
        
        emit CollateralLiquidated(loanId, msg.sender, loan.encryptedCollateral);
    }

    /**
     * @dev Deposit to lending pool
     */
    function depositToPool(
        bytes calldata encryptedAmount,
        bytes calldata depositProof,
        bytes32 nullifier
    ) external nonReentrant whenNotPaused {
        require(!nullifierHashes[nullifier], "Nullifier already used");
        require(_verifyDepositProof(msg.sender, encryptedAmount, depositProof), "Invalid deposit proof");
        
        nullifierHashes[nullifier] = true;
        
        // Update lender's pool balance
        _updateEncryptedPoolBalance(msg.sender, encryptedAmount, true);
        lastInteractionTime[msg.sender] = block.timestamp;
        
        emit DepositToPool(msg.sender, encryptedAmount);
    }

    /**
     * @dev Withdraw from lending pool
     */
    function withdrawFromPool(
        bytes calldata encryptedAmount,
        bytes calldata withdrawProof,
        bytes32 nullifier
    ) external nonReentrant whenNotPaused {
        require(!nullifierHashes[nullifier], "Nullifier already used");
        require(_verifyWithdrawProof(msg.sender, encryptedAmount, withdrawProof), "Invalid withdraw proof");
        
        nullifierHashes[nullifier] = true;
        
        // Update lender's pool balance
        _updateEncryptedPoolBalance(msg.sender, encryptedAmount, false);
        lastInteractionTime[msg.sender] = block.timestamp;
        
        emit WithdrawFromPool(msg.sender, encryptedAmount);
    }

    /**
     * @dev Update credit score (oracle role)
     */
    function updateCreditScore(
        address user,
        bytes calldata encryptedScore,
        bytes calldata scoreProof
    ) external onlyRole(ORACLE_ROLE) {
        require(_verifyScoreProof(user, encryptedScore, scoreProof), "Invalid score proof");
        
        creditScores[user] = CreditScore({
            encryptedScore: encryptedScore,
            lastUpdated: block.timestamp,
            zkProof: scoreProof,
            isValid: true
        });
        
        emit CreditScoreUpdated(user, encryptedScore, block.timestamp);
    }

    /**
     * @dev Get user's loans
     */
    function getUserLoans(address user) external view returns (bytes32[] memory) {
        return userLoans[user];
    }

    /**
     * @dev Get encrypted lending balance
     */
    function getEncryptedLendingBalance(address user) external view returns (bytes memory) {
        return encryptedLendingBalances[user];
    }

    /**
     * @dev Audit loan for compliance
     */
    function auditLoan(bytes32 loanId) external onlyRole(AUDITOR_ROLE) returns (EncryptedLoan memory) {
        return loans[loanId];
    }

    // Internal functions
    function _lockCollateral(address user, bytes calldata encryptedAmount) internal {
        // Lock collateral in the contract
        encryptedCollateralBalances[user] = abi.encode(
            encryptedCollateralBalances[user],
            encryptedAmount,
            "lock"
        );
    }

    function _releaseCollateral(address user, bytes calldata encryptedAmount) internal {
        // Release collateral back to user
        encryptedCollateralBalances[user] = abi.encode(
            encryptedCollateralBalances[user],
            encryptedAmount,
            "release"
        );
    }

    function _transferEncryptedFunds(address from, address to, bytes memory encryptedAmount) internal {
        // This would integrate with the PrivacyToken contract for encrypted transfers
        // Placeholder for actual implementation
    }

    function _transferCollateralToLender(address lender, bytes memory encryptedCollateral) internal {
        // Transfer liquidated collateral to lender
        // Placeholder for actual implementation
    }

    function _updateEncryptedPoolBalance(address user, bytes calldata amount, bool isDeposit) internal {
        if (isDeposit) {
            encryptedLendingBalances[user] = abi.encode(
                encryptedLendingBalances[user],
                amount,
                "add"
            );
        } else {
            encryptedLendingBalances[user] = abi.encode(
                encryptedLendingBalances[user],
                amount,
                "sub"
            );
        }
    }

    function _updateCreditScore(address user, bool positive) internal {
        // Update credit score based on loan performance
        // This would use ZK proofs to update scores privately
    }

    // Verification functions (ZK proof verification)
    function _verifyCreditScore(address user, bytes calldata proof) internal view returns (bool) {
        // Verify that user meets minimum credit score requirements
        return creditScores[user].isValid;
    }

    function _verifyFundingCapacity(address lender, bytes memory amount, bytes calldata proof) internal view returns (bool) {
        // Verify lender has sufficient funds
        return true; // Placeholder
    }

    function _verifyRepaymentAmount(bytes32 loanId, bytes calldata amount, bytes calldata proof) internal view returns (bool) {
        // Verify repayment amount includes principal + interest
        return true; // Placeholder
    }

    function _verifyLiquidationConditions(bytes32 loanId, bytes calldata proof) internal view returns (bool) {
        // Verify loan is eligible for liquidation
        return true; // Placeholder
    }

    function _verifyDepositProof(address user, bytes calldata amount, bytes calldata proof) internal view returns (bool) {
        // Verify deposit proof
        return true; // Placeholder
    }

    function _verifyWithdrawProof(address user, bytes calldata amount, bytes calldata proof) internal view returns (bool) {
        // Verify withdrawal proof
        return true; // Placeholder
    }

    function _verifyScoreProof(address user, bytes calldata score, bytes calldata proof) internal view returns (bool) {
        // Verify credit score proof
        return true; // Placeholder
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