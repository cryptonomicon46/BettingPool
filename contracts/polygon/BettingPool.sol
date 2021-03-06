//SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol"; //Safemath no longer needed Sol v0.8.0 onwards
import "@openzeppelin/contracts/utils/Strings.sol";
import "./Interfaces.sol";

contract BettingPool is ICampaign, ERC1155{

    using SafeMath for uint256;// Not needed solidity v0.8.0 as illegal arithmetic operations will revert automatically
    
    string private _baseURI=  "https://ipfs.io/ipfs/QmcDRWwXCE1LjvdESNZsmc75syTJP2zA8WW9SHEaCwEmkc/";
    string private baseExtension = ".json";
    uint256[]  ids;
    uint256[]  maxAmounts;
    uint256 private _royaltyFee = 5; 
    uint public immutable startedAt;
    address payable public  owner;
    uint public  numCampaigns=1;
    address payable public devAddress; //payable?

    NFTInfo[] private nftInfo;
    Bidder[] private bidder;

   mapping (uint => Bidder) public campaignIdToBids;

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


    
 constructor  (
                uint256[] memory ids_,
                uint256[] memory maxAmounts_
                )ERC1155(_baseURI) payable {
 
        owner = payable(msg.sender);
        startedAt = block.timestamp; 
        require(ids_.length == maxAmounts_.length,"ERC1155: Input array lenghts aren't the same!");

        ids = ids_;
        maxAmounts = maxAmounts_;

        for(uint i =0; i< ids.length; i++) {
            _idToidx[ids[i]] = i;
            nftInfo.push(NFTInfo({
            id: ids[i],
            reserves: maxAmounts[i]
                  }));
            _tokenURI[ids[i]] = string.concat(_baseURI,Strings.toString(ids[i]),baseExtension);
        }

    }


//Test campaign mint date is 1 minute from block.timestamp and accepts bids for 30 seconds only
function setCampaign( BettingPoolSel bettingPoolSel_,
                        uint8 raceNum_,
                        uint256 betStopDate_,
                        Stages stage_) public onlyBy(owner) {

                    require(raceNum_>0, "Invalid Race Number");
                    uint campaignID;
                    campaignID = numCampaigns++;            
                    BettingCampaign storage b_camp = campaigns[campaignID];
                    b_camp.bettingPoolSel= bettingPoolSel_;
                    b_camp.raceNum = raceNum_;
                    b_camp.stopDate = betStopDate_;
                    // b_camp.revealDate = betStopDate_ + 345600000;//4 days in ms
                    b_camp.revealDate = betStopDate_ + 345600;//4 days in seconds

                    // b_camp.stage = Stages.AcceptingBets;   
                    b_camp.stage = stage_; 
        }


function bet(uint campaignId_,uint8 racerNum_) 
        public    
        payable
        timedTransitions(campaignId_)
        atStage(campaignId_,Stages.AcceptingBets) 
        {

            if (campaignId_ <=0) revert IndexError();

            BettingCampaign storage b_camp = _getCampaign(campaignId_); //Internal Function
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
//Refactor revealWinner, Payouts 

    function revealWinner(uint campaignId_,uint winningRacer_) 
        public    
        timedTransitions(campaignId_)
        atStage(campaignId_,Stages.RevealWinner) 
        onlyBy(owner)
        {
        BettingCampaign storage b_camp = _getCampaign(campaignId_);
        // Payment memory payment;
        b_camp.payment.totalAmount = b_camp.totalAmount; //All proceeds from the campaign to winner , beneficiary and platform
        Bidder memory nextBidder;
        Bidder memory topBidder;
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
        b_camp.payment.timeStamp=  topBidder.timeStamp;

        }

function awardTheWinner(uint campaignId_,uint winningRacer_) 
        public 
        payable
        timedTransitions(campaignId_)
        atStage(campaignId_,Stages.RevealWinner) 
        onlyBy(owner)  {
        BettingCampaign storage b_camp = _getCampaign(campaignId_);

        mintSingle(winningRacer_,b_camp.payment.winnerAddress);
        b_camp.payment.devFees = (b_camp.payment.totalAmount).mul(_royaltyFee).div(100);
        b_camp.payment.winnerAmount = (b_camp.payment.totalAmount).sub(b_camp.payment.devFees);
        pendingWithdrawal[devAddress] = pendingWithdrawal[devAddress]  +  b_camp.payment.devFees;
        pendingWithdrawal[b_camp.payment.winnerAddress] =pendingWithdrawal[b_camp.payment.winnerAddress] + b_camp.payment.winnerAmount;

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
     public
    onlyBy(owner) 
    {
       if (msg.sender == address(0)) revert InvalidAddress();
           
        uint256 _idx;
        _idx =  _idToidx[_id];
        uint256 nftReserves;
        nftReserves = nftInfo[_idx].reserves;
        require( nftReserves >= 0,"ERC1155: Sorry, this NFT's sold out!");
        //Update NFT Reserves
        updateReserves(_idx,1);

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

    function returnNumberBidders(uint campaignId_,uint8 racerNum_) 
            public 
            view 
            onlyBy(owner)
            returns (uint) {
                //return length, aka the number of bidders per racerNumber
                BettingCampaign storage b_camp = _getCampaign(campaignId_); //Internal Function
                return b_camp.bidders[racerNum_].length;

    }


    // function setCampaignStage(uint campaignId_, uint stage_) external onlyBy(owner) {
    //     BettingCampaign storage b_camp = _getCampaign(campaignId_);
    //     b_camp.stage = Stages(stage_);

    // }
    

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

    function updateReserves(uint256 _idx,uint256 amount) internal {
        if (nftInfo[_idx].reserves < amount) revert ErrorNFTReserves();
        nftInfo[_idx].reserves -= amount;
        emit NFTReservesUpdated(_idx, amount);
    }


    function withdraw() external payable noReentrancy {
        uint256 amount = pendingWithdrawal[msg.sender];
        // if (amount <=0) revert NothingToWithdraw();
        pendingWithdrawal[msg.sender] = 0;
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