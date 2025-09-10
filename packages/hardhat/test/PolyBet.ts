import { expect } from "chai";
import { ethers } from "hardhat";
import { PolyBetFactory, PolyBetRegistry, PolyBet } from "../typechain-types";

describe("🎯 PolyBet Prediction Market Platform", function () {
  let factory: PolyBetFactory;
  let registry: PolyBetRegistry;
  let owner: any;
  let oracle: any;
  let user1: any;

  before(async () => {
    [owner, oracle, user1] = await ethers.getSigners();

    // Deploy Registry first with zero address
    const registryFactory = await ethers.getContractFactory("PolyBetRegistry");
    registry = (await registryFactory.deploy(ethers.ZeroAddress)) as PolyBetRegistry;
    await registry.waitForDeployment();
    const registryAddress = await registry.getAddress();

    // Deploy Factory with registry address
    const factoryFactory = await ethers.getContractFactory("PolyBetFactory");
    factory = (await factoryFactory.deploy(oracle.address, registryAddress)) as PolyBetFactory;
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();

    // Set factory in registry
    await registry.setFactory(factoryAddress);
  });

  describe("Factory Deployment", function () {
    it("Should have correct deployment addresses", async function () {
      const factoryAddress = await factory.getAddress();
      const registryAddress = await registry.getAddress();

      expect(factoryAddress).to.not.equal(ethers.ZeroAddress);
      expect(registryAddress).to.not.equal(ethers.ZeroAddress);
      expect(await registry.i_factory()).to.equal(factoryAddress);
      expect(await factory.i_registry()).to.equal(registryAddress);
    });

    it("Should have correct initial state", async function () {
      const factoryInfo = await factory.getFactoryInfo();
      expect(factoryInfo.oracle).to.equal(oracle.address);
      expect(factoryInfo.marketCount).to.equal(0);

      const registryStats = await registry.getRegistryStats();
      expect(registryStats.factory).to.equal(await factory.getAddress());
      expect(registryStats.totalMarkets).to.equal(0);
    });
  });

  describe("Market Creation", function () {
    it("Should create a new prediction market", async function () {
      const question = "Will ETH reach $5k by end of 2024?";
      const category = "crypto";
      const initialLiquidity = ethers.parseEther("0.1");
      const probability = 60;
      const percentageLocked = 10;
      const expirationDays = 30;
      const expirationTime = Math.floor(Date.now() / 1000) + expirationDays * 24 * 60 * 60;

      // Create market
      const createTx = await factory.createMarket(
        question,
        category,
        ethers.parseEther("0.01"), // token value
        probability,
        percentageLocked,
        expirationTime,
        { value: initialLiquidity },
      );

      await expect(createTx).to.emit(factory, "MarketCreated");

      // Check factory state
      expect(await factory.getMarketCount()).to.equal(1);

      // Check registry state
      const markets = await registry.getAllMarkets();
      expect(markets.length).to.equal(1);

      const registryStats = await registry.getRegistryStats();
      expect(registryStats.totalMarkets).to.equal(1);
      expect(registryStats.activeMarkets).to.equal(1);
    });

    it("Should revert on invalid parameters", async function () {
      // Invalid question (empty)
      await expect(
        factory.createMarket("", "crypto", ethers.parseEther("0.01"), 50, 10, Math.floor(Date.now() / 1000) + 86400, {
          value: ethers.parseEther("0.1"),
        }),
      ).to.be.reverted;

      // Invalid category (empty)
      await expect(
        factory.createMarket(
          "Will BTC moon?",
          "",
          ethers.parseEther("0.01"),
          50,
          10,
          Math.floor(Date.now() / 1000) + 86400,
          { value: ethers.parseEther("0.1") },
        ),
      ).to.be.reverted;

      // Invalid probability (< 1)
      await expect(
        factory.createMarket(
          "Will BTC moon?",
          "crypto",
          ethers.parseEther("0.01"),
          0,
          10,
          Math.floor(Date.now() / 1000) + 86400,
          { value: ethers.parseEther("0.1") },
        ),
      ).to.be.reverted;

      // Invalid expiration (too soon)
      await expect(
        factory.createMarket(
          "Will BTC moon?",
          "crypto",
          ethers.parseEther("0.01"),
          50,
          10,
          Math.floor(Date.now() / 1000) + 3600, // 1 hour
          { value: ethers.parseEther("0.1") },
        ),
      ).to.be.reverted;
    });

    it("Should add new categories", async function () {
      const newCategory = "weather";

      await expect(factory.addCategory(newCategory)).to.emit(factory, "CategoryAdded").withArgs(newCategory);

      const categories = await factory.getCategories();
      expect(categories).to.include(newCategory);
      expect(await factory.getCategoryCount()).to.equal(6); // 5 default + 1 new
    });
  });

  describe("Registry Functionality", function () {
    let marketAddress: string;

    before(async () => {
      // Get the first market address from registry
      const markets = await registry.getAllMarkets();
      marketAddress = markets[0];
    });

    it("Should store market metadata correctly", async function () {
      const marketInfo = await registry.getMarketInfo(marketAddress);

      expect(marketInfo.marketAddress).to.equal(marketAddress);
      expect(marketInfo.creator).to.equal(owner.address);
      expect(marketInfo.question).to.equal("Will ETH reach $5k by end of 2024?");
      expect(marketInfo.category).to.equal("crypto");
      expect(marketInfo.isActive).to.equal(true);
    });

    it("Should allow querying markets by creator", async function () {
      const creatorMarkets = await registry.getMarketsByCreator(owner.address);
      expect(creatorMarkets).to.include(marketAddress);
    });

    it("Should allow querying markets by category", async function () {
      const cryptoMarkets = await registry.getMarketsByCategory("crypto");
      expect(cryptoMarkets).to.include(marketAddress);
    });

    it("Should support paginated queries", async function () {
      const [markets, totalCount] = await registry.getMarketsPaginated(0, 10);
      expect(markets.length).to.equal(1);
      expect(totalCount).to.equal(1);
    });
  });

  describe("Market Functionality", function () {
    let market: PolyBet;
    let marketAddress: string;

    before(async () => {
      // Get the deployed market
      const markets = await registry.getAllMarkets();
      marketAddress = markets[0];
      market = await ethers.getContractAt("PolyBet", marketAddress);
    });

    it("Should have correct initial state", async function () {
      expect(await market.i_oracle()).to.equal(oracle.address);
      expect(await market.s_question()).to.equal("Will ETH reach $5k by end of 2024?");
      expect(await market.s_category()).to.equal("crypto");
      expect(await market.i_creator()).to.equal(owner.address);
      expect(await market.owner()).to.equal(owner.address);
    });

    it("Should have correct market status", async function () {
      const [status, isExpired, timeRemaining, canTrade] = await market.getMarketStatus();
      expect(status).to.equal(0); // MarketStatus.Active
      void expect(isExpired).to.be.false;
      void expect(timeRemaining).to.be.gt(0);
      void expect(canTrade).to.be.true;
    });

    it("Should allow liquidity addition", async function () {
      const initialCollateral = await market.s_ethCollateral();

      await expect(market.addLiquidity({ value: ethers.parseEther("0.05") })).to.emit(market, "LiquidityAdded");

      const finalCollateral = await market.s_ethCollateral();
      expect(finalCollateral).to.equal(initialCollateral + ethers.parseEther("0.05"));
    });

    it("Should allow token trading", async function () {
      // Get YES token
      const yesTokenAddress = await market.i_yesToken();
      const yesToken = await ethers.getContractAt("PolyBetToken", yesTokenAddress);

      // Check initial balances
      const initialUserBalance = await yesToken.balanceOf(user1.address);
      const initialContractBalance = await yesToken.balanceOf(await market.getAddress());

      // Calculate price and buy tokens
      const buyPrice = await market.getBuyPriceInEth(0, 1000); // Buy 1000 YES tokens
      await expect(market.connect(user1).buyTokensWithETH(0, 1000, { value: buyPrice })).to.emit(
        market,
        "TokensPurchased",
      );

      // Check balances after purchase
      const finalUserBalance = await yesToken.balanceOf(user1.address);
      const finalContractBalance = await yesToken.balanceOf(await market.getAddress());

      expect(finalUserBalance).to.equal(initialUserBalance + 1000n);
      expect(finalContractBalance).to.equal(initialContractBalance - 1000n);
    });

    it("Should allow oracle to report outcome", async function () {
      // Oracle reports outcome
      await expect(market.connect(oracle).report(0)) // Report YES
        .to.emit(market, "MarketReported");

      const [status, , ,] = await market.getMarketStatus();
      expect(status).to.equal(1); // MarketStatus.Reported
    });

    it("Should allow market resolution and withdrawal", async function () {
      const initialBalance = await ethers.provider.getBalance(owner.address);

      const tx = await market.resolveMarketAndWithdraw();
      const receipt = await tx.wait();

      const finalBalance = await ethers.provider.getBalance(owner.address);

      // Balance should increase (minus gas costs)
      expect(finalBalance + receipt!.gasUsed * receipt!.gasPrice).to.be.gt(initialBalance);

      const [status, , ,] = await market.getMarketStatus();
      expect(status).to.equal(2); // MarketStatus.Resolved
    });
  });

  describe("Category Management", function () {
    it("Should have default categories", async function () {
      const categories = await factory.getCategories();
      expect(categories).to.include("crypto");
      expect(categories).to.include("sports");
      expect(categories).to.include("politics");
      expect(categories).to.include("tech");
      expect(categories).to.include("other");
    });

    it("Should prevent duplicate categories", async function () {
      await expect(factory.addCategory("crypto")).to.be.reverted; // Should fail because category already exists
    });
  });

  describe("Integration Tests", function () {
    it("Should handle multiple market creation", async function () {
      // Create second market
      const createTx = await factory.createMarket(
        "Will it rain tomorrow?",
        "weather",
        ethers.parseEther("0.01"),
        30,
        10,
        Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
        { value: ethers.parseEther("0.05") },
      );

      await expect(createTx).to.emit(factory, "MarketCreated");

      // Check total markets
      expect(await factory.getMarketCount()).to.equal(2);

      const markets = await registry.getAllMarkets();
      expect(markets.length).to.equal(2);

      const registryStats = await registry.getRegistryStats();
      expect(registryStats.totalMarkets).to.equal(2);
    });

    it("Should support different market categories", async function () {
      const cryptoMarkets = await registry.getMarketsByCategory("crypto");
      const weatherMarkets = await registry.getMarketsByCategory("weather");

      expect(cryptoMarkets.length).to.equal(1);
      expect(weatherMarkets.length).to.equal(1);
    });
  });
});
