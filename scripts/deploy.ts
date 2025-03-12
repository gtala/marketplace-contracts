import { run, network } from "hardhat";
import { ethers } from "hardhat";

async function main() {
    console.log("Deploying ERC20Mock token...");
    const Token = await ethers.getContractFactory("ERC20Mock");
    const token = await Token.deploy("TestToken", "TTK", ethers.utils.parseEther("1000"));
    await token.deployed();
    console.log(`Token deployed at: ${token.address}`);

    console.log("Deploying Marketplace...");
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy();
    await marketplace.deployed();
    console.log(`Marketplace deployed at: ${marketplace.address}`);

    if (network.name !== "hardhat" && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for contract propagation before verification...");
        await sleep(60000);

        console.log("Verifying ERC20Mock...");
        await run("verify:verify", {
            address: token.address,
            constructorArguments: ["TestToken", "TTK", ethers.utils.parseEther("1000")],
        });

        console.log("Verifying Marketplace...");
        await run("verify:verify", {
            address: marketplace.address,
            constructorArguments: [],
        });
    } else {
        console.log("Skipping contract verification (Hardhat Network detected). ");
    }

    console.log("✅ Deployment and verification completed!");
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});