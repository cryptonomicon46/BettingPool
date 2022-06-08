
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
// 24*3600*4
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
    const sender2 = accounts[4]
    const sender3 = accounts[5]


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
    

        it('Only owner can set the developer address', async () => {

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

     
    })


    describe('Set betting campaigns ', () => {

        // let milliseconds = 120000 // Number between 100000 - 999999
        let result, timeDeployed

        const DURATION = 200;//SECONDS
        const bettingStop = 345600;//24*3600*4; //4 days

        const c0_reveal= Date.parse("Sun, June 19, 2022 11:59:00"); //1655665140000
        const c0_endBet = c0_reveal - bettingStop; //1655664794400

        const c1_reveal= Date.parse("Sun, July 10, 2022 11:59:00"); //1657479540000
        const c1_endBet = c1_reveal - bettingStop;//1657479194400
        
        const c2_reveal= Date.parse("Mon, August 14, 2022 11:59:00"); //1660503540000
        const c2_endBet = c2_reveal - bettingStop;//1660503194400

        
        

        beforeEach(async () => {

            bettingPool = await BettingPool.new(
                ids,
                prices,
                maxAmounts
            )
            await bettingPool.setAddresses(devAddress,{from: deployer});
            timeDeployed = Math.round(d.getTime()/1000);//time in seconds
            // console.log('StartTime:',timeDeployed);
            

            // timeDeployed = NFT_MINT_DATE - Number(milliseconds.toString().slice(0, 3))
        })
        it('Start three campaigns with different start and stop times and check everything.', async () => {
           

            await expect(bettingPool.setCampaign("0",'1',c0_reveal,c0_endBet,
                        {from: unauthorized})).to.be.rejected;

            //Create a campaign
            await bettingPool.setCampaign('0','1',c0_reveal,c0_endBet,{from: deployer})
            await bettingPool.setCampaign('0','2',c1_reveal,c1_endBet,{from: deployer})
            await bettingPool.setCampaign('0','3',c2_reveal,c2_endBet,{from: deployer})

        
            //Check number of campaigns
            result = await bettingPool.getNumCampaigns({from:deployer})
            assert.equal(result.toString(),'3')


            //Check the stage of the campaigns and make they're accepting bets accepting bets
            // 0: AcceptingBets
            // 1: BettingStopped
            // 2. Reveal Winner
            result = await bettingPool.getCampaignStage(1,{from: deployer})
            assert.equal(result.toString(),'0')

            result = await bettingPool.getCampaignStage(2,{from: deployer})
            assert.equal(result.toString(),'0')


            result = await bettingPool.getCampaignStage(3,{from: deployer})
            assert.equal(result.toString(),'0')

        
       
            //Confirm the start and end times
            result = await bettingPool.getCampaignInfo(1,{from: deployer})
            // console.log('Campaign1 Reveal Date:',result[2].toString());
            // console.log('Campaign1 Stop Bet Date:',result[3].toString());
            assert.equal(c0_endBet.toString(),result[2].toString())
            assert.equal(c0_reveal.toString(),result[3].toString())

            result = await bettingPool.getCampaignInfo(2,{from: deployer})
            // console.log('Campaign2 Reveal Date:',result[2].toString());
            // console.log('Campaign2 Stop Bet Date:',result[3].toString());
            assert.equal(c1_endBet.toString(),result[2].toString())
            assert.equal(c1_reveal.toString(),result[3].toString())

            result = await bettingPool.getCampaignInfo(3,{from: deployer})
            // console.log('Campaign3 Reveal Date:',result[2].toString());
            // console.log('Campaign3 Stop Bet Date:',result[3].toString());
            assert.equal(c2_endBet.toString(),result[2].toString())
            assert.equal(c2_reveal.toString(),result[3].toString())


            //Have Accounts bet on the racers and confirm number of bidders and total amount per campaign
            await bettingPool.bet(1,46,{from:sender1, value:  web3.utils.toWei("0.1")})
            await bettingPool.bet(1,99,{from:sender1, value:  web3.utils.toWei("0.1")})
            await bettingPool.bet(1,93,{from:sender1, value:  web3.utils.toWei("0.1")})
            await bettingPool.bet(1,27,{from:sender1, value:  web3.utils.toWei("0.1")})

            await bettingPool.bet(1,46,{from:sender2, value:  web3.utils.toWei("0.2")})
            await bettingPool.bet(1,99,{from:sender2, value:  web3.utils.toWei("0.2")})
            
            await bettingPool.bet(1,27,{from:sender3, value:  web3.utils.toWei("0.4")})

            result = await bettingPool.getCampaignInfo(1,{from: deployer})
            assert.equal(result[5].toString(),'7')
            assert.equal(result[6].toString(),web3.utils.toWei('1.2'))

            //Have Accounts bet on specific racer and confirm number of bidders and total amount
            result = await bettingPool.returnNumberBidders(1,46,{from:deployer})
            assert.equal(result.toString(),'2')

            result = await bettingPool.returnNumberBidders(1,93,{from:deployer})
            assert.equal(result.toString(),'1')

            result = await bettingPool.returnNumberBidders(1,99,{from:deployer})
            assert.equal(result.toString(),'2')

            result = await bettingPool.returnNumberBidders(1,27,{from:deployer})
            assert.equal(result.toString(),'2')



        

            //Advance time End one campaign and then check the stage, confirm remaining campaigns are still active
            
            
            //Check winner for the campaign that ended

            
            //Confirm the Winner payout


            //Confirm the developer payout



        })



     
    })
 
})