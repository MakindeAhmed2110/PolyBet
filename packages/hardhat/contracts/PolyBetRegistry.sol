//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

<<<<<<< HEAD
contract PrediktRegistry {
=======
contract PolyBetRegistry {
>>>>>>> 9cc37c7d11685938744cb3173767a1ef4b707f27
    /////////////////
    /// Errors //////
    /////////////////

<<<<<<< HEAD
    error PrediktRegistry__MarketAlreadyRegistered();
    error PrediktRegistry__MarketNotRegistered();
    error PrediktRegistry__UnauthorizedAccess();
=======
    error PolyBetRegistry__MarketAlreadyRegistered();
    error PolyBetRegistry__MarketNotRegistered();
    error PolyBetRegistry__UnauthorizedAccess();
>>>>>>> 9cc37c7d11685938744cb3173767a1ef4b707f27

    //////////////////////////
    /// State Variables //////
    //////////////////////////

    address public i_factory;

    struct MarketInfo {
        uint256 marketAddress;
        address creator;
        string question;
        string category;
        uint256 createdAt;
        bool isActive;
    }

    // Market ID to market info
    mapping(uint256 => MarketInfo) public s_markets;

    // Creator address to their created markets
    mapping(address => uint256[]) public s_creatorMarkets;

    // All market IDs
    uint256[] public s_allMarkets;

    // Category to market IDs
    mapping(string => uint256[]) public s_categoryMarkets;

    uint256 public s_totalMarkets;

    /////////////////////////
    /// Events //////
    /////////////////////////

    event MarketRegistered(
        uint256 indexed marketAddress,
        address indexed creator,
        string question,
        string category,
        uint256 createdAt
    );

    event MarketStatusUpdated(uint256 indexed marketAddress, bool isActive);
    event FactorySet(address indexed factory);

    /////////////////
    /// Modifiers ///
    /////////////////

    modifier onlyFactory() {
        if (msg.sender != i_factory) {
<<<<<<< HEAD
            revert PrediktRegistry__UnauthorizedAccess();
=======
            revert PolyBetRegistry__UnauthorizedAccess();
>>>>>>> 9cc37c7d11685938744cb3173767a1ef4b707f27
        }
        _;
    }

    modifier marketExists(uint256 _marketAddress) {
        if (s_markets[_marketAddress].marketAddress == 0 && s_markets[_marketAddress].creator == address(0)) {
<<<<<<< HEAD
            revert PrediktRegistry__MarketNotRegistered();
=======
            revert PolyBetRegistry__MarketNotRegistered();
>>>>>>> 9cc37c7d11685938744cb3173767a1ef4b707f27
        }
        _;
    }

    modifier marketNotExists(uint256 _marketAddress) {
        if (s_markets[_marketAddress].marketAddress != 0 || s_markets[_marketAddress].creator != address(0)) {
<<<<<<< HEAD
            revert PrediktRegistry__MarketAlreadyRegistered();
=======
            revert PolyBetRegistry__MarketAlreadyRegistered();
>>>>>>> 9cc37c7d11685938744cb3173767a1ef4b707f27
        }
        _;
    }

    //////////////////
    ////Constructor///
    //////////////////

    constructor(address _factory) {
        i_factory = _factory;
    }

    /**
     * @notice Set the factory address (can only be called once)
<<<<<<< HEAD
     * @param _factory The address of the PrediktFactory contract
     */
    function setFactory(address _factory) external {
        if (i_factory != address(0)) {
            revert PrediktRegistry__UnauthorizedAccess(); // Factory already set
        }
        if (_factory == address(0)) {
            revert PrediktRegistry__UnauthorizedAccess(); // Cannot set to zero address
=======
     * @param _factory The address of the PolyBetFactory contract
     */
    function setFactory(address _factory) external {
        if (i_factory != address(0)) {
            revert PolyBetRegistry__UnauthorizedAccess(); // Factory already set
        }
        if (_factory == address(0)) {
            revert PolyBetRegistry__UnauthorizedAccess(); // Cannot set to zero address
>>>>>>> 9cc37c7d11685938744cb3173767a1ef4b707f27
        }
        i_factory = _factory;
        emit FactorySet(_factory);
    }

    /////////////////
    /// Functions ///
    /////////////////

    /**
     * @notice Register a new market (only callable by factory)
     * @param _marketAddress The ID of the market
     * @param _creator The address of the market creator
     * @param _question The prediction question
     * @param _category The market category
     * @param _createdAt The creation timestamp
     */
    function registerMarket(
        uint256 _marketAddress,
        address _creator,
        string memory _question,
        string memory _category,
        uint256 _createdAt
    ) external onlyFactory marketNotExists(_marketAddress) {
        // Create market info
        MarketInfo memory marketInfo = MarketInfo({
            marketAddress: _marketAddress,
            creator: _creator,
            question: _question,
            category: _category,
            createdAt: _createdAt,
            isActive: true
        });

        // Store market info
        s_markets[_marketAddress] = marketInfo;
        s_allMarkets.push(_marketAddress);
        s_creatorMarkets[_creator].push(_marketAddress);
        s_categoryMarkets[_category].push(_marketAddress);
        s_totalMarkets++;

        emit MarketRegistered(_marketAddress, _creator, _question, _category, _createdAt);
    }

    /**
     * @notice Update market status (for future use - market deactivation)
     * @param _marketAddress The market ID
     * @param _isActive New active status
     */
    function updateMarketStatus(
        uint256 _marketAddress,
        bool _isActive
    ) external onlyFactory marketExists(_marketAddress) {
        s_markets[_marketAddress].isActive = _isActive;

        emit MarketStatusUpdated(_marketAddress, _isActive);
    }

    /////////////////////////
    /// Getter Functions ///
    /////////////////////////

    /**
     * @notice Get market information
     * @param _marketAddress The market ID
     */
    function getMarketInfo(
        uint256 _marketAddress
    )
        external
        view
        returns (
            uint256 marketAddress,
            address creator,
            string memory question,
            string memory category,
            uint256 createdAt,
            bool isActive
        )
    {
        MarketInfo memory marketInfo = s_markets[_marketAddress];
        return (
            marketInfo.marketAddress,
            marketInfo.creator,
            marketInfo.question,
            marketInfo.category,
            marketInfo.createdAt,
            marketInfo.isActive
        );
    }

    /**
     * @notice Get all markets
     */
    function getAllMarkets() external view returns (uint256[] memory) {
        return s_allMarkets;
    }

    /**
     * @notice Get markets by creator
     * @param _creator The creator address
     */
    function getMarketsByCreator(address _creator) external view returns (uint256[] memory) {
        return s_creatorMarkets[_creator];
    }

    /**
     * @notice Get markets by category
     * @param _category The category name
     */
    function getMarketsByCategory(string memory _category) external view returns (uint256[] memory) {
        return s_categoryMarkets[_category];
    }

    /**
     * @notice Get markets in a paginated way
     * @param _offset Starting index
     * @param _limit Number of markets to return
     */
    function getMarketsPaginated(
        uint256 _offset,
        uint256 _limit
    ) external view returns (uint256[] memory markets, uint256 totalCount) {
        uint256 totalMarkets = s_allMarkets.length;

        if (_offset >= totalMarkets) {
            return (new uint256[](0), totalMarkets);
        }

        uint256 endIndex = _offset + _limit;
        if (endIndex > totalMarkets) {
            endIndex = totalMarkets;
        }

        uint256 resultLength = endIndex - _offset;
        uint256[] memory result = new uint256[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = s_allMarkets[_offset + i];
        }

        return (result, totalMarkets);
    }

    /**
     * @notice Get registry statistics
     */
    function getRegistryStats() external view returns (uint256 totalMarkets, uint256 activeMarkets, address factory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < s_allMarkets.length; i++) {
            if (s_markets[s_allMarkets[i]].isActive) {
                activeCount++;
            }
        }

        return (s_totalMarkets, activeCount, i_factory);
    }
}
