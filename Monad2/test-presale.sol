// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract TokenPresale {
    IERC20 public token;
    address public owner;
    uint256 public price; // Price per token in wei
    uint256 public totalSold;

    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);

    constructor(address _token, uint256 _price) {
        token = IERC20(_token);
        owner = msg.sender;
        price = _price;
    }

    function buyTokens(uint256 amount) external payable {
        require(amount > 0, "Amount must be greater than 0");
        uint256 cost = amount * price;
        require(msg.value >= cost, "Insufficient payment");

        totalSold += amount;
        require(token.transfer(msg.sender, amount), "Token transfer failed");

        emit TokensPurchased(msg.sender, amount, cost);

        // Refund excess payment
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
    }

    function withdraw() external {
        require(msg.sender == owner, "Only owner");
        payable(owner).transfer(address(this).balance);
    }

    function fundPresale(uint256 amount) external {
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }
}
