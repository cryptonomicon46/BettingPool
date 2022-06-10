const { default: Web3 } = require("web3");

const BettingPool = artifacts.require("BettingPool");

function tokens(n) {
    return Web3.utils.toWei(n,'ether');
}


const ids =[46,93,99,27]; 

const  maxAmounts =  [30,20,20,20];


module.exports = async function (deployer) {
    deployer.deploy(BettingPool,
        ids,
        maxAmounts,
        // {gas: 5000000, gasPrice: 500000000}
        );
}

