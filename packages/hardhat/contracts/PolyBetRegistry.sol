//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract PolyBetRegistry {
    /////////////////
    /// Errors //////
    /////////////////

    error PolyBetRegistry__MarketAlreadyRegistered();
    error PolyBetRegistry__MarketNotRegistered();
    error PolyBetRegistry__UnauthorizedAccess();

    //////////////////////////
    /// State Variables //////
    //////////////////////////

    address public i_factory;

    struct MarketInfo {
        address marketAddress;
        address creator;
        string question;
        string category;
        uint256 createdAt;
        bool isActive;
    }

    // Market address to market info
    mapping(address => MarketInfo) public s_markets;

    // Creator address to their created markets
    mapping(address => address[]) public s_creatorMarkets;

    // All market addresses
    address[] public s_allMarkets;

    // Category to market addresses
    mapping(string => address[]) public s_categoryMarkets;

    uint256 public s_totalMarkets;

    /////////////////////////
    /// Events //////
    /////////////////////////

    event MarketRegistered(
        address indexed marketAddress,
        address indexed creator,
        string question,
        string category,
        uint256 createdAt
    );

    event MarketStatusUpdated(address indexed marketAddress, bool isActive);
    event FactorySet(address indexed factory);

    /////////////////
    /// Modifiers ///
    /////////////////

    modifier onlyFactory() {
        if (msg.sender != i_factory) {
            revert PolyBetRegistry__UnauthorizedAccess();
        }
        _;
    }

    modifier marketExists(address _marketAddress) {
        if (s_markets[_marketAddress].marketAddress == address(0)) {
            revert PolyBetRegistry__MarketNotRegistered();
        }
        _;
    }

    modifier marketNotExists(address _marketAddress) {
        if (s_markets[_marketAddress].marketAddress != address(0)) {
            revert PolyBetRegistry__MarketAlreadyRegistered();
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
     * @param _factory The address of the PolyBetFactory contract
     */
    function setFactory(address _factory) external {
        if (i_factory != address(0)) {
            revert PolyBetRegistry__UnauthorizedAccess(); // Factory already set
        }
        if (_factory == address(0)) {
            revert PolyBetRegistry__UnauthorizedAccess(); // Cannot set to zero address
        }
        i_factory = _factory;
        emit FactorySet(_factory);
    }

    /////////////////
    /// Functions ///
    /////////////////

    /**
     * @notice Register a new market (only callable by factory)
     * @param _marketAddress The address of the market contract
     * @param _creator The address of the market creator
     * @param _question The prediction question
     * @param _category The market category
     * @param _createdAt The creation timestamp
     */
    function registerMarket(
        address _marketAddress,
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
     * @param _marketAddress The market address
     * @param _isActive New active status
     */
    function updateMarketStatus(
        address _marketAddress,
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
     * @param _marketAddress The market address
     */
    function getMarketInfo(
        address _marketAddress
    )
        external
        view
        returns (
            address marketAddress,
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
    function getAllMarkets() external view returns (address[] memory) {
        return s_allMarkets;
    }

    /**
     * @notice Get markets by creator
     * @param _creator The creator address
     */
    function getMarketsByCreator(address _creator) external view returns (address[] memory) {
        return s_creatorMarkets[_creator];
    }

    /**
     * @notice Get markets by category
     * @param _category The category name
     */
    function getMarketsByCategory(string memory _category) external view returns (address[] memory) {
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
    ) external view returns (address[] memory markets, uint256 totalCount) {
        uint256 totalMarkets = s_allMarkets.length;

        if (_offset >= totalMarkets) {
            return (new address[](0), totalMarkets);
        }

        uint256 endIndex = _offset + _limit;
        if (endIndex > totalMarkets) {
            endIndex = totalMarkets;
        }

        uint256 resultLength = endIndex - _offset;
        address[] memory result = new address[](resultLength);

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
