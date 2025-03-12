import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, Signer } from "ethers";

describe("Marketplace", function () {
    let marketplace: Contract;
    let token: Contract;
    let owner: Signer;
    let seller: Signer;
    let buyer: Signer;

    beforeEach(async function () {
        [owner, seller, buyer] = await ethers.getSigners();

        // Deploy ERC-20 token for testing
        const Token = await ethers.getContractFactory("ERC20Mock");
        token = await Token.deploy("TestToken", "TTK", ethers.utils.parseEther("1000"));
        await token.deployed();

        // Deploy Marketplace contract
        const Marketplace = await ethers.getContractFactory("Marketplace");
        marketplace = await Marketplace.deploy();
        await marketplace.deployed();

        // Transfer tokens to the seller
        await token.transfer(await seller.getAddress(), ethers.utils.parseEther("100"));

        // Seller approves Marketplace to handle their tokens
        await token.connect(seller).approve(marketplace.address, ethers.utils.parseEther("100"));
    });

    it("Should list a token for sale", async function () {
        await token.connect(seller).transfer(await seller.getAddress(), ethers.utils.parseEther("100"));

        await expect(
            marketplace.connect(seller).createOffer(token.address, ethers.utils.parseEther("10"), ethers.utils.parseEther("1"))
        )
            .to.emit(marketplace, "ItemListed")
            .withArgs(0, await seller.getAddress(), token.address, ethers.utils.parseEther("10"), ethers.utils.parseEther("1"));
    });

    it("Should allow a buyer to purchase a token", async function () {
        await token.connect(seller).transfer(await seller.getAddress(), ethers.utils.parseEther("100"));
        await marketplace.connect(seller).createOffer(token.address, ethers.utils.parseEther("10"), ethers.utils.parseEther("1"));

        await expect(
            marketplace.connect(buyer).executePurchase(0, { value: ethers.utils.parseEther("1") })
        )
            .to.emit(marketplace, "ItemPurchased")
            .withArgs(0, await buyer.getAddress(), ethers.utils.parseEther("10"), ethers.utils.parseEther("1"));

        expect(await token.balanceOf(await buyer.getAddress())).to.equal(ethers.utils.parseEther("10"));
    });

    it("Should allow the seller to withdraw earnings", async function () {
        await token.connect(seller).transfer(await seller.getAddress(), ethers.utils.parseEther("100"));
        await marketplace.connect(seller).createOffer(token.address, ethers.utils.parseEther("10"), ethers.utils.parseEther("1"));
        await marketplace.connect(buyer).executePurchase(0, { value: ethers.utils.parseEther("1") });

        await expect(marketplace.connect(seller).claimEarnings())
            .to.emit(marketplace, "FundsWithdrawn")
            .withArgs(await seller.getAddress(), ethers.utils.parseEther("1"));
    });

    it("Should not allow non-owners to withdraw", async function () {
        await expect(marketplace.connect(buyer).claimEarnings()).to.be.revertedWith("No earnings available");
    });
});