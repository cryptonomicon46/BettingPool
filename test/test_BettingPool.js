


const BettingPool = artifacts.require("./BettingPool")


const { assert, expect, should, Assertion } = require('chai')



require('chai')
    .use(require('chai-as-promised'))
    .should()

const EVM_REVERT = 'VM Exception while processing transaction: revert'
const ids =[46,93,99,27]; 
const prices =[ web3.utils.toWei("1"),
                web3.utils.toWei("0.5"),
                web3.utils.toWei("0.5",),
                web3.utils.toWei("0.5")];

const  maxAmounts = [50,25,25,25];

    // const user = process.env.MM_ACCNT_3
// contract('MotoPunks', ([deployer, user]) => {

    const d = new Date();

    const nftInfo = ["46,1000000000000000000,50",
                    "93,500000000000000000,25",
                    "99,500000000000000000,25",
                    "27,500000000000000000,25",
                    "27,500000000000000000,0"]
    
    let _tokenURI=  "https://ipfs.io/ipfs/QmcDRWwXCE1LjvdESNZsmc75syTJP2zA8WW9SHEaCwEmkc/{id}.json";
    var tokenURI;
    let newTokenURI = "NewTokenURI{id}.json";
    let base_ext = ".json";

contract('Betting Pool and Mint', async (accounts) => {
    const deployer = accounts[0]
    const devAddress = accounts[1]
    const sender1 = accounts[2]
    const sender2 = accounts[3]
     console.log(deployer)
     console.log(devAddress)
     console.log(sender1)
     console.log(sender2)



    describe('Deployment', () => {

        // let milliseconds = 120000 // Number between 100000 - 999999
        let result, timeDeployed

        beforeEach(async () => {

            bettingPool = await BettingPool.new(
                ids,
                prices,
                maxAmounts
            )

            // timeDeployed = NFT_MINT_DATE - Number(milliseconds.toString().slice(0, 3))
        })

        it('Returns the contract owner', async () => {
            result = await bettingPool.owner()
            // result.should.equal(NAME)
            // console.log(result)
            assert.equal(result,deployer)
        })

        // it('Returns the owner', async () => {
        //     result = await bettingPool.owner()
        //     // result.should.equal(SYMBOL)
        //     assert.equal(result,deployer)
        // })

        // it('Returns the cost to mint', async () => {
        //     result = await motoPunks.cost()
        //     // result.toString().should.equal(COST.toString())
        //     assert.equal(result.valueOf(),0)
        // })

        // it('Returns the max supply', async () => {
        //     result = await motoPunks.maxSupply()
        //     // result.toString().should.equal(MAX_SUPPLY.toString())
        //     assert.equal(result.valueOf(),MAX_SUPPLY);
        // })
    

        // it('Returns the max mint amount', async () => {
        //     result = await motoPunks.maxMintAmount()
        //     // result.toString().should.equal('1')
        //     assert.equal(result,MAX_MINT_AMOUNT)
        // })

        // it('Returns the time deployed', async () => {
        //     result = await motoPunks.timeDeployed()
        //     console.log("Time Deployed =",result.toString())

        //     if (result > 0) {
        //         assert.isTrue(true)
        //     } else {
        //         console.log(result)
        //         assert.isTrue(false)
        //     }
        // })

        // it('Returns the amount of seconds from deployment to wait until minting', async () => {
        //     let buffer = 10
        //     let target = Number(milliseconds.toString().slice(0, 3))
        //     result = await motoPunks.allowMintingAfter()
        //     result = Number(result)
        //     console.log(target, result)
        //     // NOTE: Sometimes the seconds may be off by 1, As long as the seconds are 
        //     // between the buffer zone, we'll pass the test
        //     if (result > (target - buffer) && result <= target) {
        //         assert.isTrue(true)
        //     } else {
        //         assert.isTrue(false)
        //     }
        // })

        // it('Returns how many seconds left until minting allowed', async () => {
        //     let buffer = 10
        //     let target = Number(milliseconds.toString().slice(0, 3))
        //     result = await motoPunks.getSecondsUntilMinting()
        //     console.log("Time until mint=", result.toString())
        //     result = Number(result)
        //     if (result > (target -buffer)) {
        //         assert.isTrue(true)
        //     } else {
        //         assert.isTrue(false)
        //     }

        
        //     // assert.equal(result,120);
        // })

        // it('Returns current pause state', async () => {
        //     result = await motoPunks.isPaused()
        //     // result.toString().should.equal('false')
        //     assert.equal(result.toString(),"false")
        // })

        // it('Returns current reveal state', async () => {
        //     result = await motoPunks.isRevealed()
        //     // result.toString().should.equal('true')
        //     assert.equal(result.toString(),"true")
        // })
    })

    // describe('Minting', async () => {
    //     describe('Success', async () => {
   

    //         let result

    //         beforeEach(async () => {
    //             const NFT_MINT_DATE = Date.now().toString().slice(0, 10) 
    //             // const NFT_MINT_DATE = Date("February 28, 2022 18:00:00")
     
    //             motoPunks = await MotoPunks.new(
    //                 NAME,
    //                 SYMBOL,
    //                 COST,
    //                 MAX_SUPPLY,
    //                 NFT_MINT_DATE,
    //                 IPFS_IMAGE_METADATA_URI,
    //                 // IPFS_HIDDEN_IMAGE_METADATA_URI,
    //             )

    //             result = await motoPunks.mint(1, { from: user, value: web3.utils.toWei('0', 'ether') })

    //         })

    //         it('Returns the address of the minter', async () => {
    //             let to = result.logs[0].args.to
    //             assert.equal(user.toString(),to.toString())
     
    //         })

    //         it('Updates the total supply', async () => {
    //             result = await motoPunks.totalSupply()
    //             result.toString().should.equal('1')
    //         })

    //         it('Returns IPFS URI', async () => {
    //             result = await motoPunks.tokenURI(1)
    //             result.should.equal(`${IPFS_IMAGE_METADATA_URI}1.json`)
    //         })

    //         it('Returns how many a minter owns', async () => {
    //             result = await motoPunks.balanceOf(user)
    //             result.toString().should.equal('1')
    //         })

    //         it('Returns the IDs of minted NFTs', async () => {
    //             result = await motoPunks.walletOfOwner(user)
    //             result.length.should.equal(1)
    //             result[0].toString().should.equal('1')
    //         })
    //     })


    // })


    // describe('Failure', async () => {

    //     let result

    //     beforeEach(async () => {
    //         // Some date in the future
    //         const NFT_MINT_DATE = new Date("April 28, 2022 18:00:00").getTime().toString().slice(0, 10)

    //         motoPunks = await MotoPunks.new(
    //             NAME,
    //             SYMBOL,
    //             COST,
    //             MAX_SUPPLY,
    //             NFT_MINT_DATE,
    //             IPFS_IMAGE_METADATA_URI,
    //             // IPFS_HIDDEN_IMAGE_METADATA_URI,
    //         )

    //         console.log(user)
            
    //     })

    //     it('Attempt to mint before mint date', async () => {
    //         await motoPunks.mint(1, { from: user, value: web3.utils.toWei('0', 'ether') }).should.be.rejectedWith(EVM_REVERT)
    //     })
    // })

    // describe('Updating Contract State', async () => {
    //     describe('Success', async () => {

    //         let result

    //         beforeEach(async () => {
    //             const NFT_MINT_DATE = Date.now().toString().slice(0, 10)
    //             // console.log(NFT_MINT_DATE)

    //             motoPunks = await MotoPunks.new(
    //                 NAME,
    //                 SYMBOL,
    //                 COST,
    //                 MAX_SUPPLY,
    //                 NFT_MINT_DATE,
    //                 IPFS_IMAGE_METADATA_URI,
    //                 // IPFS_HIDDEN_IMAGE_METADATA_URI,
    //             )
    //         })

    //         it('Sets the cost', async () => {
    //             let cost = web3.utils.toWei('1', 'ether')
    //             await motoPunks.setCost(cost, { from: deployer })
    //             result = await motoPunks.cost()
    //             result.toString().should.equal(cost)
    //         })

    //         it('Sets the pause state', async () => {
    //             let isPaused = true // Opposite of the default contract state
    //             await motoPunks.setIsPaused(isPaused, { from: deployer })
    //             result = await motoPunks.isPaused()
    //             result.toString().should.equal(isPaused.toString())
    //         })

    //         it('Sets the reveal state', async () => {
    //             let isRevealed = false // Opposite of the default contract state
    //             await motoPunks.setIsRevealed(isRevealed, { from: deployer })
    //             result = await motoPunks.isRevealed()
    //             result.toString().should.equal(isRevealed.toString())
    //         })

    //         it('Sets the max batch mint amount', async () => {
    //             let amount = 5 // Different from the default contract state
    //             await motoPunks.setmaxMintAmount(5, { from: deployer })
    //             result = await motoPunks.maxMintAmount()
    //             result.toString().should.equal(amount.toString())
    //         })

    //         // it('Sets the IPFS not revealed URI', async () => {
    //         //     let uri = 'ipfs://IPFS-NEW-IMAGE-METADATA-CID/' // Different from the default contract state
    //         //     await motoPunks.setNotRevealedURI(uri, { from: deployer })
    //         //     result = await motoPunks.notRevealedUri()
    //         //     result.toString().should.equal(uri)
    //         // })

    //         it('Sets the base extension', async () => {
    //             let extension = '.example' // Different from the default contract state
    //             // await motoPunks.setBaseExtension('.example', { from: deployer })
    //             await motoPunks.setBaseExtension(extension, { from: deployer })

    //             result = await motoPunks.baseExtension()
    //             result.toString().should.equal(extension)
    //         })
    //     })
    // })
})