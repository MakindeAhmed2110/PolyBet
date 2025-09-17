//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { PolyBetToken } from "./PolyBetToken.sol";
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

    //////////////////////////
    /// State Variables //////
    //////////////////////////

    address public immutable i_oracle;
    uint256 public immutable i_initialTokenValue;
    uint256 public immutable i_percentageLocked;
    uint256 public immutable i_initialYesProbability;
    string public s_question;
    string public s_category;
    address public immutable i_creator;
    uint256 public immutable i_expirationTime;
    uint256 public s_ethCollateral;
    uint256 public s_lpTradingRevenue;

    // Liquidity tracking for decentralized liquidity
    mapping(address => uint256) public liquidityContributions;
    uint256 public totalLiquidityProvided;

    PolyBetToken public immutable i_yesToken;
    PolyBetToken public immutable i_noToken;
    PolyBetToken public s_winningToken;
    bool public s_isReported;

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

    MarketStatus public s_status;

    uint256 private constant PRECISION = 1e18;

    /// Checkpoint 2 ///

    /// Checkpoint 3 ///

    /// Checkpoint 5 ///

    /////////////////////////
    /// Events //////
    /////////////////////////

    event TokensPurchased(address indexed buyer, Outcome outcome, uint256 amount, uint256 ethAmount);
    event TokensSold(address indexed seller, Outcome outcome, uint256 amount, uint256 ethAmount);
    event WinningTokensRedeemed(address indexed redeemer, uint256 amount, uint256 ethAmount);
    event MarketReported(address indexed oracle, Outcome winningOutcome, address winningToken);
    event MarketResolved(address indexed resolver, uint256 totalEthToSend);
    event LiquidityAdded(address indexed provider, uint256 ethAmount, uint256 tokensAmount);
    event LiquidityRemoved(address indexed provider, uint256 ethAmount, uint256 tokensAmount);
    event MarketExpired(uint256 expirationTime);

    /////////////////
    /// Modifiers ///
    /////////////////

    /// Checkpoint 5 ///
    modifier predictionNotReported() {
        if (s_isReported || s_status == MarketStatus.Reported || s_status == MarketStatus.Resolved) {
            revert PolyBet__PredictionAlreadyReported();
        }
        _;
    }

    /// Checkpoint 6 ///
    modifier predictionReported() {
        if (!s_isReported && s_status != MarketStatus.Reported && s_status != MarketStatus.Resolved) {
            revert PolyBet__PredictionNotReported();
        }
        _;
    }

    modifier marketActive() {
        if (s_status != MarketStatus.Active) {
            revert PolyBet__MarketNotActive();
        }
        if (block.timestamp >= i_expirationTime) {
            revert PolyBet__MarketExpired();
        }
        _;
    }

    modifier notExpired() {
        if (block.timestamp >= i_expirationTime) {
            revert PolyBet__MarketExpired();
        }
        _;
    }

    modifier notOwner() {
        if (msg.sender == owner()) {
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

    constructor(
        address _liquidityProvider,
        address _oracle,
        string memory _question,
        string memory _category,
        uint256 _initialTokenValue,
        uint8 _initialYesProbability,
        uint8 _percentageToLock,
        uint256 _expirationTime
    ) payable Ownable(_liquidityProvider) {
        /// Checkpoint 2 ////

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

        i_oracle = _oracle;
        s_question = _question;
        s_category = _category;
        i_initialTokenValue = _initialTokenValue;
        i_initialYesProbability = _initialYesProbability;
        i_percentageLocked = _percentageToLock;
        i_expirationTime = _expirationTime;
        i_creator = _liquidityProvider;

        s_ethCollateral = msg.value;
        s_status = MarketStatus.Active;

        /// Checkpoint 3 ////
        uint256 initialTokenAmount = (msg.value * PRECISION) / _initialTokenValue;
        i_yesToken = new PolyBetToken("Yes", "Y", msg.sender, initialTokenAmount);
        i_noToken = new PolyBetToken("No", "N", msg.sender, initialTokenAmount);

        uint256 initialYesAmountLocked = (initialTokenAmount * _initialYesProbability * _percentageToLock * 2) / 10000;
        uint256 initialNoAmountLocked = (initialTokenAmount * (100 - _initialYesProbability) * _percentageToLock * 2) /
            10000;

        bool success1 = i_yesToken.transfer(msg.sender, initialYesAmountLocked);
        bool success2 = i_noToken.transfer(msg.sender, initialNoAmountLocked);
        if (!success1 || !success2) {
            revert PolyBet__TokenTransferFailed();
        }
    }

    /////////////////
    /// Functions ///
    /////////////////

    function addLiquidity() external payable predictionNotReported marketActive {
        //// Checkpoint 4 ////

        s_ethCollateral += msg.value;

        // Track individual liquidity contributions
        liquidityContributions[msg.sender] += msg.value;
        totalLiquidityProvided += msg.value;

        uint256 tokensAmount = (msg.value * PRECISION) / i_initialTokenValue;

        i_yesToken.mint(address(this), tokensAmount);
        i_noToken.mint(address(this), tokensAmount);

        emit LiquidityAdded(msg.sender, msg.value, tokensAmount);
    }

    function removeLiquidity(uint256 _ethToWithdraw) external predictionNotReported marketActive {
        //// Checkpoint 4 ////

        // Check if user has sufficient liquidity contribution
        if (_ethToWithdraw > liquidityContributions[msg.sender]) {
            revert PolyBet__InsufficientBalance(_ethToWithdraw, liquidityContributions[msg.sender]);
        }

        // Check if there's enough ETH collateral to withdraw
        if (_ethToWithdraw > s_ethCollateral) {
            revert PolyBet__InsufficientLiquidity();
        }

        uint256 amountTokenToBurn = (_ethToWithdraw / i_initialTokenValue) * PRECISION;

        if (amountTokenToBurn > (i_yesToken.balanceOf(address(this)))) {
            revert PolyBet__InsufficientTokenReserve(Outcome.YES, amountTokenToBurn);
        }

        if (amountTokenToBurn > (i_noToken.balanceOf(address(this)))) {
            revert PolyBet__InsufficientTokenReserve(Outcome.NO, amountTokenToBurn);
        }

        // Update tracking
        liquidityContributions[msg.sender] -= _ethToWithdraw;
        totalLiquidityProvided -= _ethToWithdraw;
        s_ethCollateral -= _ethToWithdraw;

        i_yesToken.burn(address(this), amountTokenToBurn);
        i_noToken.burn(address(this), amountTokenToBurn);

        (bool success, ) = msg.sender.call{ value: _ethToWithdraw }("");
        if (!success) {
            revert PolyBet__ETHTransferFailed();
        }

        emit LiquidityRemoved(msg.sender, _ethToWithdraw, amountTokenToBurn);
    }

    /**
     * @notice Report the winning outcome for the prediction
     * @dev Only the oracle can report the winning outcome and only if the prediction is not reported
     * @param _winningOutcome The winning outcome (YES or NO)
     */
    function report(Outcome _winningOutcome) external predictionNotReported marketActive {
        //// Checkpoint 5 ////
        if (msg.sender != i_oracle) {
            revert PolyBet__OnlyOracleCanReport();
        }
        s_winningToken = _winningOutcome == Outcome.YES ? i_yesToken : i_noToken;
        s_isReported = true;
        s_status = MarketStatus.Reported;
        emit MarketReported(msg.sender, _winningOutcome, address(s_winningToken));
    }

    /**
     * @notice Owner of contract can redeem winning tokens held by the contract after prediction is resolved and get ETH from the contract including LP revenue and collateral back
     * @dev Only callable by the owner and only if the prediction is resolved
     * @return ethRedeemed The amount of ETH redeemed
     */
    function resolveMarketAndWithdraw() external onlyOwner predictionReported returns (uint256 ethRedeemed) {
        /// Checkpoint 6 ////
        uint256 contractWinningTokens = s_winningToken.balanceOf(address(this));
        if (contractWinningTokens > 0) {
            ethRedeemed = (contractWinningTokens * i_initialTokenValue) / PRECISION;

            if (ethRedeemed > s_ethCollateral) {
                ethRedeemed = s_ethCollateral;
            }

            s_ethCollateral -= ethRedeemed;
        }

        uint256 totalEthToSend = ethRedeemed + s_lpTradingRevenue;

        s_lpTradingRevenue = 0;

        s_winningToken.burn(address(this), contractWinningTokens);

        (bool success, ) = msg.sender.call{ value: totalEthToSend }("");
        if (!success) {
            revert PolyBet__ETHTransferFailed();
        }

        s_status = MarketStatus.Resolved;

        emit MarketResolved(msg.sender, totalEthToSend);

        return ethRedeemed;
    }

    /**
     * @notice Expire market if time has passed (anyone can call)
     */
    function expireMarket() external {
        if (block.timestamp < i_expirationTime || s_status != MarketStatus.Active) {
            revert PolyBet__MarketNotActive();
        }

        s_status = MarketStatus.Expired;
        emit MarketExpired(i_expirationTime);
    }

    /**
     * @notice Buy prediction outcome tokens with ETH, need to call priceInETH function first to get right amount of tokens to buy
     * @param _outcome The possible outcome (YES or NO) to buy tokens for
     * @param _amountTokenToBuy Amount of tokens to purchase
     */
    function buyTokensWithETH(
        Outcome _outcome,
        uint256 _amountTokenToBuy
    ) external payable amountGreaterThanZero(_amountTokenToBuy) predictionNotReported notOwner marketActive {
        /// Checkpoint 8 ////
        uint256 ethNeeded = getBuyPriceInEth(_outcome, _amountTokenToBuy);
        if (msg.value != ethNeeded) {
            revert PolyBet__MustSendExactETHAmount();
        }

        PolyBetToken optionToken = _outcome == Outcome.YES ? i_yesToken : i_noToken;

        if (_amountTokenToBuy > optionToken.balanceOf(address(this))) {
            revert PolyBet__InsufficientTokenReserve(_outcome, _amountTokenToBuy);
        }

        s_lpTradingRevenue += msg.value;

        bool success = optionToken.transfer(msg.sender, _amountTokenToBuy);
        if (!success) {
            revert PolyBet__TokenTransferFailed();
        }

        emit TokensPurchased(msg.sender, _outcome, _amountTokenToBuy, msg.value);
    }

    /**
     * @notice Sell prediction outcome tokens for ETH, need to call priceInETH function first to get right amount of tokens to buy
     * @param _outcome The possible outcome (YES or NO) to sell tokens for
     * @param _tradingAmount The amount of tokens to sell
     */
    function sellTokensForEth(
        Outcome _outcome,
        uint256 _tradingAmount
    ) external amountGreaterThanZero(_tradingAmount) predictionNotReported notOwner marketActive {
        /// Checkpoint 8 ////
        PolyBetToken optionToken = _outcome == Outcome.YES ? i_yesToken : i_noToken;
        uint256 userBalance = optionToken.balanceOf(msg.sender);
        if (userBalance < _tradingAmount) {
            revert PolyBet__InsufficientBalance(_tradingAmount, userBalance);
        }

        uint256 allowance = optionToken.allowance(msg.sender, address(this));
        if (allowance < _tradingAmount) {
            revert PolyBet__InsufficientAllowance(_tradingAmount, allowance);
        }

        uint256 ethToReceive = getSellPriceInEth(_outcome, _tradingAmount);

        s_lpTradingRevenue -= ethToReceive;

        (bool sent, ) = msg.sender.call{ value: ethToReceive }("");
        if (!sent) {
            revert PolyBet__ETHTransferFailed();
        }

        bool success = optionToken.transferFrom(msg.sender, address(this), _tradingAmount);
        if (!success) {
            revert PolyBet__TokenTransferFailed();
        }

        emit TokensSold(msg.sender, _outcome, _tradingAmount, ethToReceive);
    }

    /**
     * @notice Redeem winning tokens for ETH after prediction is resolved, winning tokens are burned and user receives ETH
     * @dev Only if the prediction is resolved
     * @param _amount The amount of winning tokens to redeem
     */
    function redeemWinningTokens(uint256 _amount) external amountGreaterThanZero(_amount) predictionReported notOwner {
        /// Checkpoint 9 ////
        if (s_winningToken.balanceOf(msg.sender) < _amount) {
            revert PolyBet__InsufficientWinningTokens();
        }

        uint256 ethToReceive = (_amount * i_initialTokenValue) / PRECISION;

        s_ethCollateral -= ethToReceive;

        s_winningToken.burn(msg.sender, _amount);

        (bool success, ) = msg.sender.call{ value: ethToReceive }("");
        if (!success) {
            revert PolyBet__ETHTransferFailed();
        }

        emit WinningTokensRedeemed(msg.sender, _amount, ethToReceive);
    }

    /**
     * @notice Calculate the total ETH price for buying tokens
     * @param _outcome The possible outcome (YES or NO) to buy tokens for
     * @param _tradingAmount The amount of tokens to buy
     * @return The total ETH price
     */
    function getBuyPriceInEth(Outcome _outcome, uint256 _tradingAmount) public view returns (uint256) {
        /// Checkpoint 7 ////
        return _calculatePriceInEth(_outcome, _tradingAmount, false);
    }

    /**
     * @notice Calculate the total ETH price for selling tokens
     * @param _outcome The possible outcome (YES or NO) to sell tokens for
     * @param _tradingAmount The amount of tokens to sell
     * @return The total ETH price
     */
    function getSellPriceInEth(Outcome _outcome, uint256 _tradingAmount) public view returns (uint256) {
        /// Checkpoint 7 ////
        return _calculatePriceInEth(_outcome, _tradingAmount, true);
    }

    /////////////////////////
    /// Helper Functions ///
    ////////////////////////

    /**
     * @dev Internal helper to calculate ETH price for both buying and selling
     * @param _outcome The possible outcome (YES or NO)
     * @param _tradingAmount The amount of tokens
     * @param _isSelling Whether this is a sell calculation
     */
    function _calculatePriceInEth(
        Outcome _outcome,
        uint256 _tradingAmount,
        bool _isSelling
    ) private view returns (uint256) {
        /// Checkpoint 7 ////
        (uint256 currentTokenReserve, uint256 currentOtherTokenReserve) = _getCurrentReserves(_outcome);

        /// Ensure sufficient liquidity when buying
        if (!_isSelling) {
            if (currentTokenReserve < _tradingAmount) {
                revert PolyBet__InsufficientLiquidity();
            }
        }

        uint256 totalTokenSupply = i_yesToken.totalSupply();

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
        return (i_initialTokenValue * probabilityAvg * _tradingAmount) / (PRECISION * PRECISION);
    }

    /**
     * @dev Internal helper to get the current reserves of the tokens
     * @param _outcome The possible outcome (YES or NO)
     * @return The current reserves of the tokens
     */
    function _getCurrentReserves(Outcome _outcome) private view returns (uint256, uint256) {
        /// Checkpoint 7 ////
        if (_outcome == Outcome.YES) {
            return (i_yesToken.balanceOf(address(this)), i_noToken.balanceOf(address(this)));
        } else {
            return (i_noToken.balanceOf(address(this)), i_yesToken.balanceOf(address(this)));
        }
    }

    /**
     * @dev Internal helper to calculate the probability of the tokens
     * @param tokensSold The number of tokens sold
     * @param totalSold The total number of tokens sold
     * @return The probability of the tokens
     */
    function _calculateProbability(uint256 tokensSold, uint256 totalSold) private pure returns (uint256) {
        /// Checkpoint 7 ////
        return (tokensSold * PRECISION) / totalSold;
    }

    /////////////////////////
    /// Getter Functions ///
    ////////////////////////

    /**
     * @notice Get the prediction details
     */
    function getPrediction()
        external
        view
        returns (
            string memory question,
            string memory outcome1,
            string memory outcome2,
            address oracle,
            uint256 initialTokenValue,
            uint256 yesTokenReserve,
            uint256 noTokenReserve,
            bool isReported,
            address yesToken,
            address noToken,
            address winningToken,
            uint256 ethCollateral,
            uint256 lpTradingRevenue,
            address predictionMarketOwner,
            uint256 initialProbability,
            uint256 percentageLocked,
            string memory category,
            address creator,
            uint256 expirationTime,
            MarketStatus status
        )
    {
        /// Checkpoint 3 ////
        oracle = i_oracle;
        initialTokenValue = i_initialTokenValue;
        percentageLocked = i_percentageLocked;
        initialProbability = i_initialYesProbability;
        question = s_question;
        ethCollateral = s_ethCollateral;
        lpTradingRevenue = s_lpTradingRevenue;
        predictionMarketOwner = owner();
        yesToken = address(i_yesToken);
        noToken = address(i_noToken);
        outcome1 = i_yesToken.name();
        outcome2 = i_noToken.name();
        yesTokenReserve = i_yesToken.balanceOf(address(this));
        noTokenReserve = i_noToken.balanceOf(address(this));
        /// Checkpoint 5 ////
        isReported = s_isReported;
        winningToken = address(s_winningToken);
        category = s_category;
        creator = i_creator;
        expirationTime = i_expirationTime;
        status = s_status;
    }

    /**
     * @notice Get market status information
     */
    function getMarketStatus()
        external
        view
        returns (MarketStatus status, bool isExpired, uint256 timeRemaining, bool canTrade)
    {
        bool expired = block.timestamp >= i_expirationTime;
        uint256 remaining = expired ? 0 : i_expirationTime - block.timestamp;
        bool canTradeNow = s_status == MarketStatus.Active && !expired;

        return (s_status, expired, remaining, canTradeNow);
    }

    /**
     * @notice Get liquidity information for a user
     */
    function getUserLiquidityInfo(
        address _user
    ) external view returns (uint256 userContribution, uint256 totalLiquidity, bool hasContribution) {
        return (liquidityContributions[_user], totalLiquidityProvided, liquidityContributions[_user] > 0);
    }
}
