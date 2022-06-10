//SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol"; //Safemath no longer needed Sol v0.8.0 onwards
import "@openzeppelin/contracts/utils/Strings.sol";

contract BettingPool is ERC1155{

    using SafeMath for uint256;// Not needed solidity v0.8.0 as illegal arithmetic operations will revert automatically
    
    string private _baseURI=  "https://ipfs.io/ipfs/QmcDRWwXCE1LjvdESNZsmc75syTJP2zA8WW9SHEaCwEmkc/";
    string private baseExtension = ".json";


    // uint public  contractExpiry; 
    uint256 private _royaltyFee = 5; 
    // uint EXPIRY = 365 days;
    uint public immutable startedAt;
    address payable public  owner;
    address internal  devAddress; 
    uint internal  numCampaigns=1;
//    uint public mintEndTime;
//Keep track of the NFT Reserves
    struct NFTInfo {
        uint256 id;
        // uint256 price;
        uint256 reserves;
        }

    NFTInfo[] private nftInfo;


    struct Bidder {
        address addr;
        uint amount;
        uint timeStamp;
    }
   Bidder[] private bidder;


    mapping (uint => Bidder) public campaignIdToBids;

    struct Payment {
        uint totalAmount;
        uint devFees;
        uint winnerAmount;
         address winnerAddress;
         uint timeStamp;
    }

    struct BettingCampaign {
        BettingPoolSel bettingPoolSel;
        uint8 raceNum;
        uint mintDate;
        Stages stage;
         uint stopDate; //Bidding stopped
        uint revealDate;  //Reveal Winners
        mapping (uint => mapping(address=>bool)) checkDuplicateBet;
        uint numBidders; //Total Number of bidders for all racers in the selected campaign
        uint totalAmount; //Total Amount bet on all racers in the selected campaign
        mapping (uint => Bidder[]) bidders; //Racer Number to Bidder Info  
        Payment payment;
    }


    enum  BettingPoolSel { MotoGp, Moto2, WSBK}
    enum Stages {AcceptingBets, Closed, RevealWinner}
    Stages[] stage; 
    BettingPoolSel internal bettingPoolSel;
    BettingPoolSel defaultBettingPool = BettingPoolSel.MotoGp;

    mapping (uint256 => uint256) private _idToidx; 
    mapping (uint256 => uint256) private _idxToid; 
    mapping (uint256 => uint256) private _pricesOfIds;  
    mapping (uint256=>  string) private _tokenURI; 
    mapping (address => uint256) public pendingWithdrawal;
    mapping (uint8=> mapping (uint8=> uint)) BettingPoolToRaceNumToMintDate;
    mapping(uint8=>mapping(uint8=>bool)) BettingPoolRaceNumToStatus;
    mapping (uint=> BettingCampaign) campaigns;


    error TooEarly();
    error InvalidAddress();
    error ContractExpired();
    error WithdrawError();
    error InvalidOperation();
    error Unauthorized();
    error IndexError();
    error FunctionInvalidAtThisStage();
   error ErrorNFTReserves();
   error NoDoubleBettingAllowed();

    event NFTReservesUpdated(uint256 idx, uint256 amount);
    event WithdrawEvent(address account,uint256 amount);
    event BettingPoolChanged(BettingPoolSel);
    event TokenURIChanged(string URI_,uint256 _tokenId);
    event  DevAddressChanged(address devAddress_);


    bool locked;
    modifier noReentrancy(){
        require(!locked,"Reentrant Call");
        locked = true;
        _;
        locked = false;
        _;

    }


   modifier onlyBy(address account){
        if (msg.sender != account) revert Unauthorized();
        _;
    }




    // modifier atStage(uint campaignId_,Stages _stage) {
    //     BettingCampaign storage b_camp = _getCampaign(campaignId_);

    //     if (block.timestamp >= b_camp.stopDate)
    //         b_camp.stage = Stages.Closed;
    //     if (block.timestamp*1000 >= b_camp.revealDate)
    //         b_camp.stage = Stages.RevealWinner;
    //             // _; 

    //     if (b_camp.stage != _stage)
    //         revert FunctionInvalidAtThisStage();
    //     _;
    // }




    modifier timedTransitions(uint campaignId_) {

        BettingCampaign storage b_camp = _getCampaign(campaignId_);
            if (b_camp.stage == Stages.AcceptingBets &&
                block.timestamp >= b_camp.stopDate)
                b_camp.stage = Stages.Closed;
        if (b_camp.stage == Stages.Closed &&
                block.timestamp >= b_camp.revealDate)
            b_camp.stage = Stages.RevealWinner;
                _; 
    
        }



    modifier atStage(uint campaignId_,Stages _stage) {
        BettingCampaign storage b_camp = _getCampaign(campaignId_);

        if (b_camp.stage != _stage)
            revert FunctionInvalidAtThisStage();
        _;
    }



    modifier checkStage(uint campaignId_,Stages _stage) {
        BettingCampaign storage b_camp = _getCampaign(campaignId_);

        // if (block.timestamp >= b_camp.stopDate)
        //     b_camp.stage = Stages.Closed;
        // if (block.timestamp*1000 >= b_camp.revealDate)
        //     b_camp.stage = Stages.RevealWinner;
        //         // _; 

        if (b_camp.stage != _stage)
            revert FunctionInvalidAtThisStage();
        _;
    }


   function changeStage(uint campaignId_) external onlyBy(owner) returns (uint) {
        BettingCampaign storage b_camp = _getCampaign(campaignId_);

        if (b_camp.stage == Stages.AcceptingBets &&
                    block.timestamp >= b_camp.stopDate)
            b_camp.stage = Stages.Closed;
            // nextStage(campaignId_);
        if (b_camp.stage == Stages.Closed &&
                block.timestamp >= b_camp.revealDate)
            // nextStage(campaignId_);
            b_camp.stage = Stages.RevealWinner;
        return uint(b_camp.stage);
    }

    // uint256[]  prices = [0.2 ether, 0.1 ether, 0.1 ether, 0.1 ether];


    uint256[]  ids;
    uint256[]  maxAmounts;

    // uint256[]  ids= [46,93,99,27];
    // uint256[]  maxAmounts = [30,20,20,20];

        // const bettingStop = 345600000;//24*3600*4*1000; //4 days

        // const c1_reveal= Date.parse("Sun, June 19, 2022 11:59:59"); //1655665199000
        // const c1_endBet = c1_reveal - bettingStop; //1655319599000

    
 constructor  (
                uint256[] memory ids_,
                uint256[] memory maxAmounts_
                )ERC1155(_baseURI) payable {
 

        // require(msg.sender!= address(0),"Invalid deployer address!");
        owner = payable(msg.sender);
        // devAddress = 0xdD870fA1b7C4700F2BD7f44238821C26f7392148;
        startedAt = block.timestamp; 
        // mintEndTime = block.timestamp + EXPIRY; 

        require(ids_.length == maxAmounts_.length,"ERC1155: Input array lenghts aren't the same!");

        ids = ids_;
        maxAmounts = maxAmounts_;

        for(uint i =0; i< ids.length; i++) {
            _idToidx[ids[i]] = i;
            nftInfo.push(NFTInfo({
            id: ids[i],
            // price: prices[i],
            reserves: maxAmounts[i]
                  }));
            _tokenURI[ids[i]] = string.concat(_baseURI,Strings.toString(ids[i]),baseExtension);
        }

    }




//Test campaign mint date is 1 minute from block.timestamp and accepts bids for 30 seconds only

function setCampaign( BettingPoolSel bettingPoolSel_,
                        uint8 raceNum_,
                        uint256 betStopDate_
                        ) public onlyBy(owner) {

                    require(raceNum_>0, "Invalid Race Number");
                    // require(mintDate_> block.timestamp+ 7 days,"Campaign mint date should be 7 days away from deploy!");
                    // require(revealDate_ > block.timestamp,"Invalid reveal date");
                    uint campaignID;
                    campaignID = numCampaigns++;            
                    BettingCampaign storage b_camp = campaigns[campaignID];

                    b_camp.bettingPoolSel= bettingPoolSel_;
                    b_camp.raceNum = raceNum_;
                    b_camp.stopDate = betStopDate_;
                    b_camp.revealDate = betStopDate_ + 345600000;//4 days in seconds
                    

                    // b_camp.stopDate = betStopDate_;

                    // b_camp.revealDate = revealDate_;
                    // b_camp.stopDate =  b_camp.revealDate - 20 seconds;
                    // b_camp.stopDate =  b_camp.revealDate - 4 days;

                    b_camp.stage = Stages.AcceptingBets;    
        }


function bet(uint campaignId_,uint racerNum_) 
        public    
        payable
        timedTransitions(campaignId_)
        atStage(campaignId_,Stages.AcceptingBets) 
        {

        // require(msg.sender != owner && msg.sender != devAddress,"Owner and devs cannot bid on this auction");

            // if (block.timestamp > mintEndTime) revert ContractExpired();
            if (campaignId_ <=0) revert IndexError();
            // require(msg.value > 0.08 ether, "Bid value too low!");
            //Check to see if bidder is a contract?
            BettingCampaign storage b_camp = _getCampaign(campaignId_); //Internal Function
        // if (b_camp.checkDuplicateBet[racerNum_][msg.sender] == true) revert NoDoubleBettingAllowed();
           //Increment total amount and number of bidders/ betting campaign

          //Accept User's bid and record address and the timeStamp       
            b_camp.bidders[racerNum_].push(Bidder({
                    addr: msg.sender,
                    amount: msg.value,
                    timeStamp: block.timestamp
                            }));

            b_camp.checkDuplicateBet[racerNum_][msg.sender] = true;
            b_camp.numBidders++;
            b_camp.totalAmount += msg.value;
                         
        }


    function revealWinner(uint campaignId_,uint winningRacer_) 
        external    
        payable
        // timedTransitions(campaignId_)
        atStage(campaignId_,Stages.RevealWinner) 
        onlyBy(owner)
        returns (Payment memory) {

        BettingCampaign storage b_camp = _getCampaign(campaignId_);
        // Payment memory payment;

        b_camp.payment.totalAmount = b_camp.totalAmount; //All proceeds from the campaign to winner , beneficiary and platform
        // b_camp.payment.totalAmount = b_camp.totalAmount; //All proceeds from the campaign to winner , beneficiary and platform


        Bidder memory nextBidder;
        Bidder memory topBidder;
        // if (b_camp.bidders[winningRacer_].length ==0) revert InvalidOperation();
        topBidder.addr = b_camp.bidders[winningRacer_][0].addr;
        topBidder.amount = b_camp.bidders[winningRacer_][0].amount;
        topBidder.timeStamp = b_camp.bidders[winningRacer_][0].timeStamp;


        
        for (uint i=1; i< b_camp.bidders[winningRacer_].length; i++) {

            //Track amount and timestamp for conflict resolution
            nextBidder.addr = b_camp.bidders[winningRacer_][i].addr;
            nextBidder.amount = b_camp.bidders[winningRacer_][i].amount;
            nextBidder.timeStamp = b_camp.bidders[winningRacer_][i].timeStamp;
         

            if (nextBidder.amount > topBidder.amount) {
                topBidder.addr = nextBidder.addr;
                topBidder.amount = nextBidder.amount;
                topBidder.timeStamp=  nextBidder.timeStamp;
               
            }
            else if ( nextBidder.amount == topBidder.amount && nextBidder.timeStamp < topBidder.timeStamp){
                topBidder.addr = nextBidder.addr;
                topBidder.amount = nextBidder.amount;
                topBidder.timeStamp= nextBidder.timeStamp;
            }

        }


        b_camp.payment.winnerAddress = topBidder.addr;
        // b_camp.payment.totalAmount  = topBidder.amount;
        b_camp.payment.timeStamp=  topBidder.timeStamp;

        // //Mint NFT to the winner 
        mintSingle(winningRacer_,topBidder.addr);
        // // //Calculate and Pay Royalty Fee to owner/platform
        b_camp.payment.devFees = (b_camp.payment.totalAmount).mul(_royaltyFee).div(100);

        // // //Owner withdraws the balance funds
        b_camp.payment.winnerAmount = (b_camp.payment.totalAmount).sub(b_camp.payment.devFees);

        // //Winner gets the remaining campaign amount 
        // payment.winnerAmount = (payment.totalAmount).sub(payment.ownerFees).sub(payment.devFees);

        // //Using the pendingWithdrawal method
        pendingWithdrawal[devAddress] = b_camp.payment.devFees;
        // pendingWithdrawal[beneficiaryAddress] = payment.ownerFees;
        pendingWithdrawal[topBidder.addr] = b_camp.payment.winnerAmount;
                          
        return(b_camp.payment);
}




function getWinner(uint campaignId_) 
        external 
        view
        atStage(campaignId_,Stages.RevealWinner)
        returns (address, uint)  
            {
        BettingCampaign storage b_camp = _getCampaign(campaignId_);

    return (b_camp.payment.winnerAddress,b_camp.payment.winnerAmount);
}


//-------------------------
//MINT SINGLE : START 

    function mintSingle(uint256 _id,address highestBidder)
     internal
    // mintTimedTransitions() 
    // atMintStage(MintStage.MintLive) 
    {
       if (msg.sender == address(0)) revert InvalidAddress();

        // require(msg.sender != owner && msg.sender != beneficiary && msg.sender != devAddress,"Owner, beneficiary and devs cannot bid on this auction");
             
        uint256 _idx;
        _idx =  _idToidx[_id];
        uint256 nftReserves;

    //    price = nftInfo[_idx].price;
      nftReserves = nftInfo[_idx].reserves;
  
        require( nftReserves >= 0,"ERC1155: Sorry, this NFT's sold out!");
        // require(price.mul(_amount) <= msg.value,"ERC1155: You don't have enough funds.");

        //Update NFT Reserves
        _updateReserves(_idx,1);

       //Mint to the calling account address
        _mint(highestBidder,_id,1,""); //1:1 NFT minted to the  winner of the campaign

    }

    function returnCloseTime(uint campaignId_) public view returns (uint) {
        BettingCampaign storage b_camp = _getCampaign(campaignId_);
        return b_camp.stopDate;
        
    }

    function returnRevealTime(uint campaignId_) public view returns (uint) {
       BettingCampaign storage b_camp = _getCampaign(campaignId_);
           return b_camp.revealDate;
        
    }

function getCampaignInfo(uint campaignId_) external view onlyBy(owner) returns 
    (BettingPoolSel,uint8,uint,uint,Stages,uint,uint) {
    if(campaignId_ <=0) revert IndexError();

    BettingCampaign storage b_camp = _getCampaign(campaignId_);
    return  (b_camp.bettingPoolSel,
            b_camp.raceNum,
            // b_camp.creationTime,
            b_camp.stopDate,
            b_camp.revealDate,
            b_camp.stage,
            b_camp.numBidders,
            b_camp.totalAmount);
}

function _getCampaign(uint campaignId_) internal view returns ( BettingCampaign storage) {
    BettingCampaign storage b_camp = campaigns[campaignId_];
    return b_camp;
}

function getCampaignStage(uint campaignId_) public view onlyBy(owner) returns ( uint) {
    BettingCampaign storage b_camp = campaigns[campaignId_];
    return uint(b_camp.stage);
}



    function currentBlockStamp() public view onlyBy(owner) returns (uint) {
        return block.timestamp;
    }

function returnNumberBidders(uint campaignId_,uint racerNum_) 
        public 
        view 
        onlyBy(owner)
        returns (uint) {
            //return length, aka the number of bidders per racerNumber
            BettingCampaign storage b_camp = _getCampaign(campaignId_); //Internal Function
            return b_camp.bidders[racerNum_].length;

        }


    function setCampaignStage(uint campaignId_, uint stage_) external onlyBy(owner) {
        BettingCampaign storage b_camp = _getCampaign(campaignId_);
        b_camp.stage = Stages(stage_);

    }
  


   //ERC1155: Returns the tokenURI of TokenId
    function uri(uint256 id) override public view returns (string memory) {
        require (bytes(_tokenURI[id]).length !=0, "This token doesn't exist!");
        return _tokenURI[id];
    }


    //ERC1155: Change the tokenURI if needed on a per token basis
    function setTokenURI(string memory baseURI_,uint256 id) public onlyBy(owner) {
        _tokenURI[id] = string.concat(baseURI_,Strings.toString(id),baseExtension);
        emit TokenURIChanged(_tokenURI[id],id);
    }

    function getNFTInfo(uint tokenId) public view returns (NFTInfo memory) {
        require (bytes(_tokenURI[tokenId]).length !=0, "This token doesn't exist!");
        uint idx_ = _idToidx[tokenId];
        return nftInfo[idx_];
}   

    function _updateReserves(uint256 _idx,uint256 amount) internal {
        if (nftInfo[_idx].reserves < amount) revert ErrorNFTReserves();
        nftInfo[_idx].reserves -= amount;
        emit NFTReservesUpdated(_idx, amount);
    }


    function withdraw() external payable noReentrancy {
        uint256 amount = pendingWithdrawal[msg.sender];
        // if (amount <=0) revert NothingToWithdraw();

        pendingWithdrawal[msg.sender] = 0;
        // payable(msg.sender).transfer(amount);
        //Since the transfer method is no longer safe to use due to gas cost fluctiation, only sends 2300 gas
        //Call forwards all the gas, risk of reentrance attack, so use reentrance guard modifier
        (bool success2,) = payable(msg.sender).call{value: amount}("");
        require(success2,"Owner payment transaction failed!");

    emit WithdrawEvent(msg.sender,amount);

    }

    function getElapsedTime() public 
        view
        onlyBy(owner) 
        returns (uint) 
    {
        return block.timestamp-startedAt;
    }


function setAddresses(address payable devAddress_)
    public 
    onlyBy(owner)  
    {
        devAddress = devAddress_;
        emit DevAddressChanged(devAddress);
    }


function getNumCampaigns()
    external
    view 
    onlyBy(owner)
    returns (uint)
    {return numCampaigns-1;}



function getAddresses() public view onlyBy(owner) returns (address){
    return (devAddress);
}


}