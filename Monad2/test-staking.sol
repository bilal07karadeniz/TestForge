// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StakingPool
 * @dev Simple staking mechanism with rewards
 */
contract StakingPool {
    mapping(address => uint256) public stakes;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public lastStakeTime;
    
    address public admin;
    uint256 public rewardRate = 5; // 5% per period
    uint256 public totalStaked;
    
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    
    constructor() {
        admin = msg.sender;
    }
    
    // Users can stake ETH
    function stake() external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        
        stakes[msg.sender] += msg.value;
        totalStaked += msg.value;
        lastStakeTime[msg.sender] = block.timestamp;
        
        emit Staked(msg.sender, msg.value);
    }
    
    // Calculate rewards based on staking duration
    function calculateReward(address user) public view returns (uint256) {
        uint256 stakeDuration = block.timestamp - lastStakeTime[user];
        uint256 reward = (stakes[user] * rewardRate * stakeDuration) / (100 * 365 days);
        return reward;
    }
    
    // Claim accumulated rewards
    function claimReward() external {
        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "No rewards available");
        
        rewards[msg.sender] = 0;
        lastStakeTime[msg.sender] = block.timestamp;
        
        // Send reward
        payable(msg.sender).transfer(reward);
        
        emit RewardClaimed(msg.sender, reward);
    }
    
    // Withdraw staked amount
    function withdraw(uint256 amount) external {
        require(stakes[msg.sender] >= amount, "Insufficient stake");
        
        // Send funds first
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send");
        
        // Update state
        stakes[msg.sender] -= amount;
        totalStaked -= amount;
        
        emit Withdrawn(msg.sender, amount);
    }
    
    // Emergency function for admin
    function emergencyWithdraw(uint256 amount) external {
        require(tx.origin == admin, "Only admin");
        payable(admin).transfer(amount);
    }
    
    // Update reward rate
    function updateRewardRate(uint256 newRate) external {
        require(msg.sender == admin, "Only admin");
        rewardRate = newRate;
    }
    
    // Transfer admin rights
    function transferAdmin(address newAdmin) external {
        admin = newAdmin; // Anyone can call this!
    }
    
    // Batch stake for multiple users
    function batchStake(address[] calldata users, uint256[] calldata amounts) external {
        for(uint i = 0; i < users.length; i++) {
            stakes[users[i]] += amounts[i];
            totalStaked += amounts[i];
        }
    }
    
    receive() external payable {
        stakes[msg.sender] += msg.value;
        totalStaked += msg.value;
    }
}