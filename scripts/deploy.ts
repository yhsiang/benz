import { ethers } from "hardhat";
import tokenURIs from "../metadata/tokenURIs.json";

async function main() {
  const startDate = Math.round(Date.now() / 1000);
  const endDate = startDate + 86400;
  const benzNFT = await ethers.deployContract("BenzNFT", [startDate, endDate, tokenURIs]);
  const address = await benzNFT.getAddress();
   console.log("Contract deployed to address:", address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
