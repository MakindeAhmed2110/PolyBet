//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./Predikt.sol";
import "./PrediktRegistry.sol";

contract PrediktFactory {
    /////////////////
    /// Errors //////
    /////////////////

    error PrediktFactory__InvalidInitialLiquidity();
    error PrediktFactory__InvalidProbability();
    error PrediktFactory__InvalidPercentageToLock();
    error PrediktFactory__InvalidQuestion();
    error PrediktFactory__InvalidCategory();
    error PrediktFactory__InvalidExpirationTime();

    //////////////////////////
    /// State Variables //////
    //////////////////////////

    address public immutable i_oracle;
    address public immutable i_registry;
    address public immutable i_predikt;
    uint256 public s_marketCount;

    // Market categories
    string[] public s_categories;

    /////////////////////////
    /// Events //////
    /////////////////////////

    event MarketCreated(
        uint256 indexed marketAddress,
        address indexed creator,
        string question,
        string category,
        uint256 initialLiquidity,
        uint256 creationTimestamp
    );

    event CategoryAdded(string category);

    /////////////////
    /// Modifiers ///
    /////////////////

    modifier validQuestion(string memory _question) {
        if (bytes(_question).length == 0 || bytes(_question).length > 500) {
            revert PrediktFactory__InvalidQuestion();
        }
        _;
    }

    modifier validCategory(string memory _category) {
        if (bytes(_category).length == 0 || bytes(_category).length > 50) {
            revert PrediktFactory__InvalidCategory();
        }
        _;
    }

    modifier validParameters(
        uint256 _initialTokenValue,
        uint8 _initialYesProbability,
        uint8 _percentageToLock,
        uint256 _initialLiquidity
    ) {
        if (_initialLiquidity == 0 || _initialLiquidity > 100 ether) {
            revert PrediktFactory__InvalidInitialLiquidity();
        }
        if (_initialYesProbability >= 100 || _initialYesProbability == 0) {
            revert PrediktFactory__InvalidProbability();
        }
        if (_percentageToLock >= 100 || _percentageToLock == 0) {
            revert PrediktFactory__InvalidPercentageToLock();
        }
        _;
    }

    //////////////////
    ////Constructor///
    //////////////////

    constructor(address _oracle, address _registry, address _predikt) {
        i_oracle = _oracle;
        i_registry = _registry;
        i_predikt = _predikt;

        // Initialize default categories
        s_categories.push("crypto");
        s_categories.push("sports");
        s_categories.push("politics");
        s_categories.push("tech");
        s_categories.push("other");
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
    )
        external
        payable
        validQuestion(_question)
        validCategory(_category)
        validParameters(_initialTokenValue, _initialYesProbability, _percentageToLock, msg.value)
        returns (uint256 marketAddress)
    {
        // Validate expiration time
        if (_expirationTime <= block.timestamp + 1 hours) {
            revert PrediktFactory__InvalidExpirationTime();
        }

        // Create market in the main Predikt contract
        marketAddress = Predikt(i_predikt).createMarket{ value: msg.value }(
            _question,
            _category,
            _initialTokenValue,
            _initialYesProbability,
            _percentageToLock,
            _expirationTime
        );

        s_marketCount++;

        // Register market in registry
        PrediktRegistry(i_registry).registerMarket(marketAddress, msg.sender, _question, _category, block.timestamp);

        emit MarketCreated(marketAddress, msg.sender, _question, _category, msg.value, block.timestamp);

        return marketAddress;
    }

    /**
     * @notice Add a new market category
     * @param _category The new category to add
     */
    function addCategory(string memory _category) external validCategory(_category) {
        // Check if category already exists
        for (uint256 i = 0; i < s_categories.length; i++) {
            if (keccak256(bytes(s_categories[i])) == keccak256(bytes(_category))) {
                revert PrediktFactory__InvalidCategory();
            }
        }

        s_categories.push(_category);
        emit CategoryAdded(_category);
    }

    /////////////////////////
    /// Getter Functions ///
    /////////////////////////

    /**
     * @notice Get all available categories
     */
    function getCategories() external view returns (string[] memory) {
        return s_categories;
    }

    /**
     * @notice Get category count
     */
    function getCategoryCount() external view returns (uint256) {
        return s_categories.length;
    }

    /**
     * @notice Get market count
     */
    function getMarketCount() external view returns (uint256) {
        return s_marketCount;
    }

    /**
     * @notice Get factory information
     */
    function getFactoryInfo()
        external
        view
        returns (address oracle, address registry, address predikt, uint256 marketCount, string[] memory categories)
    {
        return (i_oracle, i_registry, i_predikt, s_marketCount, s_categories);
    }
}
