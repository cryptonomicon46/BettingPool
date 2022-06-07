# BettingPool
Betting pool for MotoGp, WSBK and Moto2

truffle init
npm install

==========DEPLOY ON LOCAL GANACHE =========
truffle compile --config truffle-config.polygon.js -all
truffle migrate --config truffle-config.polygon.js --network ganache
truffle test test/test_BettingPool.js --config truffle-config.polygon.js --network ganache