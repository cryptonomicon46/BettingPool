//SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;


interface ICampaign {
    enum  BettingPoolSel { MotoGp, Moto2, WSBK}
    enum Stages {AcceptingBets, Closed, RevealWinner}
    struct NFTInfo {
        uint256 id;
        // uint256 price;
        uint256 reserves;
        }

    struct Bidder {
        address addr;
        uint amount;
        uint timeStamp;
    }


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
    function setCampaign(BettingPoolSel,uint8,uint256,Stages) external;
    function bet(uint,uint8) external payable;
    function revealWinner(uint,uint) external;
    function awardTheWinner(uint,uint) external payable;
    function getNFTInfo(uint) external returns (NFTInfo memory);
    function withdraw() external payable;
    function setAddresses(address payable) external;
    function getAddresses() external returns (address);
    function getNumCampaigns() external returns (uint);
    function getCampaignStage(uint) external returns (uint);
    function getCampaignInfo(uint) external returns(BettingPoolSel,uint8,uint,uint,Stages,uint,uint);
    function setTokenURI(string memory,uint256) external;
    function currentBlockStamp() external returns (uint);
    function returnNumberBidders(uint, uint8) external returns (uint);
    function mintSingle(uint,address) external;
 
    // function returnNumberBidders(uint,uint8) external returns (uint);
    // function getCampaign 

}
