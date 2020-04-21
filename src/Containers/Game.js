import React, { useReducer, useEffect } from 'react'
import './Game.css'
import { getAllowedCards } from '../Utils/cards'
import { stateReducer } from '../Utils/StateReducer'
import Card from '../Components/Card'
import StateVisualiser from '../Components/StateVisualiser'
import { db } from '../firebase'

const Game = ({ initState, GAME_ID, socket }) => {
    const [state, dispatch] = useReducer(stateReducer, initState)

    console.log(
        state,
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

    const syncToFirebase = () => {
        db.collection('games')
            .doc(GAME_ID)
            .set({ state: state })
            .then(() =>
                console.log(
                    'Firebase state successfully synced! Current player is',
                    state.currentPlayerIndex
                )
            )
            .catch(error => console.error('Error syncing to Firebase: ', error))
    }

    const syncFromFirebase = () => {
        db.collection('games')
            .doc(GAME_ID)
            .get()
            .then(res => {
                console.log('syncing FROM firebase data', res.data())
                dispatch({ type: 'UPDATE_STATE', payload: res.data() })
            })
    }

    const sendToServer = () => {
        socket.emit('update state', state)
    }

    const updateStateFromSocket = () => {
        socket.on('update state', data => {
            console.log(data)
            dispatch({ type: 'UPDATE_STATE', payload: data })
        })
    }

    useEffect(updateStateFromSocket, 0)

    return (
        <div className="Game">
            <StateVisualiser state={state} />

            <h1>Blackjack</h1>

            <button onClick={() => dispatch({ type: 'EMPTY_DECK' })}>
                EMPTY DECK
            </button>
            <button
                onClick={() => {
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
            {state.played &&
                state.played
                    .slice(state.played.length - 1, state.played.length)
                    .map(card => <Card card={card} callback={playCard} />)}
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
            <button onClick={sendToServer}>SEND TO SERVER</button>
            <br />
            {state.playerList.map(p => (
                <p
                    key={p.playerID}
                    className={`player ${p.playerID === state.currentPlayerID}`}
                >
                    {p.playerID}
                </p>
            ))}
        </div>
    )
}
export default Game
