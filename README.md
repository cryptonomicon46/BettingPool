# BettingPool
Betting pool for MotoGp, WSBK and Moto2

truffle init
npm install


==========DEPLOY ON POLYGON MAIN NET =========
truffle compile -all --config truffle-config.polygon.js --network polygon_infura_mainnet
truffle migrate --config truffle-config.polygon.js --network polygon_infura_mainnet
truffle run verify BettingPool --network polygon_infura_mainnet --config truffle-config.polygon.js

https://polygonscan.com/address/0x59a9c54c35f097c30258bc980071f94128b775d6#code

Verified Contract on Polygon mainnet.

https://polygonscan.com/address/0x59a9c54c35f097c30258bc980071f94128b775d6#code
======================
Details of the cost of deploying the contract 
   Deploying 'BettingPool'
   -----------------------
   > transaction hash:    0x3ec1936071131645c6ca446e66e20ed116755cf9982982e3ffecf6f2b615e5f6
   > Blocks: 3            Seconds: 4
   > contract address:    0x59A9C54c35F097C30258bc980071F94128b775d6
   > block number:        29694431
   > block timestamp:     1655509582
   > account:             0xC5AE1dd3c4bBC7bD1f7260A4AC1758eb7c38C021
   > balance:             107.9842272543370466
   > gas used:            4152563 (0x3f5cf3)
   > gas price:           11000 gwei
   > value sent:          0 ETH
   > total cost:          45.678193 ETH

   Pausing for 2 confirmations...

   -------------------------------
   > confirmation number: 2 (block: 29694434)
   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:           45.678193 ETH

Summary
=======
> Total deployments:   2
> Final cost:          47.621948 ETH










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

