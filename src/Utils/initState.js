import { getDeck } from './cards'

export const initState = {
    deck: getDeck(),
    played: [],
    cardsAllowedIDs: [],
    pickupAmount: 1,
    isPickupInPlay: false,
    isRunInPlay: false,
    isQueenInPlay: false,
    isAceInPlay: false,
    isEightInPlay: false,
    numEightSkips: 0,
    queenMultiplier: 1,
    players: { Jack: [], Rory: [], Tilly: [], Suzanne: [] },
    playerList: ['Jack', 'Rory', 'Tilly'],
    currentPlayerIndex: 0,
    currentPlayerID: ''
}

// create empty hand for each player
initState.playerList.forEach(p => (initState[p] = []))

// set playerID to first player in playerList
initState.currentPlayerID = initState.playerList[0]
