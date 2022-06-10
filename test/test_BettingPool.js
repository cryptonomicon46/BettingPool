
const BettingPool = artifacts.require("./BettingPool")


const { assert, expect, should, Assertion } = require('chai')
const { BN, expectRevert, time } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');



require('chai')
    .use(require('chai-as-promised'))
    .should()

const EVM_REVERT = 'VM Exception while processing transaction: revert'
const ids =[46,93,99,27]; 

// 24*3600*4
const  maxAmounts = [50,25,25,25];


    const d = new Date();
        const nftInfo = ["46,50",
            "93,25",
            "99,25",
            "27,25"]


    const bettingStop = 345600000;//24*3600*4*1000; //4 days

    const c1_reveal= Date.parse("Sun, June 19, 2022 11:59:59"); //1655665199000
    const c1_endBet = c1_reveal - bettingStop; //1655319599000



    const c2_reveal= Date.parse("Sun, July 10, 2022 11:59:59"); //1657479599000
    const c2_endBet = c2_reveal - bettingStop;//1657133999000
    
    const c3_reveal= Date.parse("Mon, August 14, 2022 11:59:59"); //1660503599000
    const c3_endBet = c3_reveal - bettingStop;//1660157999000
    
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
                // prices,
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

      

        beforeEach(async () => {

            bettingPool = await BettingPool.new(
                ids,
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
           
        
        await bettingPool.setCampaign(0,1,c1_endBet/1000,{from: deployer})
        await bettingPool.setCampaign(0,2,c2_endBet/1000,{from: deployer})
        await bettingPool.setCampaign(0,3,c3_endBet/1000,{from: deployer})
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
            await bettingPool.setCampaign(0,1,c1_endBet/1000,{from: deployer})
            await bettingPool.setCampaign(0,2,c2_endBet/1000,{from: deployer})
            await bettingPool.setCampaign(0,3,c3_endBet/1000,{from: deployer})
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
            assert.equal((c1_endBet/1000).toString(),result[2].toString())
            assert.equal((c1_reveal/1000).toString(),result[3].toString())

            result = await bettingPool.getCampaignInfo(2,{from: deployer})
            // console.log('Campaign2 Reveal Date:',result[3].toString());
            // console.log('Campaign2 Stop Bet Date:',result[2].toString());
            assert.equal((c2_endBet/1000).toString(),result[2].toString())
            assert.equal((c2_reveal/1000).toString(),result[3].toString())

            result = await bettingPool.getCampaignInfo(3,{from: deployer})
            // console.log('Campaign3 Reveal Date:',result[3].toString());
            // console.log('Campaign3 Stop Bet Date:',result[2].toString());
            assert.equal((c3_endBet/1000).toString(),result[2].toString())
            assert.equal((c3_reveal/1000).toString(),result[3].toString())

        })


    
    })

    describe('Set one betting campaign and do the various checks', () => {

        // let milliseconds = 120000 // Number between 100000 - 999999
        let result, timeDeployed


        beforeEach(async () => {

        bettingPool = await BettingPool.new(
            ids,
            maxAmounts
        )
        await bettingPool.setAddresses(devAddress,{from: deployer});
        await bettingPool.setCampaign(0,1,(c1_endBet/1000),{from: deployer})
            // timeDeployed = NFT_MINT_DATE - Number(milliseconds.toString().slice(0, 3))
    })




    it("Accept bets and check number of betters and campaign balance.", async() => { 


        let stopBetDuration = time.duration.seconds(604800); //7 days from Friday
        let revealBetDuration = time.duration.seconds(3456000); //4 days

        startTime = await bettingPool.currentBlockStamp({from: deployer})
        // console.log('CurrentBlockTimeStamp:',startTime.toString());

        //Advance to stop time
        const stopTime_BN = web3.utils.toBN(startTime).add(stopBetDuration)
        // console.log('StopBet Timestamp:',stopTime_BN.toString());

        await bettingPool.setCampaign(0,2,stopTime_BN,{from: deployer})
         await bettingPool.bet(2,46,{from:sender1, value: web3.utils.toWei('0.5')}) //Winner
        await bettingPool.bet(2,46,{from:sender2, value: web3.utils.toWei('0.3')})
        await bettingPool.bet(2,46,{from:sender3, value: web3.utils.toWei('0.2')})

        result = await bettingPool.getCampaignInfo(2,{from:deployer})
        assert.equal(result[5].toString(),'3') //stage
        assert.equal(result[6].toString(),web3.utils.toWei('1')) //totalAmount

    })


    it("Accept bets and reveal the campaign winner.", async() => { 
        let stopBetDuration = time.duration.seconds(604800); //7 days from Friday
        let revealBetDuration = time.duration.seconds(345600); //4 days

        startTime = await bettingPool.currentBlockStamp({from: deployer})
        // console.log('CurrentBlockTimeStamp:',startTime.toString());

        //Advance to stop time
        const stopTime_BN = web3.utils.toBN(startTime).add(stopBetDuration)
        // console.log('StopBet Timestamp:',stopTime_BN.toString());

        await bettingPool.setCampaign(0,2,stopTime_BN,{from: deployer})
         await bettingPool.bet(2,46,{from:sender1, value: web3.utils.toWei('0.5')}) //Winner
        await bettingPool.bet(2,46,{from:sender2, value: web3.utils.toWei('0.3')})
        await bettingPool.bet(2,46,{from:sender3, value: web3.utils.toWei('0.2')})

        result = await bettingPool.getCampaignInfo(2,{from:deployer})
        assert.equal(result[5].toString(),'3') //stage
        assert.equal(result[6].toString(),web3.utils.toWei('1')) //totalAmount

        await time.increase(stopBetDuration);

        //Make sure accounts cant bet after the stop time. 
        await expect(bettingPool.bet(2,27,{from:sender1, value: web3.utils.toWei('0.5')})).to.be.rejected;

        //Check if the stage = 1 after the stop time
        await bettingPool.changeStage(2,{from:deployer})
        result = await bettingPool.getCampaignStage(2,{from:deployer})
        // console.log(`Campaign stage after closing bets ${result.toString()}`)
        assert(result.toString().toString(),'1')


        //Advance blocktimestamp to reveal stage
        //Check if the campaign stage = 2
        result = await bettingPool.currentBlockStamp({from: deployer})
        const revealTime_BN = web3.utils.toBN(result).add(revealBetDuration)
        await time.increase(revealTime_BN);


        await bettingPool.changeStage(2,{from:deployer}) //Prompt a stage transition

        result = await bettingPool.getCampaignStage(2,{from:deployer})
        // console.log(`Campaign stage after reveal bets ${result.toString()}`)
        assert(result.toString().toString(),'2')


        //Get Winner for campaign#2 for winning racer #46
        await bettingPool.revealWinner(2,46,{from: deployer})

        result = await bettingPool.getWinner(2)
        // console.log(`Winner Address: ${result[0].toString()}`)
        // console.log(`Winner Amount: ${result[1].toString()}`)
        assert.equal(result[0].toString(),sender1)
        assert.equal(result[1].toString(),web3.utils.toWei('0.95'))

        //Check pending withdrawal for winner
        result = await bettingPool.pendingWithdrawal(sender1);
        // console.log(`Pending withdrawal for sender ${result.toString()}`)
        assert.equal(result.toString(),web3.utils.toWei('0.95'))

        //Check pending withdrawal for the Developer 
        result = await bettingPool.pendingWithdrawal(devAddress);
        // console.log(`Pending withdrawal for sender ${result.toString()}`)
        assert.equal(result.toString(),web3.utils.toWei('0.05'))

        //Check if an NFT was minted to the winner of the campaign#2 for racer#46
        result = await bettingPool.balanceOf(sender1,46,{from: sender1});
        assert.equal(result.toString(),'1')

        result = await bettingPool.balanceOf(sender2,46,{from: sender1});
        assert.equal(result.toString(),'0')
        result = await bettingPool.balanceOf(sender3,46,{from: sender1});
        assert.equal(result.toString(),'0')
     

    })
})

     describe("Launch three campaigns and reveal winnners and total payouts to accounts and dev", () => {

        beforeEach(async () => {
            bettingPool = await BettingPool.new(
                ids,
                maxAmounts
            ) 
            

            })
    it("Accept bets on three campaigns and reveal the respective winner for campaign", async() => { 
       

        //Betting begins on all campaigns simultaenously
        let stopBetDuration1 = time.duration.seconds(604800); //7 days from deploy
        let stopBetDuration2 = time.duration.seconds(14688000); //17 days from deploy
        let stopBetDuration3 = time.duration.seconds(25920000); //30days from deploy
        let revealBetDuration = time.duration.seconds(345600); //4 days 


        startTime = await bettingPool.currentBlockStamp({from: deployer})
        // console.log('CurrentBlockTimeStamp:',startTime.toString());

        //Advance to stop time
        const stopTime_BN1 = web3.utils.toBN(startTime).add(stopBetDuration1)
        const stopTime_BN2 = web3.utils.toBN(startTime).add(stopBetDuration2)
        const stopTime_BN3 = web3.utils.toBN(startTime).add(stopBetDuration3)


        // console.log('StopBet Timestamp:',stopTime_BN.toString());
        //Create three campaigns
        await bettingPool.setCampaign(0,1,stopTime_BN1,{from: deployer})// campaign#1
        await bettingPool.setCampaign(1,1,stopTime_BN2,{from: deployer})//campaign#2
        await bettingPool.setCampaign(2,1,stopTime_BN3,{from: deployer})//campaign#3
        await bettingPool.setAddresses(devAddress,{from: deployer});
        //Campaign1 bets: Winner is 46
        await bettingPool.bet(1,46,{from:sender1, value: web3.utils.toWei('5')}) //Winner
        await bettingPool.bet(1,46,{from:sender2, value: web3.utils.toWei('3')})
        await bettingPool.bet(1,46,{from:sender3, value: web3.utils.toWei('2')})
        
        await bettingPool.bet(2,27,{from:sender2, value: web3.utils.toWei('5')}) //Winner
        await bettingPool.bet(2,93,{from:sender2, value: web3.utils.toWei('5')}) 
        await bettingPool.bet(2,27,{from:sender1, value: web3.utils.toWei('3')})
        await bettingPool.bet(2,27,{from:sender3, value: web3.utils.toWei('2')})
        await bettingPool.bet(2,99,{from:sender3, value: web3.utils.toWei('2')})
    
    
        result = await bettingPool.getCampaignInfo(2,{from:deployer})
        assert.equal(result[5].toString(),'5') //numbBidders
        assert.equal(result[6].toString(),web3.utils.toWei('17')) //totalAmount
    

        await bettingPool.bet(3,93,{from:sender1, value: web3.utils.toWei('5')}) //Winner
        await bettingPool.bet(3,93,{from:sender3, value: web3.utils.toWei('1')})
        await bettingPool.bet(3,93,{from:sender2, value: web3.utils.toWei('3')}) 
        await bettingPool.bet(3,27,{from:sender1, value: web3.utils.toWei('1')})
        // await bettingPool.bet(3,93,{from:sender2, value: web3.utils.toWei('2')})


        

        result = await bettingPool.getCampaignInfo(1,{from:deployer})
        assert.equal(result[5].toString(),'3') //numbBidders
        assert.equal(result[6].toString(),web3.utils.toWei('10')) //totalAmount

        
         result = await bettingPool.getCampaignInfo(3,{from:deployer})
        assert.equal(result[5].toString(),'4') //numbBidders
        assert.equal(result[6].toString(),web3.utils.toWei('10')) //totalAmount
        
        await time.increase(stopBetDuration1);

        //Make sure accounts cant bet after the stop time. 
        await expect(bettingPool.bet(1,46,{from:sender1, value: web3.utils.toWei('0.5')})).to.be.rejected;

        //Check if the stage = 1 after the stop time
        await bettingPool.changeStage(1,{from:deployer})
        result = await bettingPool.getCampaignStage(1,{from:deployer})
        // console.log(`Campaign stage after closing bets ${result.toString()}`)
        assert(result.toString().toString(),'1')


        //Advance blocktimestamp to reveal stage
        //Check if the campaign stage = 2
        result = await bettingPool.currentBlockStamp({from: deployer})
        const revealTime_BN1 = web3.utils.toBN(result).add(revealBetDuration)
        await time.increase(revealTime_BN1);


        await bettingPool.changeStage(1,{from:deployer}) //Prompt a stage transition

        result = await bettingPool.getCampaignStage(1,{from:deployer})
        // console.log(`Campaign stage after reveal bets ${result.toString()}`)
        assert(result.toString().toString(),'2')


        //Get Winner for campaign#2 for winning racer #27
        await bettingPool.revealWinner(1,46,{from: deployer})

        result = await bettingPool.getWinner(1)
        // console.log(`Winner Address: ${result[0].toString()}`)
        // console.log(`Winner Amount: ${result[1].toString()}`)
        assert.equal(result[0].toString(),sender1)
        assert.equal(result[1].toString(),web3.utils.toWei('9.5'))

        //Check pending withdrawal for winner
        result = await bettingPool.pendingWithdrawal(sender1);
        // console.log(`Pending withdrawal for sender ${result.toString()}`)
        assert.equal(result.toString(),web3.utils.toWei('9.5'))

        //Check pending withdrawal for the Developer 
        result = await bettingPool.pendingWithdrawal(devAddress);
        // console.log(`Pending withdrawal for sender ${result.toString()}`)
        assert.equal(result.toString(),web3.utils.toWei('0.5'))

        //Check if an NFT was minted to the winner of the campaign#2 for racer#46
        result = await bettingPool.balanceOf(sender1,46,{from: sender1});
        assert.equal(result.toString(),'1')

        result = await bettingPool.balanceOf(sender2,46,{from: sender1});
        assert.equal(result.toString(),'0')
        result = await bettingPool.balanceOf(sender3,46,{from: sender1});
        assert.equal(result.toString(),'0')





     
    //Check winners for campaign 2

  
    await time.increase(stopBetDuration2);

    //Make sure accounts cant bet after the stop time. 
    await expect(bettingPool.bet(2,46,{from:sender2, value: web3.utils.toWei('0.5')})).to.be.rejected;

    //Check if the stage = 1 after the stop time
    await bettingPool.changeStage(2,{from:deployer})
    result = await bettingPool.getCampaignStage(2,{from:deployer})
    // console.log(`Campaign stage after closing bets ${result.toString()}`)
    assert(result.toString().toString(),'1')
      //Check if the stage = 1 after the stop time


      //Advance blocktimestamp to reveal stage
      //Check if the campaign stage = 2
      result = await bettingPool.currentBlockStamp({from: deployer})
      const revealTime_BN2 = web3.utils.toBN(result).add(revealBetDuration)
      await time.increase(revealTime_BN2);


      await bettingPool.changeStage(2,{from:deployer}) //Prompt a stage transition

      result = await bettingPool.getCampaignStage(2,{from:deployer})
      // console.log(`Campaign stage after reveal bets ${result.toString()}`)
      assert(result.toString().toString(),'2')


      //Get Winner for campaign#2 for winning racer #46
      await bettingPool.revealWinner(2,27,{from: deployer})

      result = await bettingPool.getWinner(2)
      // console.log(`Winner Address: ${result[0].toString()}`)
      // console.log(`Winner Amount: ${result[1].toString()}`)
      assert.equal(result[0].toString(),sender2)
      assert.equal(result[1].toString(),web3.utils.toWei('16.15'))

      //Check pending withdrawal for winner
      result = await bettingPool.pendingWithdrawal(sender2);
      // console.log(`Pending withdrawal for sender ${result.toString()}`)
      assert.equal(result.toString(),web3.utils.toWei('16.15'))

      //Check pending withdrawal for the Developer 
      result = await bettingPool.pendingWithdrawal(devAddress);
      // console.log(`Pending withdrawal for sender ${result.toString()}`)
      assert.equal(result.toString(),web3.utils.toWei('1.35'))

      //Check if an NFT was minted to the winner of the campaign#2 for racer#46
      result = await bettingPool.balanceOf(sender2,27);
      assert.equal(result.toString(),'1')

      result = await bettingPool.balanceOf(sender1,27);
      assert.equal(result.toString(),'0')



      




      //Check campain 3

    await time.increase(stopBetDuration3);

    //Make sure accounts cant bet after the stop time. 
    await expect(bettingPool.bet(3,46,{from:sender2, value: web3.utils.toWei('0.5')})).to.be.rejected;

    //Check if the stage = 1 after the stop time
    await bettingPool.changeStage(3,{from:deployer})
    result = await bettingPool.getCampaignStage(3,{from:deployer})
    // console.log(`Campaign stage after closing bets ${result.toString()}`)
    assert(result.toString().toString(),'1')
      //Check if the stage = 1 after the stop time


      //Advance blocktimestamp to reveal stage
      //Check if the campaign stage = 2
      result = await bettingPool.currentBlockStamp({from: deployer})
      const revealTime_BN3 = web3.utils.toBN(result).add(revealBetDuration)
      await time.increase(revealTime_BN3);


      await bettingPool.changeStage(3,{from:deployer}) //Prompt a stage transition

      result = await bettingPool.getCampaignStage(3,{from:deployer})
      // console.log(`Campaign stage after reveal bets ${result.toString()}`)
      assert(result.toString().toString(),'2')


      //Get Winner for campaign#2 for winning racer #46
      await bettingPool.revealWinner(3,93,{from: deployer})

      result = await bettingPool.getWinner(3)
      // console.log(`Winner Address: ${result[0].toString()}`)
      // console.log(`Winner Amount: ${result[1].toString()}`)
      assert.equal(result[0].toString(),sender1)
      assert.equal(result[1].toString(),web3.utils.toWei('9.5'))

      //Check pending withdrawal for winner
      result = await bettingPool.pendingWithdrawal(sender1);
      // console.log(`Pending withdrawal for sender ${result.toString()}`)
      assert.equal(result.toString(),web3.utils.toWei('19'))

      //Check pending withdrawal for the Developer 
      result = await bettingPool.pendingWithdrawal(devAddress);
      // console.log(`Pending withdrawal for sender ${result.toString()}`)
      assert.equal(result.toString(),web3.utils.toWei('1.85'))

      //Check if an NFT was minted to the winner of the campaign#2 for racer#46
      result = await bettingPool.balanceOf(sender2,27);
      assert.equal(result.toString(),'1')

      result = await bettingPool.balanceOf(sender1,27);
      assert.equal(result.toString(),'0')

      



    })

   

   
    })
 
})

