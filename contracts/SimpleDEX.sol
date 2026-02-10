// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract SimpleDEX {
    uint256 public currentPrice = 65; // cents (0.65 USDC per TOKEN)
    address public tokenA; // TOKEN
    address public tokenB; // USDC

    constructor(address _tokenA, address _tokenB) {
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    function swap(uint256 amountIn, bool aToB) external {
        if (aToB) {
            IERC20(tokenA).transferFrom(msg.sender, address(this), amountIn);
            uint256 amountOut = (amountIn * currentPrice) / 100;
            IERC20(tokenB).transfer(msg.sender, amountOut);
        } else {
            IERC20(tokenB).transferFrom(msg.sender, address(this), amountIn);
            uint256 amountOut = (amountIn * 100) / currentPrice;
            IERC20(tokenA).transfer(msg.sender, amountOut);
        }
    }

    function setPrice(uint256 newPrice) external {
        currentPrice = newPrice;
    }
}