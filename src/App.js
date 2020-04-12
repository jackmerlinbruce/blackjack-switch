import React, { useState, useEffect } from 'react'
import './App.css'
import { getDeck, getAllowedCards } from './Utils/cards'
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

const App = () => {
    // const [deck, setDeck] = useState(getDeck())
    // const [hand, setHand] = useState([])
    // const [cardsPlayed, setCardsPlayed] = useState([])
    const [aceChangedSuit, setAceChangedSuit] = useState('')
    // const [cardsAllowedIDs, setCardsAllowedIDs] = useState([])
    const [pickupAmount, setPickupAmount] = useState(1)
    const [isPickupInPlay, setIsPickupInPlay] = useState(false)
    const [isRunInPlay, setIsRunInPlay] = useState(false)
    const [isQueenInPlay, setIsQueenInPlay] = useState(false)
    const [queenMultiplier, setQueenMultiplier] = useState(1)

    const [state, setState] = useState({
        deck: getDeck(),
        dealtCards: [],
        hand: [],
        cardsPlayed: [],
        cardsAllowedIDs: [],
        fname: 'jack'
    })

    useEffect(
        () =>
            console.log(
                'hand ' + state.hand.length,
                'deck ' + state.deck.length
            ),
        [state.deck]
    )

    // set state in Firebase
    // https://firebase.google.com/docs/firestore/query-data/get-data
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
        console.log('updatedDeck', updatedDeck.length)
        console.log('state', state)
        setState({ ...state, deck: updatedDeck, dealtCards: dealtCards }) // why doesn't this work?
        return
    }

    const pickup = n => {
        const pickupCards = n > 1 ? deal(n - 1) : deal(n)
        const updatedHand = [...state.hand, ...pickupCards]
        setState({ ...state, fname: Math.random(), hand: updatedHand })
        setPickupAmount(1)
        setIsPickupInPlay(false)
    }

    const playCard = playedCardID => {
        if (state.cardsAllowedIDs.includes(playedCardID)) {
            // remove card from hand
            const updatedHand = state.hand.filter(card => {
                return card.id !== playedCardID
            })
            setState({ ...state, hand: updatedHand })
            // transfer to played cards
            const playedCard = state.hand.filter(card => {
                return card.id === playedCardID
            })
            const updatedCardsPlayed = state.cardsPlayed.concat(playedCard)

            setState({ ...state, cardsPlayed: updatedCardsPlayed })
            // setCardsPlayed(updatedCardsPlayed)
            setInPlayStatus(playedCard[0])
            addOnPickups(playedCard[0])
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
            ? setAceChangedSuit(lastPlayedCard.suit)
            : setAceChangedSuit(null)
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
        if (state.cardsPlayed.length) {
            const lastPlayedCard =
                state.cardsPlayed[state.cardsPlayed.length - 1]
            const updatedCardsAllowedIDs = getAllowedCards(
                lastPlayedCard,
                isPickupInPlay,
                isRunInPlay,
                aceChangedSuit
            )
            setState({ ...state, cardsAllowedIDs: updatedCardsAllowedIDs })
            return
        }
        console.log('Could not update allowed cards', state.cardsPlayed.length)
    }

    const updateQueenMultiplier = () => {
        const newQueenMultiplier = queenMultiplier * 2
        isQueenInPlay
            ? setQueenMultiplier(newQueenMultiplier)
            : setQueenMultiplier(1)
    }

    useEffect(updateCardsAllowed, [
        state.cardsPlayed,
        isPickupInPlay,
        isRunInPlay
    ])
    useEffect(updateQueenMultiplier, [isQueenInPlay, state.cardsPlayed])
    useEffect(() => {
        document.title = state.deck.length
    })

    return (
        <div className="App">
            <div className={'state'}>
                <p>Pickup Amount: {pickupAmount}</p>
                <p className={`${isPickupInPlay}`}>
                    Pickup In Play?: {`${isPickupInPlay}`}
                </p>
                <p className={`${isRunInPlay}`}>
                    Run In Play?: {`${isRunInPlay}`}
                </p>
                <p className={`${isQueenInPlay}`}>
                    Queen In Play?: {`${isQueenInPlay}`}
                </p>
                <p className={`${queenMultiplier}`}>
                    Queen Multiplier: {`${queenMultiplier}`}
                </p>
            </div>
            <h1>Blackjack</h1>

            <button
                onClick={() => {
                    let updatedHand = deal(7)
                    setState({ ...state, hand: updatedHand })
                    // setState({ ...state, hand: updatedHand })
                }}
            >
                DEAL HAND
            </button>

            <button
                onClick={() => setState({ ...state, cardsPlayed: deal(1) })}
            >
                DEAL FIRST CARD
            </button>

            <button onClick={() => console.log(state.cardsAllowedIDs, state)}>
                START
            </button>

            <h3>Cards Played</h3>
            {state.cardsPlayed
                .slice(state.cardsPlayed.length - 1, state.cardsPlayed.length)
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

            <button onClick={() => setIsRunInPlay(false)}>END GO</button>
            <br />
        </div>
    )
}

export default App
