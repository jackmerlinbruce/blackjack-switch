import React, { useReducer, useEffect } from 'react'
import './Game.css'
import { getAllowedCards } from './Utils/cards'
import { stateReducer } from './Utils/StateReducer'
import { initState } from './Utils/initState'
import Card from './Components/Card'
import StateVisualiser from './Components/StateVisualiser'
import { db } from './firebase'

const Game = ({ playerList, GAME_ID }) => {
    const [state, dispatch] = useReducer(stateReducer, initState(playerList))

    console.log(
        state.currentPlayerIndex,
        "It's your turn",
        state.currentPlayerID
    )

    const deal = n => {
        // TODO: dealtCards returns before dispatch()
        // has finished updating the deck, meaning with
        // deal-on-load everyone gets the same cards
        const dealtCards = state.deck.slice(0, n)
        const updatedDeck = state.deck.slice(n, state.deck.length)
        dispatch({
            type: 'UPDATE_DECK',
            payload: updatedDeck
        })
        return dealtCards
    }

    const pickup = n => {
        const pickupCards = n > 1 ? deal(n - 1) : deal(n)
        dispatch({
            type: 'ADD_TO_HAND_OF',
            payload: pickupCards,
            player: state.currentPlayerID
        })
        dispatch({ type: 'RESET_PICKUP' })
    }

    const playCard = playedCardID => {
        if (state.cardsAllowedIDs.includes(playedCardID)) {
            dispatch({
                type: 'REMOVE_FROM_HAND_OF',
                payload: playedCardID,
                player: state.currentPlayerID
            })
            const playedCards = state[state.currentPlayerID].filter(card => {
                return card.id === playedCardID
            })
            dispatch({
                type: 'PLAY_CARDS',
                payload: playedCards
            })
            dispatch({
                type: 'UPDATE_IN_PLAY_STATUS',
                payload: playedCards
            })
            dispatch({
                type: 'HANDLE_PICKUPS',
                payload: playedCards
            })
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
    useEffect(() => dispatch({ type: 'UPDATE_EIGHT_SKIPS' }), [
        state.isEightInPlay,
        state.played
    ])
    useEffect(() => {
        document.title = state.deck.length
    })
    // useEffect(() => {
    //     // deal-on-load
    //     state.playerList.forEach((p, i) => {
    //         dispatch({
    //             type: 'ADD_TO_HAND_OF',
    //             payload: deal(7),
    //             player: p
    //         })
    //     })
    // }, [])
    // useEffect(updateFirebase)

    return (
        <div className="Game">
            <StateVisualiser state={state} />

            <h1>Blackjack</h1>

            <button onClick={() => dispatch({ type: 'EMPTY_DECK' })}>
                EMPTY DECK
            </button>
            <button
                onClick={() => {
                    // dispatch({ type: 'ADD_TO_HAND', payload: deal(7) })
                    dispatch({
                        type: 'ADD_TO_HAND_OF',
                        payload: deal(7),
                        player: state.currentPlayerID
                    })
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
            <h3>Hand of {state.currentPlayerID}</h3>
            {state[state.currentPlayerID] &&
                state[state.currentPlayerID].map(card => (
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
                    dispatch({ type: 'END_GO' })
                }}
            >
                END GO
            </button>
            <br />
            {state.playerList.map(p => (
                <p className={`player ${p === state.currentPlayerID}`}>{p}</p>
            ))}
        </div>
    )
}
export default Game
