// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./PrivacyToken.sol";

/**
 * @title PrivatePayroll
 * @dev Privacy-preserving payroll system for enterprises
 * Enables confidential salary payments with encrypted amounts
 */
contract PrivatePayroll is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant HR_ROLE = keccak256("HR_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");

    PrivacyToken public immutable privacyToken;

    struct Employee {
        address employeeAddress;
        bytes encryptedSalary;
        bytes encryptedPosition;
        uint256 startDate;
        uint256 lastPayment;
        bool isActive;
        bytes32 employeeId;
        bytes zkProof;
    }

    struct PayrollBatch {
        bytes32 batchId;
        address employer;
        uint256 employeeCount;
        bytes encryptedTotalAmount;
        uint256 paymentDate;
        PayrollStatus status;
        bytes32[] employeeIds;
        mapping(bytes32 => bytes) encryptedIndividualAmounts;
    }

    struct Company {
        address companyAddress;
        string companyName;
        bytes encryptedPayrollBudget;
        uint256 employeeCount;
        bool isVerified;
        bytes32[] employeeIds;
        mapping(bytes32 => bool) authorizedHR;
    }

    enum PayrollStatus {
        Pending,
        Processing,
        Completed,
        Failed
    }

    // Mappings
    mapping(bytes32 => Employee) public employees;
    mapping(bytes32 => PayrollBatch) public payrollBatches;
    mapping(address => Company) public companies;
    mapping(address => bytes32[]) public employeesByAddress;
    mapping(bytes32 => address) public employeeIdToAddress;
    mapping(bytes32 => bool) public nullifierHashes;
    mapping(address => bytes) public encryptedEarnings;
    mapping(address => uint256) public lastWithdrawal;

    // Events
    event EmployeeRegistered(
        bytes32 indexed employeeId,
        address indexed employeeAddress,
        address indexed company,
        bytes encryptedSalary
    );
    
    event PayrollBatchCreated(
        bytes32 indexed batchId,
        address indexed company,
        uint256 employeeCount,
        bytes encryptedTotalAmount
    );
    
    event PayrollProcessed(
        bytes32 indexed batchId,
        bytes32 indexed employeeId,
        bytes encryptedAmount
    );
    
    event SalaryWithdrawn(
        address indexed employee,
        bytes encryptedAmount,
        uint256 timestamp
    );
    
    event EmployeeDeactivated(
        bytes32 indexed employeeId,
        address indexed company
    );
    
    event CompanyRegistered(
        address indexed company,
        string companyName
    );
    
    event HRAuthorized(
        address indexed company,
        address indexed hrAddress,
        bytes32 indexed employeeId
    );

    constructor(address _privacyToken) {
        privacyToken = PrivacyToken(_privacyToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
    }

    /**
     * @dev Register a company for payroll services
     */
    function registerCompany(
        string calldata companyName,
        bytes calldata encryptedBudget,
        bytes calldata verificationProof
    ) external {
        require(bytes(companyName).length > 0, "Invalid company name");
        require(!companies[msg.sender].isVerified, "Company already registered");
        require(_verifyCompanyProof(msg.sender, verificationProof), "Invalid verification proof");
        
        companies[msg.sender] = Company({
            companyAddress: msg.sender,
            companyName: companyName,
            encryptedPayrollBudget: encryptedBudget,
            employeeCount: 0,
            isVerified: true,
            employeeIds: new bytes32[](0)
        });
        
        emit CompanyRegistered(msg.sender, companyName);
    }

    /**
     * @dev Register an employee with encrypted salary
     */
    function registerEmployee(
        address employeeAddress,
        bytes calldata encryptedSalary,
        bytes calldata encryptedPosition,
        bytes calldata employeeProof,
        bytes32 nullifier
    ) external nonReentrant whenNotPaused {
        require(!nullifierHashes[nullifier], "Nullifier already used");
        require(companies[msg.sender].isVerified, "Company not verified");
        require(employeeAddress != address(0), "Invalid employee address");
        require(_verifyEmployeeProof(employeeAddress, encryptedSalary, employeeProof), "Invalid employee proof");
        
        bytes32 employeeId = keccak256(abi.encodePacked(
            employeeAddress,
            msg.sender,
            block.timestamp,
            nullifier
        ));
        
        nullifierHashes[nullifier] = true;
        
        employees[employeeId] = Employee({
            employeeAddress: employeeAddress,
            encryptedSalary: encryptedSalary,
            encryptedPosition: encryptedPosition,
            startDate: block.timestamp,
            lastPayment: 0,
            isActive: true,
            employeeId: employeeId,
            zkProof: employeeProof
        });
        
        // Update mappings
        employeesByAddress[employeeAddress].push(employeeId);
        employeeIdToAddress[employeeId] = employeeAddress;
        companies[msg.sender].employeeIds.push(employeeId);
        companies[msg.sender].employeeCount++;
        
        emit EmployeeRegistered(employeeId, employeeAddress, msg.sender, encryptedSalary);
    }

    /**
     * @dev Create a payroll batch for multiple employees
     */
    function createPayrollBatch(
        bytes32[] calldata employeeIds,
        bytes[] calldata encryptedAmounts,
        bytes calldata encryptedTotalAmount,
        bytes calldata batchProof,
        bytes32 nullifier
    ) external nonReentrant whenNotPaused {
        require(!nullifierHashes[nullifier], "Nullifier already used");
        require(companies[msg.sender].isVerified, "Company not verified");
        require(employeeIds.length == encryptedAmounts.length, "Array length mismatch");
        require(employeeIds.length > 0, "No employees in batch");
        require(_verifyBatchProof(msg.sender, encryptedTotalAmount, batchProof), "Invalid batch proof");
        
        bytes32 batchId = keccak256(abi.encodePacked(
            msg.sender,
            employeeIds,
            block.timestamp,
            nullifier
        ));
        
        nullifierHashes[nullifier] = true;
        
        // Create batch
        PayrollBatch storage batch = payrollBatches[batchId];
        batch.batchId = batchId;
        batch.employer = msg.sender;
        batch.employeeCount = employeeIds.length;
        batch.encryptedTotalAmount = encryptedTotalAmount;
        batch.paymentDate = block.timestamp;
        batch.status = PayrollStatus.Pending;
        batch.employeeIds = employeeIds;
        
        // Store individual amounts
        for (uint256 i = 0; i < employeeIds.length; i++) {
            require(employees[employeeIds[i]].isActive, "Employee not active");
            require(employees[employeeIds[i]].employeeAddress != address(0), "Invalid employee");
            batch.encryptedIndividualAmounts[employeeIds[i]] = encryptedAmounts[i];
        }
        
        emit PayrollBatchCreated(batchId, msg.sender, employeeIds.length, encryptedTotalAmount);
    }

    /**
     * @dev Process payroll batch (distribute payments)
     */
    function processPayrollBatch(
        bytes32 batchId,
        bytes calldata processingProof
    ) external nonReentrant whenNotPaused {
        PayrollBatch storage batch = payrollBatches[batchId];
        require(batch.employer == msg.sender, "Not the employer");
        require(batch.status == PayrollStatus.Pending, "Batch already processed");
        require(_verifyProcessingProof(batchId, processingProof), "Invalid processing proof");
        
        batch.status = PayrollStatus.Processing;
        
        // Process each employee payment
        for (uint256 i = 0; i < batch.employeeIds.length; i++) {
            bytes32 employeeId = batch.employeeIds[i];
            Employee storage employee = employees[employeeId];
            
            if (employee.isActive) {
                bytes memory encryptedAmount = batch.encryptedIndividualAmounts[employeeId];
                
                // Update employee's encrypted earnings
                _updateEncryptedEarnings(employee.employeeAddress, encryptedAmount);
                
                // Update last payment time
                employee.lastPayment = block.timestamp;
                
                emit PayrollProcessed(batchId, employeeId, encryptedAmount);
            }
        }
        
        batch.status = PayrollStatus.Completed;
    }

    /**
     * @dev Employee withdraws their salary
     */
    function withdrawSalary(
        bytes calldata encryptedAmount,
        bytes calldata withdrawProof,
        bytes32 nullifier
    ) external nonReentrant whenNotPaused {
        require(!nullifierHashes[nullifier], "Nullifier already used");
        require(_verifyWithdrawProof(msg.sender, encryptedAmount, withdrawProof), "Invalid withdraw proof");
        
        nullifierHashes[nullifier] = true;
        
        // Update encrypted earnings (subtract withdrawn amount)
        _updateEncryptedEarnings(msg.sender, encryptedAmount, false);
        
        // Transfer tokens to employee
        _transferEncryptedSalary(msg.sender, encryptedAmount);
        
        lastWithdrawal[msg.sender] = block.timestamp;
        
        emit SalaryWithdrawn(msg.sender, encryptedAmount, block.timestamp);
    }

    /**
     * @dev Deactivate an employee
     */
    function deactivateEmployee(
        bytes32 employeeId,
        bytes calldata deactivationProof
    ) external {
        require(companies[msg.sender].isVerified, "Company not verified");
        require(employees[employeeId].isActive, "Employee already inactive");
        require(_verifyDeactivationProof(employeeId, deactivationProof), "Invalid deactivation proof");
        
        employees[employeeId].isActive = false;
        companies[msg.sender].employeeCount--;
        
        emit EmployeeDeactivated(employeeId, msg.sender);
    }

    /**
     * @dev Authorize HR personnel
     */
    function authorizeHR(
        address hrAddress,
        bytes32 employeeId,
        bytes calldata authProof
    ) external {
        require(companies[msg.sender].isVerified, "Company not verified");
        require(_verifyHRAuthProof(hrAddress, authProof), "Invalid HR authorization proof");
        
        companies[msg.sender].authorizedHR[employeeId] = true;
        
        emit HRAuthorized(msg.sender, hrAddress, employeeId);
    }

    /**
     * @dev Get employee's encrypted earnings
     */
    function getEncryptedEarnings(address employee) external view returns (bytes memory) {
        return encryptedEarnings[employee];
    }

    /**
     * @dev Get company's employee count
     */
    function getCompanyEmployeeCount(address company) external view returns (uint256) {
        return companies[company].employeeCount;
    }

    /**
     * @dev Get employee IDs for an address
     */
    function getEmployeeIds(address employeeAddress) external view returns (bytes32[] memory) {
        return employeesByAddress[employeeAddress];
    }

    /**
     * @dev Get payroll batch employee IDs
     */
    function getBatchEmployeeIds(bytes32 batchId) external view returns (bytes32[] memory) {
        return payrollBatches[batchId].employeeIds;
    }

    /**
     * @dev Audit employee for compliance
     */
    function auditEmployee(bytes32 employeeId) external onlyRole(AUDITOR_ROLE) returns (Employee memory) {
        return employees[employeeId];
    }

    /**
     * @dev Audit payroll batch for compliance
     */
    function auditPayrollBatch(bytes32 batchId) external onlyRole(AUDITOR_ROLE) returns (
        bytes32,
        address,
        uint256,
        bytes memory,
        uint256,
        PayrollStatus
    ) {
        PayrollBatch storage batch = payrollBatches[batchId];
        return (
            batch.batchId,
            batch.employer,
            batch.employeeCount,
            batch.encryptedTotalAmount,
            batch.paymentDate,
            batch.status
        );
    }

    /**
     * @dev Compliance check for regulatory requirements
     */
    function complianceCheck(
        address company,
        bytes calldata decryptionKey
    ) external onlyRole(COMPLIANCE_ROLE) returns (uint256) {
        // This would decrypt the payroll budget for compliance purposes
        return _decryptPayrollBudget(company, decryptionKey);
    }

    // Internal functions
    function _updateEncryptedEarnings(address employee, bytes memory amount) internal {
        _updateEncryptedEarnings(employee, amount, true);
    }

    function _updateEncryptedEarnings(address employee, bytes memory amount, bool isAddition) internal {
        if (isAddition) {
            encryptedEarnings[employee] = abi.encode(
                encryptedEarnings[employee],
                amount,
                "add"
            );
        } else {
            encryptedEarnings[employee] = abi.encode(
                encryptedEarnings[employee],
                amount,
                "sub"
            );
        }
    }

    function _transferEncryptedSalary(address employee, bytes memory amount) internal {
        // This would integrate with the PrivacyToken contract for encrypted transfers
        // Placeholder for actual implementation
    }

    function _decryptPayrollBudget(address company, bytes calldata decryptionKey) internal view returns (uint256) {
        // Decrypt payroll budget for compliance purposes
        return 0; // Placeholder
    }

    // Verification functions (ZK proof verification)
    function _verifyCompanyProof(address company, bytes calldata proof) internal pure returns (bool) {
        // Verify company registration proof
        return true; // Placeholder
    }

    function _verifyEmployeeProof(address employee, bytes calldata salary, bytes calldata proof) internal pure returns (bool) {
        // Verify employee registration proof
        return true; // Placeholder
    }

    function _verifyBatchProof(address company, bytes calldata totalAmount, bytes calldata proof) internal view returns (bool) {
        // Verify payroll batch proof
        return true; // Placeholder
    }

    function _verifyProcessingProof(bytes32 batchId, bytes calldata proof) internal view returns (bool) {
        // Verify batch processing proof
        return true; // Placeholder
    }

    function _verifyWithdrawProof(address employee, bytes calldata amount, bytes calldata proof) internal view returns (bool) {
        // Verify withdrawal proof
        return true; // Placeholder
    }

    function _verifyDeactivationProof(bytes32 employeeId, bytes calldata proof) internal view returns (bool) {
        // Verify employee deactivation proof
        return true; // Placeholder
    }

    function _verifyHRAuthProof(address hrAddress, bytes calldata proof) internal pure returns (bool) {
        // Verify HR authorization proof
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