const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment of Privacy Platform contracts...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const deployedContracts = {};

  try {
    // 1. Deploy PrivacyToken (eERC20)
    console.log("\n📄 Deploying PrivacyToken...");
    const PrivacyToken = await ethers.getContractFactory("PrivacyToken");
    const privacyToken = await PrivacyToken.deploy(
      "Privacy Platform Token",
      "PPT",
      ethers.utils.parseEther("1000000") // 1M initial supply
    );
    await privacyToken.deployed();
    console.log("✅ PrivacyToken deployed to:", privacyToken.address);
    deployedContracts.PrivacyToken = privacyToken.address;

    // 2. Deploy ConfidentialLending
    console.log("\n🏦 Deploying ConfidentialLending...");
    const ConfidentialLending = await ethers.getContractFactory("ConfidentialLending");
    const confidentialLending = await ConfidentialLending.deploy(privacyToken.address);
    await confidentialLending.deployed();
    console.log("✅ ConfidentialLending deployed to:", confidentialLending.address);
    deployedContracts.ConfidentialLending = confidentialLending.address;

    // 3. Deploy PrivatePayroll
    console.log("\n💼 Deploying PrivatePayroll...");
    const PrivatePayroll = await ethers.getContractFactory("PrivatePayroll");
    const privatePayroll = await PrivatePayroll.deploy(privacyToken.address);
    await privatePayroll.deployed();
    console.log("✅ PrivatePayroll deployed to:", privatePayroll.address);
    deployedContracts.PrivatePayroll = privatePayroll.address;

    // 4. Deploy ConfidentialDAO
    console.log("\n🗳️  Deploying ConfidentialDAO...");
    const ConfidentialDAO = await ethers.getContractFactory("ConfidentialDAO");
    const confidentialDAO = await ConfidentialDAO.deploy(
      privacyToken.address,
      ethers.utils.parseEther("1000"), // Proposal threshold: 1000 tokens
      300, // Voting delay: 5 minutes (300 seconds)
      86400, // Voting period: 1 day
      172800, // Execution delay: 2 days
      10 // Quorum: 10%
    );
    await confidentialDAO.deployed();
    console.log("✅ ConfidentialDAO deployed to:", confidentialDAO.address);
    deployedContracts.ConfidentialDAO = confidentialDAO.address;

    // 5. Deploy RWATokenization
    console.log("\n🏠 Deploying RWATokenization...");
    const RWATokenization = await ethers.getContractFactory("RWATokenization");
    const rwaTokenization = await RWATokenization.deploy(
      "Privacy RWA Assets",
      "PRWA",
      privacyToken.address
    );
    await rwaTokenization.deployed();
    console.log("✅ RWATokenization deployed to:", rwaTokenization.address);
    deployedContracts.RWATokenization = rwaTokenization.address;

    // 6. Setup roles and permissions
    console.log("\n🔐 Setting up roles and permissions...");
    
    // Grant minter role to lending contract
    await privacyToken.grantRole(
      await privacyToken.MINTER_ROLE(),
      confidentialLending.address
    );
    console.log("✅ Granted MINTER_ROLE to ConfidentialLending");

    // Grant minter role to payroll contract
    await privacyToken.grantRole(
      await privacyToken.MINTER_ROLE(),
      privatePayroll.address
    );
    console.log("✅ Granted MINTER_ROLE to PrivatePayroll");

    // Grant proposer role to token holders in DAO
    await confidentialDAO.grantRole(
      await confidentialDAO.PROPOSER_ROLE(),
      deployer.address
    );
    console.log("✅ Granted PROPOSER_ROLE to deployer");

    // Authorize some jurisdictions for RWA
    const jurisdictions = [
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("US")),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EU")),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UK")),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SG"))
    ];
    
    for (const jurisdiction of jurisdictions) {
      await rwaTokenization.authorizeJurisdiction(jurisdiction);
    }
    console.log("✅ Authorized jurisdictions for RWA");

    // 7. Save deployment info
    const deploymentInfo = {
      network: await ethers.provider.getNetwork(),
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts,
      gasUsed: {
        PrivacyToken: (await privacyToken.deployTransaction.wait()).gasUsed.toString(),
        ConfidentialLending: (await confidentialLending.deployTransaction.wait()).gasUsed.toString(),
        PrivatePayroll: (await privatePayroll.deployTransaction.wait()).gasUsed.toString(),
        ConfidentialDAO: (await confidentialDAO.deployTransaction.wait()).gasUsed.toString(),
        RWATokenization: (await rwaTokenization.deployTransaction.wait()).gasUsed.toString()
      },
      configuration: {
        dao: {
          proposalThreshold: "1000",
          votingDelay: "300",
          votingPeriod: "86400",
          executionDelay: "172800",
          quorum: "10"
        },
        token: {
          name: "Privacy Platform Token",
          symbol: "PPT",
          initialSupply: "1000000"
        }
      }
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save deployment info
    const deploymentFile = path.join(deploymentsDir, `deployment-${deploymentInfo.network.chainId}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n📄 Deployment info saved to: ${deploymentFile}`);

    // Generate frontend config
    const frontendConfig = {
      contracts: deployedContracts,
      chainId: deploymentInfo.network.chainId,
      networkName: deploymentInfo.network.name
    };

    const frontendConfigFile = path.join(__dirname, "..", "src", "config", "contracts.json");
    const configDir = path.dirname(frontendConfigFile);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(frontendConfigFile, JSON.stringify(frontendConfig, null, 2));
    console.log(`📄 Frontend config saved to: ${frontendConfigFile}`);

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📋 Contract Addresses:");
    console.log("========================");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });

    console.log("\n🔗 Next Steps:");
    console.log("1. Update your .env file with the contract addresses");
    console.log("2. Verify contracts on block explorer if needed");
    console.log("3. Configure the frontend with the new addresses");
    console.log("4. Test the deployment with the provided test scripts");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main };