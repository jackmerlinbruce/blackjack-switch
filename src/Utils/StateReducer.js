export const stateReducer = (state, action) => {
    switch (action.type) {
        case 'EMPTY_DECK':
            return { ...state, deck: [] }
        case 'UPDATE_DECK':
            return { ...state, deck: action.payload }
        case 'ADD_TO_HAND':
            return { ...state, hand: [...state.hand, ...action.payload] }
        case 'ADD_TO_HAND_OF':
            return {
                ...state,
                [action.player]: [...state[action.player], ...action.payload]
            }
        case 'REMOVE_FROM_HAND':
            return {
                ...state,
                hand: state.hand.filter(card => {
                    return card.id !== action.payload
                })
            }
        case 'REMOVE_FROM_HAND_OF':
            return {
                ...state,
                [action.player]: state[action.player].filter(card => {
                    return card.id !== action.payload
                })
            }
        case 'PLAY_CARDS':
            // TODO: refactor to have the cardID as the payload
            return { ...state, played: [...state.played, ...action.payload] }
        case 'UPDATE_CARDS_ALLOWED_IDS':
            return { ...state, cardsAllowedIDs: action.payload }
        case 'UPDATE_IN_PLAY_STATUS':
            let lastCard = action.payload[0]
            let isPickup, isQueen, isEight, isAce, isRun
            isPickup = lastCard.pickupAmount > 0 ? true : false
            isQueen = lastCard.value === 12 ? true : false
            isEight = lastCard.value === 8 ? true : false
            isAce = lastCard.value === 1 ? true : false
            isRun = true
            return {
                ...state,
                isPickupInPlay: isPickup,
                isQueenInPlay: isQueen,
                isEightInPlay: isEight,
                isAceInPlay: isAce,
                isRunInPlay: isRun
            }
        case 'RESET_PICKUP':
            return { ...state, pickupAmount: 1, isPickupInPlay: false }
        case 'HANDLE_PICKUPS':
            let n = action.payload[0].pickupAmount * state.queenMultiplier
            const newPickupAmount = ['h_11', 'd_11'].includes(
                action.payload[0].id
            )
                ? 1
                : state.pickupAmount + n
            return { ...state, pickupAmount: newPickupAmount }
        case 'UPDATE_QUEEN_MULTIPLIER':
            const newQueenMultiplier = state.isQueenInPlay
                ? state.queenMultiplier * 2
                : 1
            return { ...state, queenMultiplier: newQueenMultiplier }
        case 'UPDATE_EIGHT_SKIPS':
            const newNumEightSkips = state.isEightInPlay
                ? (state.numEightSkips += 1) * state.queenMultiplier
                : 0
            return { ...state, numEightSkips: newNumEightSkips }
        case 'END_GO':
            /* This end the turn and works out who the next player is.
            If the the current player index PLUS the number of eight skips
            greater than the total amount of players, then the index resets
            back to zero and the eight skips also reset to zero. */
            const newPlayerIndex =
                state.currentPlayerIndex + state.numEightSkips >=
                state.playerList.length - 1
                    ? 0
                    : (state.currentPlayerIndex += 1) + state.numEightSkips
            return {
                ...state,
                isRunInPlay: false,
                numEightSkips: 0,
                currentPlayerIndex: newPlayerIndex,
                currentPlayerID: state.playerList[newPlayerIndex]
            }
    }
}
