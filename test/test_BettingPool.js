
const BettingPool = artifacts.require("./BettingPool")


const { assert, expect, should, Assertion } = require('chai')



require('chai')
    .use(require('chai-as-promised'))
    .should()

const EVM_REVERT = 'VM Exception while processing transaction: revert'
const ids =[46,93,99,27]; 
// const prices =[ web3.utils.toWei("1"),
//                 web3.utils.toWei("0.5"),
//                 web3.utils.toWei("0.5",),
//                 web3.utils.toWei("0.5"),
//                 web3.utils.toWei("0.5")
//             ];

    const prices =[ web3.utils.toWei("0.01"),
        web3.utils.toWei("0.005"),
        web3.utils.toWei("0.005",),
        web3.utils.toWei("0.005")
    ];

const  maxAmounts = [50,25,25,25];


    const d = new Date();

    const nftInfo = ["46,10000000000000000,50",
                    "93,5000000000000000,25",
                    "99,5000000000000000,25",
                    "27,5000000000000000,25"]
    
    let _tokenURI=  "https://ipfs.io/ipfs/QmcDRWwXCE1LjvdESNZsmc75syTJP2zA8WW9SHEaCwEmkc/{id}.json";
    var tokenURI;
    let newTokenURI = "NewTokenURI{id}.json";
    let base_ext = ".json";
    

contract('Betting Pool and Mint', async (accounts) => {
    const deployer = accounts[0]
    const devAddress = accounts[1]
    const sender1 = accounts[2]
    const unauthorized = accounts[3]

     console.log("Deployer Addr:",deployer)
     console.log("Developer Addr:",devAddress)
     console.log("Unauthorized Addr:",unauthorized)
     console.log("Sender1 Addr:",sender1)



    describe('Deployment', () => {

        // let milliseconds = 120000 // Number between 100000 - 999999
        let result, timeDeployed

        beforeEach(async () => {

            bettingPool = await BettingPool.new(
                ids,
                prices,
                maxAmounts
            )
            await bettingPool.setAddresses(devAddress,{from: deployer});

            // timeDeployed = NFT_MINT_DATE - Number(milliseconds.toString().slice(0, 3))
        })

        it('Returns the contract owner', async () => {
            result = await bettingPool.owner()
            assert.equal(result,deployer)
        })
    

        it('Only owner can set beneficiary and developer addresses', async () => {

            await expect(bettingPool.setAddresses
                (devAddress,{from: unauthorized})).to.be.rejected;    

            await bettingPool.setAddresses(sender1,{from: deployer})
            result = await bettingPool.getAddresses({from:deployer})
            console.log("New Developer Addr",result.toString())

        })




        it('Check NFT Info per tokenID', async () => {
            for(let i =0; i< ids.length; i++) {
            result = await bettingPool.getNFTInfo(ids[i])
            // console.log(result.toString())
            expect(result.toString()).to.equal(nftInfo[i]);

            }
        })


        it('Test if the URI function returns the correct per token URI', async () => {
            for(let i =0; i< ids.length; i++) {
            result = await bettingPool.uri(ids[i]);
            tokenURI = _tokenURI.replace("{id}",ids[i].toString());
            // console.log(`${result}, ${tokenURI}`);
            expect(result).to.equal(tokenURI.replace("{id}",ids[i].toString()));
        }
        })



        it("Test to confirm that TokenURI can be changed by owner if needed.", async() => {

            for (let i=0;i< ids.length; i++) {
                await bettingPool.setTokenURI(newTokenURI.slice(0,11),ids[i].toString(), {from: deployer});
                result = await bettingPool.uri(ids[i].toString())
                expect(result).to.equal(newTokenURI.slice(0,11).concat(ids[i].toString().concat(".json")))
            }
        })



                
        // it('Only owner can set the campaigns', async () => {
        //     await bettingPool.setAddresses(beneficiary,devAddress,{from: deployer})
        //     await expect(bettingPool.mintSingle("46",1,'1654635083695',{from: unauthorized,value: "1"})).to.be.rejected;
        // })





     
    })


    // describe('Set betting campaigns ', () => {

    //     // let milliseconds = 120000 // Number between 100000 - 999999
    //     let result, timeDeployed

    //     const DURATION = 200;//SECONDS
    //     var myDate = "26-02-2012";
    //     myDate = myDate.split("-");
    //     var newDate = new Date( myDate[2], myDate[1] - 1, myDate[0]);
    //     console.log(newDate.getTime());


    //             let dateInAWeek = new Date(); // now
    //     dateInAWeek.setDate(dateInAWeek.getDate() + 7); // add 7 days
    //     const deadline = Math.floor(dateInAWeek.getTime() / 1000); // unix timestamp

    //     contractName.setDeadline(deadline);

    //     beforeEach(async () => {

    //         bettingPool = await BettingPool.new(
    //             ids,
    //             prices,
    //             maxAmounts
    //         )
    //         await bettingPool.setAddresses(devAddress,{from: deployer});
    //         timeDeployed = Math.round(d.getTime()/1000);//time in seconds

    //         //Set One MotoGP Campaign 
    //         await bettingPool.setCampaign('0','1',)

    //         auctionEndTime = Math.round(d.getTime()/1000) + DURATION ;//time in seconds

    //         console.log('StartTime:',timeDeployed,' EndTime:', auctionEndTime);
    //         // timeDeployed = NFT_MINT_DATE - Number(milliseconds.toString().slice(0, 3))
    //     })
    //     it('Developer not allowed to bet', async () => {
    //         //Create a campaign
    //         await bettingPool.setCampaign('0','1',)
    //         await expect(bettingPool.bet("46",1,{from: devAddress,value: "1"})).to.be.rejected;
    //     })



     
    // })
 
})