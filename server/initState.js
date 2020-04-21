const getDeck = require('./getDeck')

const initState = (playerList = []) => {
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
        playerList,
        currentPlayerIndex: 0,
        currentPlayerID: ''
    }

    // create empty hand for each player
    state.playerList.forEach(p => (state['player--' + p.playerID] = []))

    // set playerID to first player in playerList
    state.currentPlayerID = state.playerList.map(p => p.playerID)[0]

    return state
}

module.exports = initState
