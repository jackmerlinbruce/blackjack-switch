import React, { useState, useReducer, useEffect } from 'react'
import './App.css'
import { getDeck, getAllowedCards } from './Utils/cards'
import { stateReducer } from './Utils/StateReducer'
import Card from './Components/Card'
import { db } from './firebase'

/*
TODO:
    Add time limit for each turn: user picks up if they don't play
        The more high value cards, the longer the time
        The time elapsed is modulated by the number of POWER cards
        This gives other players a glimpse into what you might be carrying
        And will make you want to play fast
    Add multiple decks for MASSIV 1000 card pickups
    Add scoring points for pickups.
        Does game end when people create n amount of pickups
        instead of when they have no cards left
        how would this change gameplay?
    Make more like a war:
        offence (pickup)
        defence (red jack, redirection)
        deception (? can everyone see what's left in the pack ?)
    Add 4 card rule pickup
    Add same suit deflectors/skippers
        King reverses pickup
        8 skips it to the next person
        Queen passes it on to the next person
    Can you see the total value of
        Each persons hand?
        Each pickup set of cards?
        The entire deck?
*/

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

const App = () => {
    const [state, dispatch] = useReducer(stateReducer, initState)

    // set state in Firebase
    // https://firebase.google.com/docs/firestore/query-data/get-data

    const deal = n => {
        const dealtCards = state.deck.slice(0, n)
        const updatedDeck = state.deck.slice(n, state.deck.length)
        dispatch({ type: 'UPDATE_DECK', payload: updatedDeck })
        return dealtCards
    }

    const pickup = n => {
        const pickupCards = n > 1 ? deal(n - 1) : deal(n)
        console.log('pickupCards', pickupCards)
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
        <div className="App">
            <div className={'state'}>
                <p>Pickup Amount: {state.pickupAmount}</p>
                <p className={`${state.isPickupInPlay}`}>
                    Pickup In Play?: {`${state.isPickupInPlay}`}
                </p>
                <p className={`${state.isRunInPlay}`}>
                    Run In Play?: {`${state.isRunInPlay}`}
                </p>
                <p className={`${state.isQueenInPlay}`}>
                    Queen In Play?: {`${state.isQueenInPlay}`}
                </p>
                <p className={`${state.queenMultiplier}`}>
                    Queen Multiplier: {`${state.queenMultiplier}`}
                </p>
            </div>
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
export default App
