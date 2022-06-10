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
truffle migrate --config truffle-config.polygon.js --network polygon_infura_testnet
truffle run verify BettingPool --network polygon_infura_testnet --config truffle-config.polygon.js


_deployBettingPool.js
======================

   Deploying 'BettingPool'
   -----------------------
   > transaction hash:    0x46169c84a6ec7eab70eb1a14b76b800afb6a72a400ffbf2d9fa24b39c168b7aa
   > Blocks: 1            Seconds: 4
   > contract address:    0xA52bbBFC24104FB17188e69167a7247259b291EB
   > block number:        26687661
   > block timestamp:     1654873521
   > account:             0xC5AE1dd3c4bBC7bD1f7260A4AC1758eb7c38C021
   > balance:             0.2038297827411265
   > gas used:            4097946 (0x3e879a)
   > gas price:           2.50000001 gwei
   > value sent:          0 ETH
   > total cost:          0.01024486504097946 ETH

   Pausing for 2 confirmations...

   -------------------------------
   > confirmation number: 1 (block: 26687662)
   > confirmation number: 2 (block: 26687663)
   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:     0.01024486504097946 ETH

Contract addresS:
Verified Polyscan link: https://mumbai.polygonscan.com/address/0xA52bbBFC24104FB17188e69167a7247259b291EB






//===========================
Adding Polygon Mainnet and test net to Metamask
https://docs.polygon.technology/docs/develop/network-details/network/


https://chainlist.org/
Search for your network and add it