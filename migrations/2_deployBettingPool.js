// const BettingPool = artifacts.require("BettingPool");


//     const ids =[46,93,99,27]; 
//     const prices =[ web3.utils.toWei("1"),
//                     web3.utils.toWei("0.5"),
//                     web3.utils.toWei("0.5",),
//                     web3.utils.toWei("0.5")];
    
//     const  maxAmounts = [50,25,25,25];

// module.exports = async function (deployer) {
//     deployer.deploy(BettingPool,
//             ids,
//             prices,
//             maxAmounts
//         );
// }



const { default: Web3 } = require("web3");

const BettingPool = artifacts.require("BettingPool");

function tokens(n) {
    return Web3.utils.toWei(n,'ether');
}


const ids =[46,93,99,27,5]; 
// const prices =[ web3.utils.toWei("1"),
//                 web3.utils.toWei("0.5"),
//                 web3.utils.toWei("0.5",),
//                 web3.utils.toWei("0.5"),
//                 web3.utils.toWei("0.5")
//             ];

    const prices =[ web3.utils.toWei("0.001"),
        web3.utils.toWei("0.0005"),
        web3.utils.toWei("0.0005",),
        web3.utils.toWei("0.0005"),
        web3.utils.toWei("0.0005")
    ];

const  maxAmounts = [50,25,25,25,0];

// const royaltyFees = 5;
const maxMintamount = 10;



// = 10000000000000000;
module.exports = async function (deployer) {
    deployer.deploy(BettingPool,
        ids,
        prices,
        maxAmounts,
        // {gas: 5000000, gasPrice: 500000000}
        );
}

