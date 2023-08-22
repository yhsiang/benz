import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-abi-exporter";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  abiExporter: {
    path: './abis',
    runOnCompile: true,
    clear: true,
    flat: true,
    only: ['BenzNFT'],
    spacing: 2,
    except: ["interfaces"]
    // pretty: true,
    // format: "minimal",
  }
};

export default config;
