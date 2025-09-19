//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

<<<<<<< HEAD
import "./Predikt.sol";
import "./PrediktRegistry.sol";

contract PrediktFactory {
=======
import "./PolyBet.sol";
import "./PolyBetRegistry.sol";

contract PolyBetFactory {
>>>>>>> 9cc37c7d11685938744cb3173767a1ef4b707f27
    /////////////////
    /// Errors //////
    /////////////////

<<<<<<< HEAD
    error PrediktFactory__InvalidInitialLiquidity();
    error PrediktFactory__InvalidProbability();
    error PrediktFactory__InvalidPercentageToLock();
    error PrediktFactory__InvalidQuestion();
    error PrediktFactory__InvalidCategory();
    error PrediktFactory__InvalidExpirationTime();
=======
    error PolyBetFactory__InvalidInitialLiquidity();
    error PolyBetFactory__InvalidProbability();
    error PolyBetFactory__InvalidPercentageToLock();
    error PolyBetFactory__InvalidQuestion();
    error PolyBetFactory__InvalidCategory();
    error PolyBetFactory__InvalidExpirationTime();
>>>>>>> 9cc37c7d11685938744cb3173767a1ef4b707f27

    //////////////////////////
    /// State Variables //////
    //////////////////////////

    address public immutable i_oracle;
    address public immutable i_registry;
<<<<<<< HEAD
    address public immutable i_predikt;
=======
    address public immutable i_polyBet;
>>>>>>> 9cc37c7d11685938744cb3173767a1ef4b707f27
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
<<<<<<< HEAD
            revert PrediktFactory__InvalidQuestion();
=======
            revert PolyBetFactory__InvalidQuestion();
>>>>>>> 9cc37c7d11685938744cb3173767a1ef4b707f27
        }
        _;
    }

    modifier validCategory(string memory _category) {
        if (bytes(_category).length == 0 || bytes(_category).length > 50) {
<<<<<<< HEAD
            revert PrediktFactory__InvalidCategory();
=======
            revert PolyBetFactory__InvalidCategory();
>>>>>>> 9cc37c7d11685938744cb3173767a1ef4b707f27
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
<<<<<<< HEAD
            revert PrediktFactory__InvalidInitialLiquidity();
        }
        if (_initialYesProbability >= 100 || _initialYesProbability == 0) {
            revert PrediktFactory__InvalidProbability();
        }
        if (_percentageToLock >= 100 || _percentageToLock == 0) {
            revert PrediktFactory__InvalidPercentageToLock();
=======
            revert PolyBetFactory__InvalidInitialLiquidity();
        }
        if (_initialYesProbability >= 100 || _initialYesProbability == 0) {
            revert PolyBetFactory__InvalidProbability();
        }
        if (_percentageToLock >= 100 || _percentageToLock == 0) {
            revert PolyBetFactory__InvalidPercentageToLock();
>>>>>>> 9cc37c7d11685938744cb3173767a1ef4b707f27
        }
        _;
    }

    //////////////////
    ////Constructor///
    //////////////////

<<<<<<< HEAD
    constructor(address _oracle, address _registry, address _predikt) {
        i_oracle = _oracle;
        i_registry = _registry;
        i_predikt = _predikt;
=======
    constructor(address _oracle, address _registry, address _polyBet) {
        i_oracle = _oracle;
        i_registry = _registry;
        i_polyBet = _polyBet;
>>>>>>> 9cc37c7d11685938744cb3173767a1ef4b707f27

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
<<<<<<< HEAD
            revert PrediktFactory__InvalidExpirationTime();
        }

        // Create market in the main Predikt contract
        marketAddress = Predikt(i_predikt).createMarket{ value: msg.value }(
=======
            revert PolyBetFactory__InvalidExpirationTime();
        }

        // Create market in the main PolyBet contract
        marketAddress = PolyBet(i_polyBet).createMarket{ value: msg.value }(
>>>>>>> 9cc37c7d11685938744cb3173767a1ef4b707f27
            _question,
            _category,
            _initialTokenValue,
            _initialYesProbability,
            _percentageToLock,
            _expirationTime
        );

        s_marketCount++;

        // Register market in registry
<<<<<<< HEAD
        PrediktRegistry(i_registry).registerMarket(marketAddress, msg.sender, _question, _category, block.timestamp);
=======
        PolyBetRegistry(i_registry).registerMarket(marketAddress, msg.sender, _question, _category, block.timestamp);
>>>>>>> 9cc37c7d11685938744cb3173767a1ef4b707f27

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
<<<<<<< HEAD
                revert PrediktFactory__InvalidCategory();
=======
                revert PolyBetFactory__InvalidCategory();
>>>>>>> 9cc37c7d11685938744cb3173767a1ef4b707f27
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
<<<<<<< HEAD
        returns (address oracle, address registry, address predikt, uint256 marketCount, string[] memory categories)
    {
        return (i_oracle, i_registry, i_predikt, s_marketCount, s_categories);
=======
        returns (address oracle, address registry, address polyBet, uint256 marketCount, string[] memory categories)
    {
        return (i_oracle, i_registry, i_polyBet, s_marketCount, s_categories);
>>>>>>> 9cc37c7d11685938744cb3173767a1ef4b707f27
    }
}
