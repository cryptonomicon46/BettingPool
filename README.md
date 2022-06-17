# BettingPool
Betting pool for MotoGp, WSBK and Moto2

truffle init
npm install

==========DEPLOY ON LOCAL GANACHE =========
truffle compile --config truffle-config.polygon.js -all
truffle migrate --config truffle-config.polygon.js --network ganache --reset
truffle test test/test_BettingPool.js --config truffle-config.polygon.js --network ganache

==========DEPLOY ON POLYGON TEST NET =========
truffle compile -all --config truffle-config.polygon.js --network polygon_infura_testnet
truffle migrate --config truffle-config.polygon.js --network polygon_infura_testnet --reset
truffle run verify BettingPool --network polygon_infura_testnet --config truffle-config.polygon.js


_deployBettingPool.js
======================


   Replacing 'BettingPool'
   -----------------------
   > transaction hash:    0x2b71c312e9ef50ed48bb9d4b337520844b276afcbee8ffcd4b000cadd632e001
   > Blocks: 1            Seconds: 8
   > contract address:    0xD17B1adf439Bde59c56ad82EB2a0540d165966b6
   > block number:        26792155
   > block timestamp:     1655509265
   > account:             0xC5AE1dd3c4bBC7bD1f7260A4AC1758eb7c38C021
   > balance:             0.179462514607070837
   > gas used:            4152563 (0x3f5cf3)
   > gas price:           2.500000014 gwei
   > value sent:          0 ETH
   > total cost:          0.010381407558135882 ETH

   Pausing for 2 confirmations...

   -------------------------------
   > confirmation number: 1 (block: 26792156)
   > confirmation number: 2 (block: 26792157)
   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:     0.010381407558135882 ETH



Contract addresS:
Verified Polyscan link:https://mumbai.polygonscan.com/address/0xD17B1adf439Bde59c56ad82EB2a0540d165966b6#code



//===========================
Adding Polygon Mainnet and test net to Metamask
https://docs.polygon.technology/docs/develop/network-details/network/


Notes: 
Documentation
Refactor Code
Every function only does one thing
Onwer and dev can participate



==========DEPLOY ON POLYGON MAIN NET =========
truffle compile -all --config truffle-config.polygon.js --network polygon_infura_mainnet
truffle run verify Mint --network polygon_infura_mainnet --config truffle-config.polygon.js
truffle migrate --config truffle-config.polygon.js --network polygon_infura_mainnet







