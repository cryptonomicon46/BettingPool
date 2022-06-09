
const BettingPool = artifacts.require("./BettingPool")


const { assert, expect, should, Assertion } = require('chai')
const { BN, expectRevert, time } = require('@openzeppelin/test-helpers');



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

    const prices =[ web3.utils.toWei("10"),
                    web3.utils.toWei("5"),
                    web3.utils.toWei("5",),
                    web3.utils.toWei("5")];
// 24*3600*4
const  maxAmounts = [50,25,25,25];


    const d = new Date();

    const nftInfo = ["46,10000000000000000000,50",
                    "93,5000000000000000000,25",
                    "99,5000000000000000000,25",
                    "27,5000000000000000000,25"]
    
    let _tokenURI=  "https://ipfs.io/ipfs/QmcDRWwXCE1LjvdESNZsmc75syTJP2zA8WW9SHEaCwEmkc/{id}.json";
    var tokenURI;
    let newTokenURI = "NewTokenURI{id}.json";
    let base_ext = ".json";
    
    const DURATION = 200;//SECONDS



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


    describe('Start betting campaigns and test related functions.', () => {

        // let milliseconds = 120000 // Number between 100000 - 999999
        let result, timeDeployed

        // const d4 = new Date("June 19, 2022 11:59:59");//1655665199000
        //d4.getDate()
        // d4.getTime()
        // d4.getDay()  Sunday= 0,...Sat = 6
        // const bettingStop = 4*24*3600*1000;

        const bettingStop = 345600000;//24*3600*4*1000; //4 days

        const c1_reveal= Date.parse("Sun, June 19, 2022 11:59:59"); //1655665199000
        const c1_endBet = c1_reveal - bettingStop; //1655319599000

        const c2_reveal= Date.parse("Sun, July 10, 2022 11:59:59"); //1657479599000
        const c2_endBet = c2_reveal - bettingStop;//1657133999000
        
        const c3_reveal= Date.parse("Mon, August 14, 2022 11:59:59"); //1660503599000
        const c3_endBet = c3_reveal - bettingStop;//1660157999000

        beforeEach(async () => {

            bettingPool = await BettingPool.new(
                ids,
                prices,
                maxAmounts
            )
            await bettingPool.setAddresses(devAddress,{from: deployer});

            // timeDeployed = NFT_MINT_DATE - Number(milliseconds.toString().slice(0, 3))
        })



        // it("Only owner can start a new campaign", async () =>{
        //     await expect(bettingPool.setCampaign("0",'1',c0_reveal,c0_endBet,
        //     {from: unauthorized})).to.be.rejected;
        // })

        it('Check campaign stages.', async () => {
           
           
        await bettingPool.setCampaign(0,1,c1_reveal,{from: deployer})
        await bettingPool.setCampaign(0,2,c2_reveal,{from: deployer})
        await bettingPool.setCampaign(0,3,c3_reveal,{from: deployer})
        await bettingPool.setAddresses(devAddress,{from: deployer});
        timeDeployed = Math.round(d.getTime()/1000);//time in seconds
        console.log('StartTime:',timeDeployed);
            
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

        
       
        

        })

        it('Check Reveal and betting stop dates.', async () => {
            await bettingPool.setCampaign(0,1,c1_reveal,{from: deployer})
            await bettingPool.setCampaign(0,2,c2_reveal,{from: deployer})
            await bettingPool.setCampaign(0,3,c3_reveal,{from: deployer})
            await bettingPool.setAddresses(devAddress,{from: deployer});
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
            // console.log('Campaign1 Reveal Date:',result[3].toString());
            // console.log('Campaign1 Stop Bet Date:',result[2].toString());
            assert.equal(c1_endBet.toString(),result[2].toString())
            assert.equal(c1_reveal.toString(),result[3].toString())

            result = await bettingPool.getCampaignInfo(2,{from: deployer})
            // console.log('Campaign2 Reveal Date:',result[3].toString());
            // console.log('Campaign2 Stop Bet Date:',result[2].toString());
            assert.equal(c2_endBet.toString(),result[2].toString())
            assert.equal(c2_reveal.toString(),result[3].toString())

            result = await bettingPool.getCampaignInfo(3,{from: deployer})
            // console.log('Campaign3 Reveal Date:',result[3].toString());
            // console.log('Campaign3 Stop Bet Date:',result[2].toString());
            assert.equal(c3_endBet.toString(),result[2].toString())
            assert.equal(c3_reveal.toString(),result[3].toString())

        })


        it("Accept bets from accounts.", async() => {


            await bettingPool.setCampaign(0,1,c1_reveal,{from: deployer})

            //Make sure no NFTs are minted at at bid
            // result = bettingPool.balanceOf()


            result = await bettingPool.currentBlockStamp({from: deployer})
            console.log('CurrentBlockTimeStamp:',result.toString());
            result = await bettingPool.getCampaignInfo(1,{from: deployer})
            console.log('Campaign1 Reveal Date:',result[3].toString());
            console.log('Campaign1 Stop Bet Date:',result[2].toString());
            result = await bettingPool.getCampaignStage(1,{from: deployer})
            assert.equal(result.toString(),'0')
        //         //   //Have Accounts bet on the racers and confirm number of bidders and total amount per campaign
        try {        
            await bettingPool.bet(1,"46",{from:sender1, value: "1"})

            
        } catch (error) { console.log(error)
            
        }
        // await bettingPool.bet(1,99,{from:sender1, value:  web3.utils.toWei("0.1")})
        // await bettingPool.bet(1,93,{from:sender1, value:  web3.utils.toWei("0.1")})
        // await bettingPool.bet(1,27,{from:sender1, value:  web3.utils.toWei("0.1")})

        // await bettingPool.bet(1,46,{from:sender2, value:  web3.utils.toWei("0.2")})
        // await bettingPool.bet(1,99,{from:sender2, value:  web3.utils.toWei("0.2")})
        
        // await bettingPool.bet(1,27,{from:sender3, value:  web3.utils.toWei("0.4")})

        // result = await bettingPool.getCampaignInfo(1,{from: deployer})
        // assert.equal(result[5].toString(),'7')

                //   //Check campaign's total balance 
                //   assert.equal(result[6].toString(),web3.utils.toWei('1.2'))
      
                //   //Check number of bidders/campaign on specific racers
                //   result = await bettingPool.returnNumberBidders(1,46,{from:deployer})
                //   assert.equal(result.toString(),'2')
      
                //   result = await bettingPool.returnNumberBidders(1,93,{from:deployer})
                //   assert.equal(result.toString(),'1')
      
                //   result = await bettingPool.returnNumberBidders(1,99,{from:deployer})
                //   assert.equal(result.toString(),'2')
      
                //   result = await bettingPool.returnNumberBidders(1,27,{from:deployer})
                //   assert.equal(result.toString(),'2')

        })

  
        //  it("Check if owner can change the campaign prematurely using a state change", async() => {
        //     //Check if campaigns are active before the stage change

        //     //Check the stage of the campaigns and make they're accepting bets accepting bets
        //     //before making a state change
        //     // 0: AcceptingBets
        //     // 1: BettingStopped
        //     // 2. Reveal Winner
        //     result = await bettingPool.getCampaignStage(1,{from: deployer})
        //     assert.equal(result.toString(),'0')

        //     result = await bettingPool.getCampaignStage(2,{from: deployer})
        //     assert.equal(result.toString(),'0')

        //     result = await bettingPool.getCampaignStage(3,{from: deployer})
        //     assert.equal(result.toString(),'0')

        //     //Change the stage of the campaigns to '1' : BettingStopped
        //     await bettingPool.setCampaignStage(0,1,{from: deployer})
        //     result = await bettingPool.getCampaignStage(0,{from: deployer})
        //     assert.equal(result.toString(),'1')

        //     await bettingPool.setCampaignStage(1,1,{from: deployer})
        //     result = await bettingPool.getCampaignStage(1,{from: deployer})
        //     assert.equal(result.toString(),'1')

        //     await bettingPool.setCampaignStage(2,1,{from: deployer})
        //     result = await bettingPool.getCampaignStage(2,{from: deployer})
        //     assert.equal(result.toString(),'1')


        //     //Change the stage of the campaigns to '2': RevealWinner
        //     await bettingPool.setCampaignStage(0,2,{from: deployer})
        //     result = await bettingPool.getCampaignStage(0,{from: deployer})
        //     assert.equal(result.toString(),'2')

        //     await bettingPool.setCampaignStage(1,2,{from: deployer})
        //     result = await bettingPool.getCampaignStage(1,{from: deployer})
        //     assert.equal(result.toString(),'2')

        //     await bettingPool.setCampaignStage(2,2,{from: deployer})
        //     result = await bettingPool.getCampaignStage(2,{from: deployer})
        //     assert.equal(result.toString(),'2')
        //  })



        //  it("Accept bets on Campaign#1 from accounts, check end betting, reveal winner, mint NFT and send proceeds to winner and pay the 5% platform fees.", 
        //  async() => {
 
        //          //Create a campaign
        //            //Have Accounts bet on the racers and confirm number of bidders and total amount per campaign
        //            await bettingPool.bet(1,46,{from:sender1, value:  web3.utils.toWei("0.1")})      
        //            await bettingPool.bet(1,46,{from:sender2, value:  web3.utils.toWei("0.2")})                 
        //            await bettingPool.bet(1,46,{from:sender3, value:  web3.utils.toWei("0.4")}) //Winner


        //            //Check number of better on this racing campaign
        //            result = await bettingPool.getCampaignInfo(1,{from: deployer})
        //            assert.equal(result[5].toString(),'3')
   
        //            result = await bettingPool.getCampaignInfo(1,{from: deployer})
        //         //    console.log('Campaign1 Reveal Date:',result[3].toString());
        //         //    console.log('Campaign1 Stop Bet Date:',result[2].toString());


        //             //Current Block time
        //             result = await bettingPool.currentBlockStamp({from: deployer})
        //             // console.log(`Current TimeStamp in Campaign1= ${result.toString()}`)
        //            //Advance time and end the betting period for campaign#1
    

        //            //Advance time and reveal winner for campaign#1

 
        //            await time.increase(c0_endBet+1);//Advance 1 day 
        //            result = await bettingPool.currentBlockStamp()
        //            console.log(`Campaign0 betting end time ${c0_endBet}`)
        //            await time.increase(c0_reveal +1);//Advance 1 day 
        //            console.log(`Campaign0 reveal winner time ${c0_reveal}`)


                //     //Check Winner's NFT balance
                //     result = await bettingPool.balanceOf(sender3,46)
                //     assert.equal.(result.toString(),'1')
                //    //Check campaign's total balance 
                //    assert.equal(result[6].toString(),web3.utils.toWei('1.2'))
                //    //Platform fees 5% 
                //    result = bettingPool.pendingWithdrawal({from:devAddress});
                //    console.log(`DevAddress Proceeds ${result.toString()}`)
                //    //Winner payout check
                //     result = bettingPool.pendingWithdrawal({from:sender3});
                //     console.log(`Winner Proceeds ${result.toString()}`)

        
 
        //  })
        

            //Advance time End one campaign and then check the stage, confirm remaining campaigns are still active
            
            
            //Check winner for the campaign that ended

            
            //Confirm the Winner payout


            //Confirm the developer payout



        // })



     
    })
 
})