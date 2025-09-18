//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract PolyBet is Ownable {
    /////////////////
    /// Errors //////
    /////////////////

    error PolyBet__MustProvideETHForInitialLiquidity();
    error PolyBet__InvalidProbability();
    error PolyBet__PredictionAlreadyReported();
    error PolyBet__OnlyOracleCanReport();
    error PolyBet__OwnerCannotCall();
    error PolyBet__PredictionNotReported();
    error PolyBet__InsufficientWinningTokens();
    error PolyBet__AmountMustBeGreaterThanZero();
    error PolyBet__MustSendExactETHAmount();
    error PolyBet__InsufficientTokenReserve(Outcome _outcome, uint256 _amountToken);
    error PolyBet__TokenTransferFailed();
    error PolyBet__ETHTransferFailed();
    error PolyBet__InsufficientBalance(uint256 _tradingAmount, uint256 _userBalance);
    error PolyBet__InsufficientAllowance(uint256 _tradingAmount, uint256 _allowance);
    error PolyBet__InsufficientLiquidity();
    error PolyBet__InvalidPercentageToLock();
    error PolyBet__MarketExpired();
    error PolyBet__MarketNotActive();
    error PolyBet__MarketNotFound();
    error PolyBet__InvalidMarketId();

    //////////////////////////
    /// State Variables //////
    //////////////////////////

    address public immutable i_oracle;
    address public immutable i_registry;

    struct Market {
        uint256 marketAddress;
        address creator;
        string question;
        string category;
        uint256 initialTokenValue;
        uint8 initialYesProbability;
        uint8 percentageLocked;
        uint256 expirationTime;
        uint256 ethCollateral;
        uint256 yesTokenSupply;
        uint256 noTokenSupply;
        MarketStatus status;
        bool isReported;
        uint8 winningOutcome; // 0 = YES, 1 = NO
        uint256 lpTradingRevenue;
    }

    struct UserBalance {
        uint256 yesTokens;
        uint256 noTokens;
    }

    struct LiquidityInfo {
        uint256 contribution;
        uint256 totalLiquidity;
        uint256 accumulatedRevenue; // Track LP's share of trading revenue
        uint256 lastRevenuePerLiquidityUnit; // Track last revenue per unit when user's revenue was updated
    }

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => UserBalance)) public userBalances;
    mapping(uint256 => mapping(address => LiquidityInfo)) public liquidityContributions;
    mapping(uint256 => uint256) public totalMarketLiquidity; // Track total liquidity per market
    mapping(uint256 => uint256) public revenuePerLiquidityUnit; // Track revenue per unit of liquidity
    mapping(address => uint256[]) public userMarkets;
    mapping(string => uint256[]) public categoryMarkets;

    uint256 public marketCount;

    enum Outcome {
        YES,
        NO
    }

    enum MarketStatus {
        Active,
        Reported,
        Resolved,
        Expired
    }

    uint256 private constant PRECISION = 1e18;

    /// Checkpoint 2 ///

    /// Checkpoint 3 ///

    /// Checkpoint 5 ///

    /////////////////////////
    /// Events //////
    /////////////////////////

    event MarketCreated(
        uint256 indexed marketAddress,
        address indexed creator,
        string question,
        string category,
        uint256 initialLiquidity
    );
    event TokensPurchased(
        uint256 indexed marketAddress,
        address indexed buyer,
        Outcome outcome,
        uint256 amount,
        uint256 ethAmount
    );
    event TokensSold(
        uint256 indexed marketAddress,
        address indexed seller,
        Outcome outcome,
        uint256 amount,
        uint256 ethAmount
    );
    event WinningTokensRedeemed(
        uint256 indexed marketAddress,
        address indexed redeemer,
        uint256 amount,
        uint256 ethAmount
    );
    event MarketReported(uint256 indexed marketAddress, address indexed oracle, Outcome winningOutcome);
    event MarketResolved(uint256 indexed marketAddress, address indexed resolver, uint256 totalEthToSend);
    event LiquidityAdded(
        uint256 indexed marketAddress,
        address indexed provider,
        uint256 ethAmount,
        uint256 tokensAmount
    );
    event LiquidityRemoved(
        uint256 indexed marketAddress,
        address indexed provider,
        uint256 ethAmount,
        uint256 tokensAmount
    );
    event LPRevenueClaimed(uint256 indexed marketAddress, address indexed provider, uint256 revenueAmount);
    event MarketExpired(uint256 indexed marketAddress, uint256 expirationTime);

    /////////////////
    /// Modifiers ///
    /////////////////

    modifier marketExists(uint256 _marketAddress) {
        if (_marketAddress >= marketCount) {
            revert PolyBet__MarketNotFound();
        }
        _;
    }

    modifier predictionNotReported(uint256 _marketAddress) {
        Market storage market = markets[_marketAddress];
        if (market.isReported || market.status == MarketStatus.Reported || market.status == MarketStatus.Resolved) {
            revert PolyBet__PredictionAlreadyReported();
        }
        _;
    }

    modifier predictionReported(uint256 _marketAddress) {
        Market storage market = markets[_marketAddress];
        if (!market.isReported && market.status != MarketStatus.Reported && market.status != MarketStatus.Resolved) {
            revert PolyBet__PredictionNotReported();
        }
        _;
    }

    modifier marketActive(uint256 _marketAddress) {
        Market storage market = markets[_marketAddress];
        if (market.status != MarketStatus.Active) {
            revert PolyBet__MarketNotActive();
        }
        if (block.timestamp >= market.expirationTime) {
            revert PolyBet__MarketExpired();
        }
        _;
    }

    modifier notExpired(uint256 _marketAddress) {
        Market storage market = markets[_marketAddress];
        if (block.timestamp >= market.expirationTime) {
            revert PolyBet__MarketExpired();
        }
        _;
    }

    modifier notOwner(uint256 _marketAddress) {
        Market storage market = markets[_marketAddress];
        if (msg.sender == market.creator) {
            revert PolyBet__OwnerCannotCall();
        }
        _;
    }

    modifier amountGreaterThanZero(uint256 _amount) {
        if (_amount == 0) {
            revert PolyBet__AmountMustBeGreaterThanZero();
        }
        _;
    }

    //////////////////
    ////Constructor///
    //////////////////

    constructor(address _oracle, address _registry) Ownable(msg.sender) {
        i_oracle = _oracle;
        i_registry = _registry;
    }

    /////////////////
    /// Functions ///
    /////////////////

    /**
     * @notice Create a new prediction market
     * @param _question The prediction question
     * @param _category The market category
     * @param _initialTokenValue Initial token value in wei
     * @param _initialYesProbability Initial probability for YES outcome (1-99)
     * @param _percentageToLock Percentage of tokens to lock for liquidity provider (1-99)
     * @param _expirationTime Timestamp when market expires
     * @return marketAddress The address of the newly created market
     */
    function createMarket(
        string memory _question,
        string memory _category,
        uint256 _initialTokenValue,
        uint8 _initialYesProbability,
        uint8 _percentageToLock,
        uint256 _expirationTime
    ) external payable returns (uint256 marketAddress) {
        if (msg.value == 0) {
            revert PolyBet__MustProvideETHForInitialLiquidity();
        }
        if (_initialYesProbability >= 100 || _initialYesProbability == 0) {
            revert PolyBet__InvalidProbability();
        }
        if (_percentageToLock >= 100 || _percentageToLock == 0) {
            revert PolyBet__InvalidPercentageToLock();
        }
        if (_expirationTime <= block.timestamp) {
            revert PolyBet__MarketExpired();
        }

        marketAddress = marketCount++;

        uint256 initialTokenAmount = (msg.value * PRECISION) / _initialTokenValue;
        uint256 yesLocked = (initialTokenAmount * _initialYesProbability * _percentageToLock * 2) / 10000;
        uint256 noLocked = (initialTokenAmount * (100 - _initialYesProbability) * _percentageToLock * 2) / 10000;

        markets[marketAddress] = Market({
            marketAddress: marketAddress,
            creator: msg.sender,
            question: _question,
            category: _category,
            initialTokenValue: _initialTokenValue,
            initialYesProbability: _initialYesProbability,
            percentageLocked: _percentageToLock,
            expirationTime: _expirationTime,
            ethCollateral: msg.value,
            yesTokenSupply: initialTokenAmount - yesLocked,
            noTokenSupply: initialTokenAmount - noLocked,
            status: MarketStatus.Active,
            isReported: false,
            winningOutcome: 0,
            lpTradingRevenue: 0
        });

        userBalances[marketAddress][msg.sender] = UserBalance({ yesTokens: yesLocked, noTokens: noLocked });

        // Initialize liquidity tracking
        liquidityContributions[marketAddress][msg.sender] = LiquidityInfo({
            contribution: msg.value,
            totalLiquidity: msg.value,
            accumulatedRevenue: 0,
            lastRevenuePerLiquidityUnit: 0
        });
        totalMarketLiquidity[marketAddress] = msg.value;

        userMarkets[msg.sender].push(marketAddress);
        categoryMarkets[_category].push(marketAddress);

        emit MarketCreated(marketAddress, msg.sender, _question, _category, msg.value);
    }

    function addLiquidity(
        uint256 _marketAddress
    ) external payable marketExists(_marketAddress) predictionNotReported(_marketAddress) marketActive(_marketAddress) {
        Market storage market = markets[_marketAddress];

        // Update user's accumulated revenue before adding new liquidity
        _updateUserAccumulatedRevenue(_marketAddress, msg.sender);

        // Distribute existing trading revenue proportionally before adding new liquidity
        if (market.lpTradingRevenue > 0 && totalMarketLiquidity[_marketAddress] > 0) {
            _distributeTradingRevenue(_marketAddress);
        }

        market.ethCollateral += msg.value;

        LiquidityInfo storage liqInfo = liquidityContributions[_marketAddress][msg.sender];
        liqInfo.contribution += msg.value;
        liqInfo.totalLiquidity += msg.value;
        totalMarketLiquidity[_marketAddress] += msg.value;

        uint256 tokensAmount = (msg.value * PRECISION) / market.initialTokenValue;
        market.yesTokenSupply += tokensAmount;
        market.noTokenSupply += tokensAmount;

        emit LiquidityAdded(_marketAddress, msg.sender, msg.value, tokensAmount);
    }

    function removeLiquidity(
        uint256 _marketAddress,
        uint256 _ethToWithdraw
    ) external marketExists(_marketAddress) predictionNotReported(_marketAddress) marketActive(_marketAddress) {
        Market storage market = markets[_marketAddress];
        LiquidityInfo storage liqInfo = liquidityContributions[_marketAddress][msg.sender];

        if (_ethToWithdraw > liqInfo.contribution) {
            revert PolyBet__InsufficientBalance(_ethToWithdraw, liqInfo.contribution);
        }

        if (_ethToWithdraw > market.ethCollateral) {
            revert PolyBet__InsufficientLiquidity();
        }

        // Update user's accumulated revenue before removing liquidity
        _updateUserAccumulatedRevenue(_marketAddress, msg.sender);

        // Distribute existing trading revenue proportionally before removing liquidity
        if (market.lpTradingRevenue > 0 && totalMarketLiquidity[_marketAddress] > 0) {
            _distributeTradingRevenue(_marketAddress);
        }

        uint256 amountTokenToBurn = (_ethToWithdraw * PRECISION) / market.initialTokenValue;

        if (amountTokenToBurn > market.yesTokenSupply) {
            revert PolyBet__InsufficientTokenReserve(Outcome.YES, amountTokenToBurn);
        }

        if (amountTokenToBurn > market.noTokenSupply) {
            revert PolyBet__InsufficientTokenReserve(Outcome.NO, amountTokenToBurn);
        }

        // Calculate proportional revenue share
        uint256 revenueShare = (liqInfo.accumulatedRevenue * _ethToWithdraw) / liqInfo.contribution;
        uint256 totalToWithdraw = _ethToWithdraw + revenueShare;

        liqInfo.contribution -= _ethToWithdraw;
        liqInfo.totalLiquidity -= _ethToWithdraw;
        liqInfo.accumulatedRevenue -= revenueShare;
        // Keep lastRevenuePerLiquidityUnit the same since we're only removing liquidity, not changing the revenue tracking
        totalMarketLiquidity[_marketAddress] -= _ethToWithdraw;
        market.ethCollateral -= _ethToWithdraw;
        market.yesTokenSupply -= amountTokenToBurn;
        market.noTokenSupply -= amountTokenToBurn;

        (bool success, ) = msg.sender.call{ value: totalToWithdraw }("");
        if (!success) {
            revert PolyBet__ETHTransferFailed();
        }

        emit LiquidityRemoved(_marketAddress, msg.sender, totalToWithdraw, amountTokenToBurn);
    }

    /**
     * @notice Report the winning outcome for the prediction
     * @dev Only the oracle can report the winning outcome and only if the prediction is not reported
     * @param _marketAddress The market ID
     * @param _winningOutcome The winning outcome (YES or NO)
     */
    function report(
        uint256 _marketAddress,
        Outcome _winningOutcome
    ) external marketExists(_marketAddress) predictionNotReported(_marketAddress) marketActive(_marketAddress) {
        if (msg.sender != i_oracle) {
            revert PolyBet__OnlyOracleCanReport();
        }
        Market storage market = markets[_marketAddress];
        market.winningOutcome = _winningOutcome == Outcome.YES ? 0 : 1;
        market.isReported = true;
        market.status = MarketStatus.Reported;
        emit MarketReported(_marketAddress, msg.sender, _winningOutcome);
    }

    /**
     * @notice Creator can redeem winning tokens and get ETH from the contract including LP revenue and collateral back
     * @dev Only callable by the market creator and only if the prediction is resolved
     * @param _marketAddress The market ID
     * @return ethRedeemed The amount of ETH redeemed
     */
    function resolveMarketAndWithdraw(
        uint256 _marketAddress
    ) external marketExists(_marketAddress) predictionReported(_marketAddress) returns (uint256 ethRedeemed) {
        Market storage market = markets[_marketAddress];
        if (msg.sender != market.creator) {
            revert PolyBet__OnlyOracleCanReport(); // Reuse error for unauthorized access
        }

        // Update creator's accumulated revenue before resolution
        _updateUserAccumulatedRevenue(_marketAddress, msg.sender);

        // Distribute trading revenue proportionally before resolution
        if (market.lpTradingRevenue > 0 && totalMarketLiquidity[_marketAddress] > 0) {
            _distributeTradingRevenue(_marketAddress);
        }

        uint256 contractWinningTokens = market.winningOutcome == 0 ? market.yesTokenSupply : market.noTokenSupply;
        if (contractWinningTokens > 0) {
            ethRedeemed = (contractWinningTokens * market.initialTokenValue) / PRECISION;

            if (ethRedeemed > market.ethCollateral) {
                ethRedeemed = market.ethCollateral;
            }

            market.ethCollateral -= ethRedeemed;
        }

        // Only send the creator's share of trading revenue (their accumulated revenue)
        LiquidityInfo storage creatorLiqInfo = liquidityContributions[_marketAddress][msg.sender];
        uint256 creatorRevenueShare = creatorLiqInfo.accumulatedRevenue;
        creatorLiqInfo.accumulatedRevenue = 0; // Reset creator's accumulated revenue

        uint256 totalEthToSend = ethRedeemed + creatorRevenueShare;

        // Burn winning tokens
        if (market.winningOutcome == 0) {
            market.yesTokenSupply = 0;
        } else {
            market.noTokenSupply = 0;
        }

        (bool success, ) = msg.sender.call{ value: totalEthToSend }("");
        if (!success) {
            revert PolyBet__ETHTransferFailed();
        }

        market.status = MarketStatus.Resolved;
        emit MarketResolved(_marketAddress, msg.sender, totalEthToSend);

        return ethRedeemed;
    }

    /**
     * @notice Expire market if time has passed (anyone can call)
     * @param _marketAddress The market ID
     */
    function expireMarket(uint256 _marketAddress) external marketExists(_marketAddress) {
        Market storage market = markets[_marketAddress];
        if (block.timestamp < market.expirationTime || market.status != MarketStatus.Active) {
            revert PolyBet__MarketNotActive();
        }

        market.status = MarketStatus.Expired;
        emit MarketExpired(_marketAddress, market.expirationTime);
    }

    /**
     * @notice Buy prediction outcome tokens with ETH
     * @param _marketAddress The market ID
     * @param _outcome The possible outcome (YES or NO) to buy tokens for
     * @param _amountTokenToBuy Amount of tokens to purchase
     */
    function buyTokensWithETH(
        uint256 _marketAddress,
        Outcome _outcome,
        uint256 _amountTokenToBuy
    )
        external
        payable
        marketExists(_marketAddress)
        amountGreaterThanZero(_amountTokenToBuy)
        predictionNotReported(_marketAddress)
        notOwner(_marketAddress)
        marketActive(_marketAddress)
    {
        Market storage market = markets[_marketAddress];

        uint256 ethNeeded = getBuyPriceInEth(_marketAddress, _outcome, _amountTokenToBuy);
        if (msg.value != ethNeeded) {
            revert PolyBet__MustSendExactETHAmount();
        }

        if (_outcome == Outcome.YES) {
            if (_amountTokenToBuy > market.yesTokenSupply) {
                revert PolyBet__InsufficientTokenReserve(_outcome, _amountTokenToBuy);
            }
            market.yesTokenSupply -= _amountTokenToBuy;
            userBalances[_marketAddress][msg.sender].yesTokens += _amountTokenToBuy;
        } else {
            if (_amountTokenToBuy > market.noTokenSupply) {
                revert PolyBet__InsufficientTokenReserve(_outcome, _amountTokenToBuy);
            }
            market.noTokenSupply -= _amountTokenToBuy;
            userBalances[_marketAddress][msg.sender].noTokens += _amountTokenToBuy;
        }

        // Distribute trading revenue proportionally to all LPs
        if (totalMarketLiquidity[_marketAddress] > 0) {
            _distributeTradingRevenue(_marketAddress, msg.value);
        } else {
            market.lpTradingRevenue += msg.value;
        }
        emit TokensPurchased(_marketAddress, msg.sender, _outcome, _amountTokenToBuy, msg.value);
    }

    /**
     * @notice Sell prediction outcome tokens for ETH
     * @param _marketAddress The market ID
     * @param _outcome The possible outcome (YES or NO) to sell tokens for
     * @param _tradingAmount The amount of tokens to sell
     */
    function sellTokensForEth(
        uint256 _marketAddress,
        Outcome _outcome,
        uint256 _tradingAmount
    )
        external
        marketExists(_marketAddress)
        amountGreaterThanZero(_tradingAmount)
        predictionNotReported(_marketAddress)
        notOwner(_marketAddress)
        marketActive(_marketAddress)
    {
        Market storage market = markets[_marketAddress];
        UserBalance storage userBalance = userBalances[_marketAddress][msg.sender];

        uint256 userTokenBalance = _outcome == Outcome.YES ? userBalance.yesTokens : userBalance.noTokens;
        if (userTokenBalance < _tradingAmount) {
            revert PolyBet__InsufficientBalance(_tradingAmount, userTokenBalance);
        }

        uint256 ethToReceive = getSellPriceInEth(_marketAddress, _outcome, _tradingAmount);

        if (ethToReceive > market.lpTradingRevenue) {
            revert PolyBet__InsufficientLiquidity();
        }

        market.lpTradingRevenue -= ethToReceive;

        if (_outcome == Outcome.YES) {
            userBalance.yesTokens -= _tradingAmount;
            market.yesTokenSupply += _tradingAmount;
        } else {
            userBalance.noTokens -= _tradingAmount;
            market.noTokenSupply += _tradingAmount;
        }

        (bool sent, ) = msg.sender.call{ value: ethToReceive }("");
        if (!sent) {
            revert PolyBet__ETHTransferFailed();
        }

        emit TokensSold(_marketAddress, msg.sender, _outcome, _tradingAmount, ethToReceive);
    }

    /**
     * @notice Redeem winning tokens for ETH after prediction is resolved
     * @dev Only if the prediction is resolved
     * @param _marketAddress The market ID
     * @param _amount The amount of winning tokens to redeem
     */
    function redeemWinningTokens(
        uint256 _marketAddress,
        uint256 _amount
    )
        external
        marketExists(_marketAddress)
        amountGreaterThanZero(_amount)
        predictionReported(_marketAddress)
        notOwner(_marketAddress)
    {
        Market storage market = markets[_marketAddress];
        UserBalance storage userBalance = userBalances[_marketAddress][msg.sender];

        uint256 userWinningTokens = market.winningOutcome == 0 ? userBalance.yesTokens : userBalance.noTokens;
        if (userWinningTokens < _amount) {
            revert PolyBet__InsufficientWinningTokens();
        }

        uint256 ethToReceive = (_amount * market.initialTokenValue) / PRECISION;

        if (ethToReceive > market.ethCollateral) {
            ethToReceive = market.ethCollateral;
        }

        market.ethCollateral -= ethToReceive;

        if (market.winningOutcome == 0) {
            userBalance.yesTokens -= _amount;
        } else {
            userBalance.noTokens -= _amount;
        }

        (bool success, ) = msg.sender.call{ value: ethToReceive }("");
        if (!success) {
            revert PolyBet__ETHTransferFailed();
        }

        emit WinningTokensRedeemed(_marketAddress, msg.sender, _amount, ethToReceive);
    }

    /**
     * @notice Calculate the total ETH price for buying tokens
     * @param _marketAddress The market ID
     * @param _outcome The possible outcome (YES or NO) to buy tokens for
     * @param _tradingAmount The amount of tokens to buy
     * @return The total ETH price
     */
    function getBuyPriceInEth(
        uint256 _marketAddress,
        Outcome _outcome,
        uint256 _tradingAmount
    ) public view marketExists(_marketAddress) returns (uint256) {
        return _calculatePriceInEth(_marketAddress, _outcome, _tradingAmount, false);
    }

    /**
     * @notice Calculate the total ETH price for selling tokens
     * @param _marketAddress The market ID
     * @param _outcome The possible outcome (YES or NO) to sell tokens for
     * @param _tradingAmount The amount of tokens to sell
     * @return The total ETH price
     */
    function getSellPriceInEth(
        uint256 _marketAddress,
        Outcome _outcome,
        uint256 _tradingAmount
    ) public view marketExists(_marketAddress) returns (uint256) {
        return _calculatePriceInEth(_marketAddress, _outcome, _tradingAmount, true);
    }

    /////////////////////////
    /// Helper Functions ///
    ////////////////////////

    /**
     * @dev Internal helper to calculate ETH price for both buying and selling
     * @param _marketAddress The market ID
     * @param _outcome The possible outcome (YES or NO)
     * @param _tradingAmount The amount of tokens
     * @param _isSelling Whether this is a sell calculation
     */
    function _calculatePriceInEth(
        uint256 _marketAddress,
        Outcome _outcome,
        uint256 _tradingAmount,
        bool _isSelling
    ) private view returns (uint256) {
        Market storage market = markets[_marketAddress];
        (uint256 currentTokenReserve, uint256 currentOtherTokenReserve) = _getCurrentReserves(_marketAddress, _outcome);

        /// Ensure sufficient liquidity when buying
        if (!_isSelling) {
            if (currentTokenReserve < _tradingAmount) {
                revert PolyBet__InsufficientLiquidity();
            }
        }

        uint256 totalTokenSupply = market.yesTokenSupply + market.noTokenSupply;

        /// Before trade
        uint256 currentTokenSoldBefore = totalTokenSupply - currentTokenReserve;
        uint256 currentOtherTokenSold = totalTokenSupply - currentOtherTokenReserve;

        uint256 totalTokensSoldBefore = currentTokenSoldBefore + currentOtherTokenSold;
        uint256 probabilityBefore = _calculateProbability(currentTokenSoldBefore, totalTokensSoldBefore);

        /// After trade
        uint256 currentTokenReserveAfter = _isSelling
            ? currentTokenReserve + _tradingAmount
            : currentTokenReserve - _tradingAmount;
        uint256 currentTokenSoldAfter = totalTokenSupply - currentTokenReserveAfter;

        uint256 totalTokensSoldAfter = _isSelling
            ? totalTokensSoldBefore - _tradingAmount
            : totalTokensSoldBefore + _tradingAmount;

        uint256 probabilityAfter = _calculateProbability(currentTokenSoldAfter, totalTokensSoldAfter);

        /// Compute final price
        uint256 probabilityAvg = (probabilityBefore + probabilityAfter) / 2;
        return (market.initialTokenValue * probabilityAvg * _tradingAmount) / (PRECISION * PRECISION);
    }

    /**
     * @dev Internal helper to get the current reserves of the tokens
     * @param _marketAddress The market ID
     * @param _outcome The possible outcome (YES or NO)
     * @return The current reserves of the tokens
     */
    function _getCurrentReserves(uint256 _marketAddress, Outcome _outcome) private view returns (uint256, uint256) {
        Market storage market = markets[_marketAddress];
        if (_outcome == Outcome.YES) {
            return (market.yesTokenSupply, market.noTokenSupply);
        } else {
            return (market.noTokenSupply, market.yesTokenSupply);
        }
    }

    /**
     * @dev Internal helper to calculate the probability of the tokens
     * @param tokensSold The number of tokens sold
     * @param totalSold The total number of tokens sold
     * @return The probability of the tokens
     */
    function _calculateProbability(uint256 tokensSold, uint256 totalSold) private pure returns (uint256) {
        if (totalSold == 0) return 0;
        return (tokensSold * PRECISION) / totalSold;
    }

    /////////////////////////
    /// Helper Functions ///
    ////////////////////////

    /**
     * @dev Internal function to distribute trading revenue proportionally to all LPs
     * @param _marketAddress The market ID
     * @param _newRevenue The new trading revenue to distribute (optional, if 0, distributes existing)
     */
    function _distributeTradingRevenue(uint256 _marketAddress, uint256 _newRevenue) internal {
        Market storage market = markets[_marketAddress];
        uint256 totalRevenue = market.lpTradingRevenue + _newRevenue;

        if (totalRevenue == 0 || totalMarketLiquidity[_marketAddress] == 0) {
            return;
        }

        // Calculate revenue per unit of liquidity and add it to the cumulative total
        uint256 revenuePerUnit = (totalRevenue * PRECISION) / totalMarketLiquidity[_marketAddress];
        revenuePerLiquidityUnit[_marketAddress] += revenuePerUnit;

        // Reset the market's trading revenue since we're distributing it
        market.lpTradingRevenue = 0;
    }

    /**
     * @dev Internal function to distribute existing trading revenue proportionally
     * @param _marketAddress The market ID
     */
    function _distributeTradingRevenue(uint256 _marketAddress) internal {
        _distributeTradingRevenue(_marketAddress, 0);
    }

    /**
     * @dev Internal function to update a user's accumulated revenue based on their liquidity contribution
     * @param _marketAddress The market ID
     * @param _user The user address
     */
    function _updateUserAccumulatedRevenue(uint256 _marketAddress, address _user) internal {
        LiquidityInfo storage liqInfo = liquidityContributions[_marketAddress][_user];

        if (liqInfo.contribution == 0) {
            return; // No liquidity contribution
        }

        // Calculate only the NEW revenue since the last update
        uint256 currentRevenuePerUnit = revenuePerLiquidityUnit[_marketAddress];
        uint256 newRevenuePerUnit = currentRevenuePerUnit - liqInfo.lastRevenuePerLiquidityUnit;

        if (newRevenuePerUnit > 0) {
            // Calculate the user's share of the NEW revenue only
            uint256 userNewRevenueShare = (liqInfo.contribution * newRevenuePerUnit) / PRECISION;

            // Update accumulated revenue with only the new share
            liqInfo.accumulatedRevenue += userNewRevenueShare;
        }

        // Update the last revenue per unit to current value
        liqInfo.lastRevenuePerLiquidityUnit = currentRevenuePerUnit;
    }

    /**
     * @notice Allow LPs to claim their accumulated trading revenue
     * @param _marketAddress The market ID
     */
    function claimLPRevenue(uint256 _marketAddress) external marketExists(_marketAddress) {
        // Update user's accumulated revenue before claiming
        _updateUserAccumulatedRevenue(_marketAddress, msg.sender);

        LiquidityInfo storage liqInfo = liquidityContributions[_marketAddress][msg.sender];

        if (liqInfo.accumulatedRevenue == 0) {
            return; // Nothing to claim
        }

        uint256 revenueToClaim = liqInfo.accumulatedRevenue;
        liqInfo.accumulatedRevenue = 0;

        (bool success, ) = msg.sender.call{ value: revenueToClaim }("");
        if (!success) {
            revert PolyBet__ETHTransferFailed();
        }

        emit LPRevenueClaimed(_marketAddress, msg.sender, revenueToClaim);
    }

    /////////////////////////
    /// Getter Functions ///
    ////////////////////////

    /**
     * @notice Get the prediction details for a market
     * @param _marketAddress The market ID
     */
    function getPrediction(
        uint256 _marketAddress
    )
        external
        view
        marketExists(_marketAddress)
        returns (
            string memory question,
            string memory category,
            address oracle,
            uint256 initialTokenValue,
            uint256 yesTokenReserve,
            uint256 noTokenReserve,
            bool isReported,
            uint8 winningOutcome,
            uint256 ethCollateral,
            uint256 lpTradingRevenue,
            address creator,
            uint256 initialProbability,
            uint256 percentageLocked,
            uint256 expirationTime,
            MarketStatus status
        )
    {
        Market storage market = markets[_marketAddress];
        oracle = i_oracle;
        initialTokenValue = market.initialTokenValue;
        percentageLocked = market.percentageLocked;
        initialProbability = market.initialYesProbability;
        question = market.question;
        category = market.category;
        ethCollateral = market.ethCollateral;
        lpTradingRevenue = market.lpTradingRevenue;
        creator = market.creator;
        yesTokenReserve = market.yesTokenSupply;
        noTokenReserve = market.noTokenSupply;
        isReported = market.isReported;
        winningOutcome = market.winningOutcome;
        expirationTime = market.expirationTime;
        status = market.status;
    }

    /**
     * @notice Get market status information
     * @param _marketAddress The market ID
     */
    function getMarketStatus(
        uint256 _marketAddress
    )
        external
        view
        marketExists(_marketAddress)
        returns (MarketStatus status, bool isExpired, uint256 timeRemaining, bool canTrade)
    {
        Market storage market = markets[_marketAddress];
        bool expired = block.timestamp >= market.expirationTime;
        uint256 remaining = expired ? 0 : market.expirationTime - block.timestamp;
        bool canTradeNow = market.status == MarketStatus.Active && !expired;

        return (market.status, expired, remaining, canTradeNow);
    }

    /**
     * @notice Get liquidity information for a user in a specific market
     * @param _marketAddress The market ID
     * @param _user The user address
     */
    function getUserLiquidityInfo(
        uint256 _marketAddress,
        address _user
    )
        external
        view
        marketExists(_marketAddress)
        returns (uint256 userContribution, uint256 totalLiquidity, uint256 accumulatedRevenue, bool hasContribution)
    {
        LiquidityInfo storage liqInfo = liquidityContributions[_marketAddress][_user];

        // Calculate current accumulated revenue including any unclaimed revenue
        uint256 currentAccumulatedRevenue = liqInfo.accumulatedRevenue;
        if (liqInfo.contribution > 0) {
            // Calculate only the NEW revenue since the last update
            uint256 currentRevenuePerUnit = revenuePerLiquidityUnit[_marketAddress];
            uint256 newRevenuePerUnit = currentRevenuePerUnit - liqInfo.lastRevenuePerLiquidityUnit;

            if (newRevenuePerUnit > 0) {
                uint256 additionalRevenue = (liqInfo.contribution * newRevenuePerUnit) / PRECISION;
                currentAccumulatedRevenue += additionalRevenue;
            }
        }

        return (liqInfo.contribution, liqInfo.totalLiquidity, currentAccumulatedRevenue, liqInfo.contribution > 0);
    }

    /**
     * @notice Get user balance for a specific market
     * @param _marketAddress The market ID
     * @param _user The user address
     */
    function getUserBalance(
        uint256 _marketAddress,
        address _user
    ) external view marketExists(_marketAddress) returns (uint256 yesTokens, uint256 noTokens) {
        UserBalance storage balance = userBalances[_marketAddress][_user];
        return (balance.yesTokens, balance.noTokens);
    }

    /**
     * @notice Get all markets created by a user
     * @param _user The user address
     */
    function getUserMarkets(address _user) external view returns (uint256[] memory) {
        return userMarkets[_user];
    }

    /**
     * @notice Get all markets in a category
     * @param _category The category name
     */
    function getCategoryMarkets(string memory _category) external view returns (uint256[] memory) {
        return categoryMarkets[_category];
    }

    /**
     * @notice Get total market count
     */
    function getMarketCount() external view returns (uint256) {
        return marketCount;
    }
}
