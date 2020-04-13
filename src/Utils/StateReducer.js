export const stateReducer = (state, action) => {
    switch (action.type) {
        case 'EMPTY_DECK':
            return { ...state, deck: [] }
        case 'UPDATE_DECK':
            return { ...state, deck: action.payload }
        case 'ADD_TO_HAND':
            return { ...state, hand: [...state.hand, ...action.payload] }
        case 'REMOVE_FROM_HAND':
            return {
                ...state,
                hand: state.hand.filter(card => {
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
            let isPickup, isQueen, isAce, isRun
            isPickup = lastCard.pickupAmount > 0 ? true : false
            isQueen = lastCard.value === 12 ? true : false
            isAce = lastCard.value === 1 ? true : false
            isRun = true
            return {
                ...state,
                isPickupInPlay: isPickup,
                isQueenInPlay: isQueen,
                isAceInPlay: isAce,
                isRunInPlay: isRun
            }
        case 'END_RUN':
            return { ...state, isRunInPlay: false }
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
    }
}
