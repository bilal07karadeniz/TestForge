// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private value;
    address public owner;

    event ValueChanged(uint256 newValue, address indexed changedBy);

    constructor() {
        owner = msg.sender;
    }

    function setValue(uint256 _value) public {
        require(_value > 0, "Value must be greater than 0");
        value = _value;
        emit ValueChanged(_value, msg.sender);
    }

    function getValue() public view returns (uint256) {
        return value;
    }

    function increment() public {
        value += 1;
        emit ValueChanged(value, msg.sender);
    }
}
