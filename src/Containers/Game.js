import React, { useReducer, useEffect, useState } from 'react'
import './Game.css'
import { getAllowedCards } from '../Utils/cards'
import { stateReducer } from '../Utils/StateReducer'
import { db } from '../firebase'

import StateVisualiser from '../Components/StateVisualiser'
import Card from '../Components/Card'
import EndGoBtn from '../Components/EndGoBtn'
import PickupBtn from '../Components/PickupBtn'
import WinLose from '../Components/WinLose'

const Game = ({ initState, socket }) => {
    const [state, dispatch] = useReducer(stateReducer, initState)
    const [isYourGo, setIsYourGo] = useState(false)
    const [isWinner, setIsWinner] = useState(null)
    const [gameInProgress, setGameInProgress] = useState(true)

    // console.log(
    //     state,
    //     state.currentPlayerIndex,
    //     "It's your turn",
    //     state.currentPlayerID
    // )

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

    const sendStateToServer = () => {
        socket.emit('update state', { state })

        // if you end your turn with zero cards...
        const you = state.playerList.filter(p => p.playerID === socket.id)[0]
        if (you.isPotentialWinner) {
            you.isPotentialWinner = !state[socket.id].length ? true : false // enforce that local hand really is zero (maybe different from state)
            if (you.isPotentialWinner) {
                socket.emit('announce winner', socket.id)
                setIsWinner(true)
                setGameInProgress(false)
            }
        }
    }

    const updateStateFromServer = () => {
        socket.on('update state', data => {
            console.log(data)
            dispatch({ type: 'UPDATE_STATE', payload: data })
        })

        socket.on('announce winner', id => {
            setIsWinner(false)
            setGameInProgress(false)
        })
    }

    useEffect(updateStateFromServer, 0)
    useEffect(() => {
        setIsYourGo(false)
        if (state.currentPlayerID === socket.id) {
            setIsYourGo(true)
        }
    }, [state.currentPlayerID])

    return (
        <div className={`Game ${isYourGo ? 'yourGo' : ''}`}>
            {/*<StateVisualiser state={state} />*/}
            {/*<DevTools />*/}
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
            <h3>Cards Played</h3>
            <div className={'playArea'}>
                <Card
                    faceUp={false}
                    isInHand={isYourGo}
                    callback={() => pickup(state.pickupAmount)}
                />

                {state.played &&
                    state.played
                        .slice(state.played.length - 1, state.played.length)
                        .map(card => (
                            <Card
                                key={card.id}
                                faceUp={true}
                                card={card}
                                callback={playCard}
                            />
                        ))}
            </div>
            <div className={'hand'}>
                <h3>Your Hand {state.nicknames[socket.id] || socket.id}</h3>
                {state[socket.id] &&
                    state[socket.id].map(card => (
                        <Card
                            key={card.id}
                            faceUp={true}
                            card={card}
                            callback={playCard}
                            isInHand={isYourGo}
                        />
                    ))}
                <br />
            </div>
            <div className={'playerControls'} hidden={!isYourGo}>
                <PickupBtn
                    pickupAmount={state.pickupAmount}
                    callback={() => {
                        pickup(state.pickupAmount)
                    }}
                    disabled={state.isRunInPlay}
                />
                <EndGoBtn
                    callback={sendStateToServer}
                    disabled={state.pickupAmount > 1 && !state.isRunInPlay}
                />
            </div>
            <div className={'playerList'}>
                {state.playerList.map(p => (
                    <div
                        key={p.playerID}
                        className={`player ${
                            p.playerID === state.currentPlayerID
                                ? 'isYourGo'
                                : ''
                        }`}
                    >
                        {state[p.playerID].length ? (
                            state[p.playerID].map((card, i) => {
                                return (
                                    <Card
                                        key={i}
                                        faceUp={false}
                                        isInHand={isYourGo}
                                        isIcon={true}
                                    />
                                )
                            })
                        ) : (
                            <p>FINISHES ON NEXT TURN!</p>
                        )}
                        <br />
                        <p>{state.nicknames[p.playerID] || p.playerID}</p>
                    </div>
                ))}
            </div>
            {!gameInProgress && <WinLose isWinner={isWinner} />}
        </div>
    )
}
export default Game
