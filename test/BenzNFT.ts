import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import tokenURIs from "../metadata/tokenURIs.json";

describe("BenzNFT", function () {
  async function deploymentFixture() {
    const [owner, account1, account2, account3, account4, account5] = await ethers.getSigners();
    const currentDate = Math.round(Date.now() / 1000);
    const startDate = currentDate + 86400;
    const endDate = startDate + 86400;
    const benzNFT = await ethers.deployContract("BenzNFT", [startDate, endDate, tokenURIs]);
    return { currentDate, startDate, endDate, benzNFT, owner, account1, account2, account3, account4,  account5 }
  }

  describe("Deployment", function () {
    it("Should set the right startDate and endDate", async function () {
      const { benzNFT, startDate, endDate } = await loadFixture(deploymentFixture);

      expect(await benzNFT.startDate()).to.equal(startDate);
      expect(await benzNFT.endDate()).to.equal(endDate);
    });
  });

  describe("mintNFT()", function() {
    it("Should revert before the valid duration", async function () {
      const { benzNFT } = await loadFixture(deploymentFixture);

      await expect(benzNFT.mintNFT()).to.be.revertedWith(
        "it's not the right time to mint"
      );
    });
    it("Should revert after the valid duration", async function () {
      const { benzNFT, endDate } = await loadFixture(deploymentFixture);
      await time.increaseTo(endDate);
      await expect(benzNFT.mintNFT()).to.be.revertedWith(
        "it's not the right time to mint"
      );
    });
    it("Should mint successfully", async function () {
      const { benzNFT, startDate } = await loadFixture(deploymentFixture);
      await time.increaseTo(startDate);

      await expect(benzNFT.mintNFT()).not.to.be.reverted;
    });

    it("Should revert with minting twice", async function () {
      const { benzNFT, startDate } = await loadFixture(deploymentFixture);
      await time.increaseTo(startDate);

      await expect(benzNFT.mintNFT()).not.to.be.reverted;
      await expect(benzNFT.mintNFT()).to.be.revertedWith(
        "you can not mint twice"
      );
    });

    it("Should revert with minting more than 5 NFTs", async function () {
      const { benzNFT, account1, account2, account3, account4, account5, startDate } = await loadFixture(deploymentFixture);
      await time.increaseTo(startDate);

      await expect(benzNFT.mintNFT()).not.to.be.reverted;
      await expect(benzNFT.connect(account1).mintNFT()).not.to.be.reverted;
      await expect(benzNFT.connect(account2).mintNFT()).not.to.be.reverted;
      await expect(benzNFT.connect(account3).mintNFT()).not.to.be.reverted;
      await expect(benzNFT.connect(account4).mintNFT()).not.to.be.reverted;
      await expect(benzNFT.connect(account5).mintNFT()).to.be.revertedWith(
        "only can mint 5 NFTs"
      );
    });
  });
});
