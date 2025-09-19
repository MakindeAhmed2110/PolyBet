import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import { ethers } from "hardhat";

/**
 * Deploys the PolyBet platform contracts using the deployer account
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployPolyBet: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` or `yarn account:import` to import your
    existing PK which will fill DEPLOYER_PRIVATE_KEY_ENCRYPTED in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Fixed oracle address for all markets
  const oracleAddress = "0x76005d75bFd086Cd986f93Ca871b826daE277025";

  console.log("🚀 Deploying PolyBet Platform...");
  console.log("📋 Deployer:", deployer);
  console.log("🔮 Oracle:", oracleAddress);

  // 1. Deploy PolyBetRegistry first (with zero address initially)
  console.log("\n📄 Deploying PolyBetRegistry...");
  await deploy("PolyBetRegistry", {
    from: deployer,
    args: [ethers.ZeroAddress], // Factory address will be set later
    log: true,
    autoMine: true,
  });

  const registry = await hre.ethers.getContract<Contract>("PolyBetRegistry", deployer);
  const registryAddress = await registry.getAddress();
  console.log("✅ PolyBetRegistry deployed to:", registryAddress);

  // 2. Deploy PolyBet main contract with registry address
  console.log("\n🎯 Deploying PolyBet...");
  await deploy("PolyBet", {
    from: deployer,
    args: [oracleAddress, registryAddress],
    log: true,
    autoMine: true,
  });

  const polyBet = await hre.ethers.getContract<Contract>("PolyBet", deployer);
  const polyBetAddress = await polyBet.getAddress();
  console.log("✅ PolyBet deployed to:", polyBetAddress);

  // 3. Deploy PolyBetFactory with all addresses
  console.log("\n🏭 Deploying PolyBetFactory...");
  await deploy("PolyBetFactory", {
    from: deployer,
    args: [oracleAddress, registryAddress, polyBetAddress],
    log: true,
    autoMine: true,
  });

  const factory = await hre.ethers.getContract<Contract>("PolyBetFactory", deployer);
  const factoryAddress = await factory.getAddress();
  console.log("✅ PolyBetFactory deployed to:", factoryAddress);

  // 4. Link Factory to Registry
  console.log("\n🔗 Linking Factory to Registry...");
  const setFactoryTx = await registry.setFactory(factoryAddress);
  await setFactoryTx.wait();
  console.log("✅ Factory linked to Registry");

  console.log("\n🎉 PolyBet Platform deployment complete!");
  console.log("🎯 PolyBet:", polyBetAddress);
  console.log("📊 Factory:", factoryAddress);
  console.log("📋 Registry:", registryAddress);
};

export default deployPolyBet;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags PolyBet
deployPolyBet.tags = ["PolyBet"];
