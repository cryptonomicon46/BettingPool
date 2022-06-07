
const HDWalletProvider = require('@truffle/hdwallet-provider');
// create a file at the root of your project and name it .env -- there you can set process variables
// like the mnemomic and Infura project key below. Note: .env is ignored by git to keep your private information safe
require('dotenv').config();
const mnemonic = process.env["MNEMONIC"];
const infuraProjectId = process.env["PROJECT_ID"];

module.exports = {


    plugins: ['truffle-plugin-verify'],

    api_keys: {
        etherscan: process.env.P_API_KEY,
        polygonscan: process.env.P_API_KEY,

      },




  /**
  * contracts_build_directory tells Truffle where to store compiled contracts
  */
  contracts_build_directory: './build/polygon-contracts',

  /**
  * contracts_directory tells Truffle where the contracts you want to compile are located
  */
  contracts_directory: './contracts/polygon',


  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
      gas: 5000000, 
      gasPrice: 500000000
        },

    // develop: {
    //     port: 8545,
    //     network_id: 20,
    //     accounts: 5,
    //     defaultEtherBalance: 500,
    //     blockTime: 3
    //   },

    ganache: {
        host: "127.0.0.1",     // Localhost (default: none)
        port: 7545,            // Standard Ethereum port (default: none)
        network_id: 5777,       // Any network (default: none)
        gas: 5000000, 
        gasPrice: 500000000
      },

    ganacheCLI: {
        host: "127.0.0.1",     // Localhost (default: none)
        port: 8545,            // Standard Ethereum port (default: none)
        network_id: 1337       // Any network (default: none)
      },

    //polygon Infura mainnet
    polygon_infura_mainnet: {
      provider: () => new HDWalletProvider(mnemonic,"https://polygon-mainnet.infura.io/v3/" + infuraProjectId),
      network_id: 137,
      gasPrice: 11000000000000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      chainId: 137
    },
    
    polygon_infura_testnet: {
      provider: () => new HDWalletProvider(
        mnemonic,"https://polygon-mumbai.infura.io/v3/" + infuraProjectId
      ),

    //   provider: () => new HDWalletProvider(privatekey, "https://polygon-mumbai.infura.io/v3/" + infuraProjectId),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      chainId: 80001
    },


  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
        version: "^0.8.13",
        settings: {
            optimizer:{
                enabled: true,
                runs: 200,},
        evmVersion: "byzantium",



        }
        
    }
  },
  db: {
    enabled: true
  }
}
