const getDeck = require('./getDeck')

const deal = (n, state) => {
    const dealtCards = state.deck.slice(0, n)
    const updatedDeck = state.deck.slice(n, state.deck.length)
    state.deck = updatedDeck
    return dealtCards
}

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
        currentPlayerID: '',
        nicknames: {}
    }

    // create empty hand for each player
    state.playerList.forEach(p => (state[p.playerID] = []))

    // deal 7 cards to each player's hand
    state.playerList.forEach(p => (state[p.playerID] = deal(7, state)))

    // deal 1 card to the CARDS PLAYED PILE
    state.played = deal(1, state)

    // append nickname map
    state.playerList.forEach(p => (state.nicknames[p.playerID] = p.nickname))

    // set playerID to first player in playerList
    state.currentPlayerID = state.playerList.map(p => p.playerID)[0]

    console.log(state)
    return state
}

module.exports = initState
