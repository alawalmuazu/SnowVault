// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./PrivacyToken.sol";

/**
 * @title RWATokenization
 * @dev Privacy-preserving Real-World Asset tokenization with encrypted metadata
 * Supports confidential ownership, valuation, and transaction history
 */
contract RWATokenization is ERC721URIStorage, AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    PrivacyToken public immutable paymentToken;

    struct RWAAsset {
        uint256 tokenId;
        address issuer;
        address currentOwner;
        bytes encryptedValuation;
        bytes encryptedMetadata;
        bytes32 assetType;
        uint256 issuanceDate;
        uint256 lastValuationUpdate;
        AssetStatus status;
        bytes32[] transactionHistory;
        bytes complianceData;
        bool isTransferable;
        bytes32 jurisdictionCode;
    }

    struct EncryptedTransaction {
        bytes32 transactionId;
        uint256 tokenId;
        address from;
        address to;
        bytes encryptedPrice;
        uint256 timestamp;
        TransactionType txType;
        bytes zkProof;
        bytes32 nullifier;
        bool isCompliant;
    }

    struct AssetValuation {
        uint256 tokenId;
        bytes encryptedValue;
        address appraiser;
        uint256 timestamp;
        bytes valuationProof;
        bool isVerified;
    }

    struct InvestorProfile {
        address investor;
        bytes encryptedKYCData;
        uint256 accreditationLevel;
        bytes32[] authorizedAssetTypes;
        bool isAccredited;
        uint256 lastKYCUpdate;
        bytes complianceProof;
    }

    enum AssetStatus {
        Pending,
        Active,
        Suspended,
        Matured,
        Defaulted
    }

    enum TransactionType {
        Mint,
        Transfer,
        Sale,
        Redemption,
        Collateralization
    }

    // State variables
    uint256 private _tokenIdCounter;
    uint256 public totalAssets;
    
    // Mappings
    mapping(uint256 => RWAAsset) public assets;
    mapping(bytes32 => EncryptedTransaction) public transactions;
    mapping(uint256 => AssetValuation[]) public valuationHistory;
    mapping(address => InvestorProfile) public investorProfiles;
    mapping(bytes32 => bool) public nullifierHashes;
    mapping(address => uint256[]) public ownerAssets;
    mapping(bytes32 => uint256[]) public assetsByType;
    mapping(address => bytes32[]) public investorTransactions;
    mapping(uint256 => bytes) public encryptedOwnership;
    mapping(bytes32 => bool) public authorizedJurisdictions;

    // Events
    event AssetTokenized(
        uint256 indexed tokenId,
        address indexed issuer,
        bytes32 indexed assetType,
        bytes encryptedValuation
    );
    
    event EncryptedTransfer(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        bytes32 transactionId,
        bytes encryptedPrice
    );
    
    event ValuationUpdated(
        uint256 indexed tokenId,
        address indexed appraiser,
        bytes encryptedValue,
        uint256 timestamp
    );
    
    event InvestorRegistered(
        address indexed investor,
        uint256 accreditationLevel,
        bytes32[] authorizedAssetTypes
    );
    
    event ComplianceCheck(
        uint256 indexed tokenId,
        address indexed investor,
        bool isCompliant
    );
    
    event AssetRedeemed(
        uint256 indexed tokenId,
        address indexed owner,
        bytes encryptedRedemptionValue
    );
    
    event AssetStatusChanged(
        uint256 indexed tokenId,
        AssetStatus oldStatus,
        AssetStatus newStatus
    );

    constructor(
        string memory name,
        string memory symbol,
        address _paymentToken
    ) ERC721(name, symbol) {
        paymentToken = PrivacyToken(_paymentToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
        
        _tokenIdCounter = 1;
    }

    /**
     * @dev Register an investor with KYC data
     */
    function registerInvestor(
        bytes calldata encryptedKYCData,
        uint256 accreditationLevel,
        bytes32[] calldata authorizedAssetTypes,
        bytes calldata kycProof,
        bytes32 nullifier
    ) external nonReentrant whenNotPaused {
        require(!nullifierHashes[nullifier], "Nullifier already used");
        require(_verifyKYCProof(msg.sender, encryptedKYCData, kycProof), "Invalid KYC proof");
        
        nullifierHashes[nullifier] = true;
        
        investorProfiles[msg.sender] = InvestorProfile({
            investor: msg.sender,
            encryptedKYCData: encryptedKYCData,
            accreditationLevel: accreditationLevel,
            authorizedAssetTypes: authorizedAssetTypes,
            isAccredited: accreditationLevel > 0,
            lastKYCUpdate: block.timestamp,
            complianceProof: kycProof
        });
        
        emit InvestorRegistered(msg.sender, accreditationLevel, authorizedAssetTypes);
    }

    /**
     * @dev Tokenize a real-world asset
     */
    function tokenizeAsset(
        bytes calldata encryptedValuation,
        bytes calldata encryptedMetadata,
        bytes32 assetType,
        bytes32 jurisdictionCode,
        bytes calldata issuanceProof,
        bytes32 nullifier
    ) external onlyRole(ISSUER_ROLE) nonReentrant whenNotPaused returns (uint256) {
        require(!nullifierHashes[nullifier], "Nullifier already used");
        require(authorizedJurisdictions[jurisdictionCode], "Jurisdiction not authorized");
        require(_verifyIssuanceProof(msg.sender, encryptedValuation, issuanceProof), "Invalid issuance proof");
        
        uint256 tokenId = _tokenIdCounter++;
        nullifierHashes[nullifier] = true;
        totalAssets++;
        
        // Mint the NFT
        _safeMint(msg.sender, tokenId);
        
        // Create asset record
        assets[tokenId] = RWAAsset({
            tokenId: tokenId,
            issuer: msg.sender,
            currentOwner: msg.sender,
            encryptedValuation: encryptedValuation,
            encryptedMetadata: encryptedMetadata,
            assetType: assetType,
            issuanceDate: block.timestamp,
            lastValuationUpdate: block.timestamp,
            status: AssetStatus.Active,
            transactionHistory: new bytes32[](0),
            complianceData: issuanceProof,
            isTransferable: true,
            jurisdictionCode: jurisdictionCode
        });
        
        // Update mappings
        ownerAssets[msg.sender].push(tokenId);
        assetsByType[assetType].push(tokenId);
        
        // Record minting transaction
        _recordTransaction(
            tokenId,
            address(0),
            msg.sender,
            encryptedValuation,
            TransactionType.Mint,
            issuanceProof,
            nullifier
        );
        
        emit AssetTokenized(tokenId, msg.sender, assetType, encryptedValuation);
        
        return tokenId;
    }

    /**
     * @dev Transfer asset with encrypted price
     */
    function encryptedTransfer(
        uint256 tokenId,
        address to,
        bytes calldata encryptedPrice,
        bytes calldata transferProof,
        bytes32 nullifier
    ) external nonReentrant whenNotPaused {
        require(!nullifierHashes[nullifier], "Nullifier already used");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(assets[tokenId].isTransferable, "Asset not transferable");
        require(_verifyTransferCompliance(tokenId, to, transferProof), "Transfer not compliant");
        
        nullifierHashes[nullifier] = true;
        
        // Update asset ownership
        assets[tokenId].currentOwner = to;
        
        // Remove from sender's assets
        _removeFromOwnerAssets(msg.sender, tokenId);
        
        // Add to receiver's assets
        ownerAssets[to].push(tokenId);
        
        // Record transaction
        bytes32 transactionId = _recordTransaction(
            tokenId,
            msg.sender,
            to,
            encryptedPrice,
            TransactionType.Transfer,
            transferProof,
            nullifier
        );
        
        // Transfer the NFT
        _transfer(msg.sender, to, tokenId);
        
        emit EncryptedTransfer(tokenId, msg.sender, to, transactionId, encryptedPrice);
    }

    /**
     * @dev Update asset valuation
     */
    function updateValuation(
        uint256 tokenId,
        bytes calldata encryptedValue,
        bytes calldata valuationProof
    ) external onlyRole(ORACLE_ROLE) nonReentrant whenNotPaused {
        require(_exists(tokenId), "Asset does not exist");
        require(_verifyValuationProof(tokenId, encryptedValue, valuationProof), "Invalid valuation proof");
        
        // Update asset valuation
        assets[tokenId].encryptedValuation = encryptedValue;
        assets[tokenId].lastValuationUpdate = block.timestamp;
        
        // Add to valuation history
        valuationHistory[tokenId].push(AssetValuation({
            tokenId: tokenId,
            encryptedValue: encryptedValue,
            appraiser: msg.sender,
            timestamp: block.timestamp,
            valuationProof: valuationProof,
            isVerified: true
        }));
        
        emit ValuationUpdated(tokenId, msg.sender, encryptedValue, block.timestamp);
    }

    /**
     * @dev Redeem asset (convert back to real-world asset)
     */
    function redeemAsset(
        uint256 tokenId,
        bytes calldata encryptedRedemptionValue,
        bytes calldata redemptionProof,
        bytes32 nullifier
    ) external nonReentrant whenNotPaused {
        require(!nullifierHashes[nullifier], "Nullifier already used");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(assets[tokenId].status == AssetStatus.Active, "Asset not active");
        require(_verifyRedemptionProof(tokenId, encryptedRedemptionValue, redemptionProof), "Invalid redemption proof");
        
        nullifierHashes[nullifier] = true;
        
        // Update asset status
        assets[tokenId].status = AssetStatus.Matured;
        
        // Record redemption transaction
        _recordTransaction(
            tokenId,
            msg.sender,
            address(0),
            encryptedRedemptionValue,
            TransactionType.Redemption,
            redemptionProof,
            nullifier
        );
        
        // Burn the NFT
        _burn(tokenId);
        
        // Remove from owner's assets
        _removeFromOwnerAssets(msg.sender, tokenId);
        
        totalAssets--;
        
        emit AssetRedeemed(tokenId, msg.sender, encryptedRedemptionValue);
    }

    /**
     * @dev Change asset status (admin only)
     */
    function changeAssetStatus(
        uint256 tokenId,
        AssetStatus newStatus,
        bytes calldata statusProof
    ) external onlyRole(ADMIN_ROLE) {
        require(_exists(tokenId), "Asset does not exist");
        require(_verifyStatusChangeProof(tokenId, newStatus, statusProof), "Invalid status change proof");
        
        AssetStatus oldStatus = assets[tokenId].status;
        assets[tokenId].status = newStatus;
        
        emit AssetStatusChanged(tokenId, oldStatus, newStatus);
    }

    /**
     * @dev Authorize jurisdiction
     */
    function authorizeJurisdiction(bytes32 jurisdictionCode) external onlyRole(ADMIN_ROLE) {
        authorizedJurisdictions[jurisdictionCode] = true;
    }

    /**
     * @dev Get asset details
     */
    function getAsset(uint256 tokenId) external view returns (RWAAsset memory) {
        require(_exists(tokenId), "Asset does not exist");
        return assets[tokenId];
    }

    /**
     * @dev Get owner's assets
     */
    function getOwnerAssets(address owner) external view returns (uint256[] memory) {
        return ownerAssets[owner];
    }

    /**
     * @dev Get assets by type
     */
    function getAssetsByType(bytes32 assetType) external view returns (uint256[] memory) {
        return assetsByType[assetType];
    }

    /**
     * @dev Get valuation history
     */
    function getValuationHistory(uint256 tokenId) external view returns (AssetValuation[] memory) {
        return valuationHistory[tokenId];
    }

    /**
     * @dev Get investor transactions
     */
    function getInvestorTransactions(address investor) external view returns (bytes32[] memory) {
        return investorTransactions[investor];
    }

    /**
     * @dev Compliance check for asset transfer
     */
    function checkTransferCompliance(
        uint256 tokenId,
        address to
    ) external view returns (bool) {
        return _verifyTransferCompliance(tokenId, to, "");
    }

    /**
     * @dev Audit asset for compliance
     */
    function auditAsset(uint256 tokenId) external onlyRole(AUDITOR_ROLE) returns (RWAAsset memory) {
        require(_exists(tokenId), "Asset does not exist");
        return assets[tokenId];
    }

    /**
     * @dev Audit transaction for compliance
     */
    function auditTransaction(bytes32 transactionId) external onlyRole(AUDITOR_ROLE) returns (EncryptedTransaction memory) {
        return transactions[transactionId];
    }

    /**
     * @dev Compliance decrypt for regulatory purposes
     */
    function complianceDecrypt(
        uint256 tokenId,
        bytes calldata decryptionKey
    ) external onlyRole(COMPLIANCE_ROLE) returns (uint256) {
        require(_exists(tokenId), "Asset does not exist");
        return _decryptAssetValue(tokenId, decryptionKey);
    }

    // Internal functions
    function _recordTransaction(
        uint256 tokenId,
        address from,
        address to,
        bytes calldata encryptedPrice,
        TransactionType txType,
        bytes calldata proof,
        bytes32 nullifier
    ) internal returns (bytes32) {
        bytes32 transactionId = keccak256(abi.encodePacked(
            tokenId,
            from,
            to,
            encryptedPrice,
            block.timestamp,
            nullifier
        ));
        
        transactions[transactionId] = EncryptedTransaction({
            transactionId: transactionId,
            tokenId: tokenId,
            from: from,
            to: to,
            encryptedPrice: encryptedPrice,
            timestamp: block.timestamp,
            txType: txType,
            zkProof: proof,
            nullifier: nullifier,
            isCompliant: true
        });
        
        // Add to asset transaction history
        assets[tokenId].transactionHistory.push(transactionId);
        
        // Add to investor transaction history
        if (from != address(0)) {
            investorTransactions[from].push(transactionId);
        }
        if (to != address(0)) {
            investorTransactions[to].push(transactionId);
        }
        
        return transactionId;
    }

    function _removeFromOwnerAssets(address owner, uint256 tokenId) internal {
        uint256[] storage assets = ownerAssets[owner];
        for (uint256 i = 0; i < assets.length; i++) {
            if (assets[i] == tokenId) {
                assets[i] = assets[assets.length - 1];
                assets.pop();
                break;
            }
        }
    }

    function _decryptAssetValue(uint256 tokenId, bytes calldata decryptionKey) internal view returns (uint256) {
        // Decrypt asset value for compliance purposes
        return 0; // Placeholder
    }

    // Verification functions (ZK proof verification)
    function _verifyKYCProof(address investor, bytes calldata kycData, bytes calldata proof) internal pure returns (bool) {
        // Verify KYC proof
        return true; // Placeholder
    }

    function _verifyIssuanceProof(address issuer, bytes calldata valuation, bytes calldata proof) internal pure returns (bool) {
        // Verify asset issuance proof
        return true; // Placeholder
    }

    function _verifyTransferCompliance(uint256 tokenId, address to, bytes calldata proof) internal view returns (bool) {
        // Verify transfer compliance (KYC, accreditation, etc.)
        InvestorProfile memory profile = investorProfiles[to];
        if (!profile.isAccredited) {
            return false;
        }
        
        // Check if investor is authorized for this asset type
        bytes32 assetType = assets[tokenId].assetType;
        for (uint256 i = 0; i < profile.authorizedAssetTypes.length; i++) {
            if (profile.authorizedAssetTypes[i] == assetType) {
                return true;
            }
        }
        
        return false;
    }

    function _verifyValuationProof(uint256 tokenId, bytes calldata value, bytes calldata proof) internal pure returns (bool) {
        // Verify valuation proof
        return true; // Placeholder
    }

    function _verifyRedemptionProof(uint256 tokenId, bytes calldata value, bytes calldata proof) internal pure returns (bool) {
        // Verify redemption proof
        return true; // Placeholder
    }

    function _verifyStatusChangeProof(uint256 tokenId, AssetStatus newStatus, bytes calldata proof) internal pure returns (bool) {
        // Verify status change proof
        return true; // Placeholder
    }

    /**
     * @dev Override transfer to include compliance checks
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        if (from != address(0) && to != address(0)) {
            require(_verifyTransferCompliance(tokenId, to, ""), "Transfer not compliant");
        }
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

    /**
     * @dev Support for ERC165
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}