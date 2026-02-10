// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockPriceOracle {
    uint256 public price = 65; // cents

    function updatePrice(uint256 newPrice) external {
        price = newPrice;
    }

    function getPrice() external view returns (uint256) {
        return price;
    }
}