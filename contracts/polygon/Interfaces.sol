//SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;


interface ICampaign {
    enum  BettingPoolSel { MotoGp, Moto2, WSBK}
    enum Stages {AcceptingBets, Closed, RevealWinner}

    function setCampaign(BettingPoolSel,uint256) external;

}
