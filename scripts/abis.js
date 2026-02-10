export const orderBookAbi = [
    "function placeOrder(bytes encryptedData) external returns (uint256)",
    "function orders(uint256) external view returns (bytes encryptedData, address trader, uint256 timestamp, bool executed)",
    "event OrderPlaced(uint256 indexed orderId, address trader)",
    "event OrderExecuted(uint256 indexed orderId)",
  ];
  
  export const oracleAbi = [
    "function price() external view returns (uint256)",
    "function updatePrice(uint256 newPrice) external",
  ];
  
  export const dexAbi = [
    "function swap(uint256 amountIn, bool aToB) external",
    "function currentPrice() external view returns (uint256)",
  ];