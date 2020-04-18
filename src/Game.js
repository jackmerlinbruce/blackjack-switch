import React, { useReducer, useEffect } from 'react'
import './Game.css'
import { getDeck, getAllowedCards } from './Utils/cards'
import { stateReducer } from './Utils/StateReducer'
import Card from './Components/Card'
import StateVisualiser from './Components/StateVisualiser'
import { db } from './firebase'

const GAME_ID = 'WfF19APDbocNLq9IEznI'

const initState = {
    deck: getDeck(),
    hand: [],
    played: [],
    cardsAllowedIDs: [],
    isAceInPlay: '',
    pickupAmount: 1,
    isPickupInPlay: false,
    isRunInPlay: false,
    isQueenInPlay: false,
    queenMultiplier: 1
}

const Game = () => {
    const [state, dispatch] = useReducer(stateReducer, initState)

    const deal = n => {
        const dealtCards = state.deck.slice(0, n)
        const updatedDeck = state.deck.slice(n, state.deck.length)
        dispatch({ type: 'UPDATE_DECK', payload: updatedDeck })
        return dealtCards
    }

    const pickup = n => {
        const pickupCards = n > 1 ? deal(n - 1) : deal(n)
        dispatch({ type: 'ADD_TO_HAND', payload: pickupCards })
        dispatch({ type: 'RESET_PICKUP' })
    }

    const playCard = playedCardID => {
        if (state.cardsAllowedIDs.includes(playedCardID)) {
            dispatch({ type: 'REMOVE_FROM_HAND', payload: playedCardID })
            const playedCards = state.hand.filter(card => {
                return card.id === playedCardID
            })
            dispatch({ type: 'PLAY_CARDS', payload: playedCards })
            dispatch({ type: 'UPDATE_IN_PLAY_STATUS', payload: playedCards })
            dispatch({ type: 'HANDLE_PICKUPS', payload: playedCards })
            return
        }
        console.log('CANNOT PLAY THAT CARD!')
    }

    const updateCardsAllowed = () => {
        // move to be just an effect / all in reducer
        if (state.played.length) {
            const lastPlayedCard = state.played[state.played.length - 1]
            const updatedCardsAllowedIDs = getAllowedCards(
                lastPlayedCard,
                state.isPickupInPlay,
                state.isRunInPlay
            )
            dispatch({
                type: 'UPDATE_CARDS_ALLOWED_IDS',
                payload: updatedCardsAllowedIDs
            })
            return
        }
        console.log('Could not update allowed cards', state.played.length)
    }

    const updateFirebase = () => {
        // https://firebase.google.com/docs/firestore/query-data/get-data
        db.collection('games')
            .doc(GAME_ID)
            .get()
            .then(res => console.log(res.data()))
        db.collection('games')
            .doc(GAME_ID)
            .set({ state: state })
            .then(() => console.log('Document successfully written!'))
            .catch(error => console.error('Error writing document: ', error))
    }

    useEffect(updateCardsAllowed, [
        state.played,
        state.isPickupInPlay,
        state.isRunInPlay
    ])
    useEffect(() => dispatch({ type: 'UPDATE_QUEEN_MULTIPLIER' }), [
        state.isQueenInPlay,
        state.played
    ])
    useEffect(() => {
        document.title = state.deck.length
    })
    useEffect(updateFirebase)

    return (
        <div className="Game">
            <StateVisualiser state={state} />
            <h1>Blackjack</h1>

            <button onClick={() => dispatch({ type: 'EMPTY_DECK' })}>
                EMPTY DECK
            </button>
            <button
                onClick={() => {
                    dispatch({ type: 'ADD_TO_HAND', payload: deal(7) })
                }}
            >
                DEAL HAND
            </button>
            <button
                onClick={() => {
                    dispatch({
                        type: 'PLAY_CARDS',
                        payload: deal(1)
                    })
                }}
            >
                DEAL FIRST CARD
            </button>
            <button onClick={() => console.log(state.cardsAllowedIDs)}>
                START
            </button>
            <h3>Cards Played</h3>
            {state.played
                .slice(state.played.length - 1, state.played.length)
                .map(card => (
                    <Card card={card} callback={playCard} />
                ))}
            <h3>Your Hand</h3>
            {state.hand.map(card => (
                <Card card={card} callback={playCard} isInHand={true} />
            ))}
            <br />
            <button
                onClick={() => pickup(state.pickupAmount)}
                disabled={state.isRunInPlay}
            >
                PICK UP
            </button>
            <button
                onClick={() => {
                    dispatch({ type: 'END_RUN' })
                }}
            >
                END GO
            </button>
            <br />
        </div>
    )
}
export default Game
