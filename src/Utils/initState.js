import { getDeck } from './cards'

export const initState = (playerList = []) => {
    let state = {
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
        playerList,
        currentPlayerIndex: 0,
        currentPlayerID: ''
    }

    // create empty hand for each player
    state.playerList.forEach(p => (state[p] = []))

    // set playerID to first player in playerList
    state.currentPlayerID = state.playerList[0]

    return state
}
