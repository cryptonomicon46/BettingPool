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
truffle run verify Mint --network polygon_infura_testnet --config truffle-config.polygon.js
