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
    const [isAceInPlay, setisAceInPlay] = useState('')
    const [cardsAllowedIDs, setCardsAllowedIDs] = useState([])
    const [pickupAmount, setPickupAmount] = useState(1)
    const [isPickupInPlay, setIsPickupInPlay] = useState(false)
    const [isRunInPlay, setIsRunInPlay] = useState(false)
    const [isQueenInPlay, setIsQueenInPlay] = useState(false)
    const [queenMultiplier, setQueenMultiplier] = useState(1)

    const [state, dispatch] = useReducer(stateReducer, initState)
    console.log('dispatch?', state.cardsAllowedIDs === cardsAllowedIDs)

    // // set state in Firebase
    // // https://firebase.google.com/docs/firestore/query-data/get-data
    // useEffect(() => {
    //     db.collection('games')
    //         .doc('WfF19APDbocNLq9IEznI')
    //         .update({
    //             deck: getDeck()
    //         })
    // }, [])

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
        setPickupAmount(1)
        setIsPickupInPlay(false)
    }

    const playCard = playedCardID => {
        if (cardsAllowedIDs.includes(playedCardID)) {
            dispatch({ type: 'REMOVE_FROM_HAND', payload: playedCardID })
            const playedCards = state.hand.filter(card => {
                return card.id === playedCardID
            })
            dispatch({ type: 'PLAY_CARDS', payload: playedCards })
            dispatch({ type: 'UPDATE_IN_PLAY_STATUS', payload: playedCards })
            dispatch({ type: 'HANDLE_PICKUPS', payload: playedCards })

            setInPlayStatus(playedCards[0])
            addOnPickups(playedCards[0])
            return
        }
        console.log('CANNOT PLAY THAT CARD!')
    }

    const setInPlayStatus = lastPlayedCard => {
        lastPlayedCard.pickupAmount > 0
            ? setIsPickupInPlay(true)
            : setIsPickupInPlay(false)
        lastPlayedCard.value === 12
            ? setIsQueenInPlay(true)
            : setIsQueenInPlay(false)
        lastPlayedCard.value === 1
            ? setisAceInPlay(lastPlayedCard.suit)
            : setisAceInPlay(null)
        setIsRunInPlay(true)
    }

    const addOnPickups = lastPlayedCard => {
        let x = lastPlayedCard.pickupAmount * queenMultiplier
        const newPickupAmount = ['h_11', 'd_11'].includes(lastPlayedCard.id)
            ? 1
            : pickupAmount + x
        setPickupAmount(newPickupAmount)
    }

    const updateCardsAllowed = () => {
        if (state.played.length) {
            const lastPlayedCard = state.played[state.played.length - 1]
            const updatedCardsAllowedIDs = getAllowedCards(
                lastPlayedCard,
                isPickupInPlay,
                isRunInPlay,
                isAceInPlay
            )
            setCardsAllowedIDs(updatedCardsAllowedIDs)
            dispatch({
                type: 'UPDATE_CARDS_ALLOWED_IDS',
                payload: updatedCardsAllowedIDs
            })
            return
        }
        console.log('Could not update allowed cards', state.played.length)
    }

    const updateQueenMultiplier = () => {
        dispatch({ type: 'UPDATE_QUEEN_MULTIPLIER' })
        const newQueenMultiplier = queenMultiplier * 2
        isQueenInPlay
            ? setQueenMultiplier(newQueenMultiplier)
            : setQueenMultiplier(1)
    }

    useEffect(updateCardsAllowed, [
        state.played,
        state.isPickupInPlay,
        state.isRunInPlay
    ])
    useEffect(updateQueenMultiplier, [state.isQueenInPlay, state.played])
    useEffect(() => {
        document.title = state.deck.length
    })

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
            <button onClick={() => pickup(pickupAmount)} disabled={isRunInPlay}>
                PICK UP
            </button>
            <button
                onClick={() => {
                    setIsRunInPlay(false)
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
