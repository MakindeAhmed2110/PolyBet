# PolyBet 🎯 – Decentralized Prediction Market Platform

> **📢 Rebranding Notice**: This project has been rebranded to **Predikt**. While the smart contracts and technical infrastructure retain the original "PolyBet" naming for compatibility, the platform is now known as **Predikt** going forward.

![Somnia Network](https://img.shields.io/badge/Built%20On-Somnia%20Network-purple)
![Solidity](https://img.shields.io/badge/Built%20With-Solidity-orange)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black)
![Scaffold-ETH](https://img.shields.io/badge/Framework-Scaffold--ETH%202-blue)

---

## 🚩 Problem Statement

Traditional prediction markets face significant challenges that limit their adoption and effectiveness:

1. **Centralized Control** – Most platforms require trust in centralized operators for market creation, resolution, and fund management.
2. **Limited Liquidity** – Fragmented markets with poor liquidity make it difficult to trade positions or get fair prices.
3. **Opaque Resolution** – Market outcomes often depend on subjective decisions rather than verifiable data sources.
4. **High Barriers to Entry** – Complex interfaces and high fees prevent widespread participation.
5. **Cross-Chain Isolation** – Users are locked into single blockchain ecosystems, missing opportunities across different networks.

---

## 🟢 Solution

PolyBet delivers a comprehensive decentralized prediction market platform that addresses these core issues:

1. **Fully Decentralized Markets (Live)** – Smart contracts handle all market operations without centralized control.
2. **Automated Market Making (Live)** – Built-in liquidity pools with dynamic pricing based on market sentiment.
3. **Oracle-Based Resolution (Live)** – Transparent, verifiable market resolution using designated oracles.
4. **Multi-Role Ecosystem (Live)** – Separate interfaces for traders, liquidity providers, and market creators.
5. **Somnia Network Integration (Live)** – Native $SOMI token support with low fees and fast transactions.

<div align="center">
  <img src="packages/nextjs/public/polybet.png" alt="PolyBet Logo" width="400" height="400"/>
</div>

---

## 1️⃣ Why PolyBet?

Current prediction market platforms are either centralized (lacking transparency) or have poor user experience with limited functionality. PolyBet solves these issues by combining:

1. **Smart Contract Architecture** – All market logic is on-chain, ensuring transparency and eliminating counterparty risk.
2. **Automated Market Making** – Built-in liquidity pools provide continuous trading opportunities with fair pricing.
3. **Role-Based Access** – Separate interfaces optimized for different user types (traders, LPs, creators, oracles).
4. **Somnia Network Benefits** – Low fees, fast transactions, and native $SOMI token integration.
5. **Comprehensive Testing** – Extensive test suite ensures reliability and security.

---

## 2️⃣ Contract Overview

```text
packages/hardhat/contracts/
├── PolyBet.sol                 # Main prediction market contract (single contract for all markets)
├── PolyBetFactory.sol          # Factory for creating new markets
└── PolyBetRegistry.sol         # Registry for tracking all markets
```

### Core Contracts in Detail

| Contract            | Purpose                                                                      | Key Features                                                                                                                                                                                         |
| ------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PolyBet**         | Single contract managing all prediction markets with automated market making | • Dynamic pricing based on market sentiment<br>• Liquidity pool management<br>• Token trading (YES/NO)<br>• Oracle-based resolution<br>• Revenue distribution to LPs<br>• Market expiration handling |
| **PolyBetFactory**  | Creates and manages new prediction markets                                   | • Market creation with parameters<br>• Category management<br>• Market count tracking<br>• Event emission for frontend<br>• Parameter validation                                                     |
| **PolyBetRegistry** | Central registry for all markets in the ecosystem                            | • Market discovery and querying<br>• Creator and category filtering<br>• Pagination support<br>• Market statistics<br>• Factory integration                                                          |

### End-to-End Flow

1. **Market Creation** → Factory creates new market in PolyBet contract with specified parameters (question, category, expiration, initial liquidity).
2. **Liquidity Provision** → Users add ETH to market liquidity pools, earning trading fees proportional to their contribution.
3. **Trading** → Users buy YES/NO tokens using ETH, with prices determined by market sentiment and token supply.
4. **Oracle Resolution** → Designated oracles report market outcomes when events occur.
5. **Settlement** → Winning token holders can redeem tokens for ETH, losing tokens become worthless. LPs can claim accumulated trading revenue.

---

## 3️⃣ Pre-Deployed Contracts (Somnia Testnet)

- **Somnia Testnet (Chain ID: 50312)**

  - PolyBet: `0xcd21605198622F0ca7FE9AB8cB2181Ab401521f6` [verified](https://shannon-explorer.somnia.network/address/0xcd21605198622F0ca7FE9AB8cB2181Ab401521f6)
  - PolyBetFactory: `0xD1FF398e2F29a5cd988d90612A7c77211F7E19e2` [verified](https://shannon-explorer.somnia.network/address/0xD1FF398e2F29a5cd988d90612A7c77211F7E19e2)
  - PolyBetRegistry: `0x8121D32141119F9de7386e2742E2daF368B52F29` [verified](https://shannon-explorer.somnia.network/address/0x8121D32141119F9de7386e2742E2daF368B52F29)

---

## 4️⃣ Quick Start (Local Development)

```bash
# 0. Prerequisites
#    – Node.js ≥18
#    – Yarn package manager
#    – Git

# 1. Clone and install dependencies
$ git clone https://github.com/your-username/PolyBet
$ cd PolyBet
$ yarn install

# 2. Start local blockchain
$ yarn chain

# 3. Deploy contracts
$ yarn deploy

# 4. Start frontend
$ yarn start

# 5. Open browser
#    – Frontend: http://localhost:3000
#    – Debug page: http://localhost:3000/debug
```

---

## 5️⃣ Testing

The platform includes comprehensive tests covering all core functionality:

### Test Coverage

- **Factory Deployment** – Contract initialization and configuration
- **Market Creation** – Parameter validation and event emission
- **Registry Functionality** – Market tracking and querying
- **Market Operations** – Trading, liquidity, and resolution
- **Category Management** – Adding and managing market categories
- **Integration Tests** – End-to-end workflows

### Running Tests

```bash
# Run all tests
$ yarn test

# Run specific test file
$ yarn test PolyBet.ts

# Run with coverage
$ yarn test:coverage
```

---

## 6️⃣ Frontend Architecture

### Key Pages

| Page                   | Purpose                             | Key Features                                                                                      |
| ---------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Home**               | Landing page with platform overview | • Hero section<br>• Feature highlights<br>• Quick start guide                                     |
| **Markets**            | Browse and trade prediction markets | • Market listing with search<br>• Category filtering<br>• Real-time market data                   |
| **Create Market**      | Create new prediction markets       | • Market parameter input<br>• Liquidity provision<br>• Category selection                         |
| **Liquidity Provider** | Manage liquidity across markets     | • Add/remove liquidity<br>• Revenue tracking<br>• Market statistics<br>• LP revenue claiming      |
| **Oracle**             | Report market outcomes              | • Outcome reporting<br>• Market resolution<br>• Real-time oracle dashboard<br>• Market statistics |
| **User Dashboard**     | Personal trading overview           | • Position tracking<br>• Trading history<br>• Portfolio management                                |

### Key Components

- **MarketCard** – Displays market information and trading options
- **TradingInterface** – Buy/sell YES/NO tokens with real-time pricing
- **LiquidityManager** – Add/remove liquidity from markets with revenue tracking
- **OracleInterface** – Report market outcomes with validation
- **UserDashboard** – Personal trading overview and position management

---

## 7️⃣ Database Schema

The platform uses PostgreSQL with Prisma ORM for off-chain data:

```prisma
model Market {
  id                String      @id @default(cuid())
  address           String      @unique // Smart contract address
  question          String
  description       String?
  categoryId        String
  creatorAddress    String
  oracleAddress     String
  initialTokenValue String      // Stored as string to preserve precision
  initialYesProbability Int
  percentageToLock  Int
  expirationTime    DateTime
  initialLiquidity  String      // Stored as string to preserve precision

  // Market status
  status            MarketStatus @default(ACTIVE)
  isReported        Boolean     @default(false)
  winningOutcome    Outcome?
  resolvedAt        DateTime?

  // Statistics
  totalVolume       String      @default("0") // Total trading volume
  totalParticipants Int         @default(0)
  yesTokenPrice     String?     // Current YES token price
  noTokenPrice      String?     // Current NO token price

  // Timestamps
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  // Relations
  category          Category    @relation(fields: [categoryId], references: [id])
  trades            Trade[]
  liquidityEvents   LiquidityEvent[]
}

model Category {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  icon        String?  // Icon name or URL
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  markets Market[]
}

model Trade {
  id            String    @id @default(cuid())
  marketId      String
  userAddress   String
  outcome       Outcome
  amount        String    // Token amount
  price         String    // ETH price paid
  tradeType     TradeType // BUY or SELL
  txHash        String?   // Transaction hash
  blockNumber   BigInt?

  createdAt     DateTime  @default(now())

  // Relations
  market        Market    @relation(fields: [marketId], references: [id])
}

model LiquidityEvent {
  id            String    @id @default(cuid())
  marketId      String
  userAddress   String
  eventType     LiquidityEventType // ADD or REMOVE
  amount        String    // ETH amount
  tokenAmount   String    // Token amount
  txHash        String?   // Transaction hash
  blockNumber   BigInt?

  createdAt     DateTime  @default(now())

  // Relations
  market        Market    @relation(fields: [marketId], references: [id])
}

// Enums
enum MarketStatus {
  ACTIVE
  REPORTED
  RESOLVED
  EXPIRED
}

enum Outcome {
  YES
  NO
}

enum TradeType {
  BUY
  SELL
}

enum LiquidityEventType {
  ADD
  REMOVE
}
```

---

## 8️⃣ API Endpoints

### Markets API

```typescript
// Get all markets with filtering and pagination
GET /api/markets?page=1&limit=20&category=crypto&status=active&search=bitcoin&sortBy=createdAt&sortOrder=desc

// Get market by address
GET /api/markets/[address]

// Create new market
POST /api/markets
```

### Categories API

```typescript
// Get all categories
GET / api / categories

// Create new category
POST / api / categories
```

### Frontend Hooks

The platform uses React Query for data fetching with custom hooks:

```typescript
// Fetch markets with real-time updates
const {
  data: marketsData,
  isLoading,
  error,
} = useMarkets({
  category: 'crypto',
  status: 'active',
  search: 'bitcoin',
  sortBy: 'createdAt',
  sortOrder: 'desc',
})

// Fetch single market
const { data: market } = useMarket(marketAddress)
```

---

## 9️⃣ Project Roadmap

1. **Enhanced Oracle System**

   - Multiple oracle support for critical markets
   - Oracle reputation and staking mechanisms
   - Automated data feed integration
   - Oracle performance metrics and analytics

2. **Advanced Trading Features**

   - Limit orders and stop-loss functionality
   - Market depth visualization
   - Advanced charting and analytics
   - Trading history and portfolio tracking

3. **Improved User Experience**

   - Real-time notifications for market updates
   - Mobile-responsive design improvements
   - Advanced search and filtering
   - User profile and statistics

4. **Market Analytics**

   - Market performance metrics
   - Trading volume analytics
   - Liquidity provider statistics
   - Market prediction accuracy tracking

5. **Governance System**
   - Token-based governance for platform decisions
   - Community-driven feature proposals
   - Decentralized parameter management
   - Oracle selection and management

---

## 🔟 Contributing

We welcome contributions to PolyBet! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Code style and standards
- Testing requirements
- Pull request process
- Issue reporting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with ❤️ by the Predikt team</p>
