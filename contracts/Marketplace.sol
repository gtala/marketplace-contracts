// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Marketplace is ReentrancyGuard {
    struct TradeOffer {
        address seller;
        IERC20 token;
        uint256 quantity;
        uint256 cost;
    }

    mapping(uint256 => TradeOffer) public offers;
    uint256 public offerCounter;
    mapping(address => uint256) public sellerBalances;

    event ItemListed(uint256 indexed offerId, address indexed seller, address token, uint256 quantity, uint256 cost);
    event ItemPurchased(uint256 indexed offerId, address indexed buyer, uint256 quantity, uint256 cost);
    event FundsWithdrawn(address indexed seller, uint256 amount);

    function createOffer(IERC20 token, uint256 quantity, uint256 cost) external {
        require(quantity > 0, "Quantity must be greater than zero");
        require(cost > 0, "Cost must be greater than zero");

        token.transferFrom(msg.sender, address(this), quantity);
        offers[offerCounter] = TradeOffer(msg.sender, token, quantity, cost);
        emit ItemListed(offerCounter, msg.sender, address(token), quantity, cost);
        offerCounter++;
    }

    function executePurchase(uint256 offerId) external payable nonReentrant {
        TradeOffer storage offer = offers[offerId];
        require(offer.quantity > 0, "Offer not available");
        require(msg.value == offer.cost, "Incorrect Ether amount");

        offer.token.transfer(msg.sender, offer.quantity);
        sellerBalances[offer.seller] += msg.value;

        emit ItemPurchased(offerId, msg.sender, offer.quantity, offer.cost);
        delete offers[offerId];
    }

    function claimEarnings() external nonReentrant {
        uint256 amount = sellerBalances[msg.sender];
        require(amount > 0, "No earnings available");

        sellerBalances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit FundsWithdrawn(msg.sender, amount);
    }
}