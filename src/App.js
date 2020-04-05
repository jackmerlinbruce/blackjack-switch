import React, { useState, useEffect } from 'react'
import './App.css'
import { getDeck, getAllowedCards } from './Utils/cards'
import Card from './Components/Card'

const App = () => {
    const [deck, setDeck] = useState(getDeck())
    const [hand, setHand] = useState([])
    const [cardsPlayed, setCardsPlayed] = useState([])
    const [cardsAllowedIDs, setCardsAllowedIDs] = useState([])
    const [pickupAmount, setPickupAmount] = useState(1)
    const [isPickupInPlay, setIsPickupInPlay] = useState(false)
    const [isRunInPlay, setIsRunInPlay] = useState(false)

    const deal = n => {
        const dealtCards = deck.slice(0, n)
        const updatedDeck = deck.slice(n, deck.length)
        setDeck(updatedDeck)
        console.log('Dealt', n, 'cards', dealtCards)
        console.log('Deck is now', deck.length)
        return dealtCards
    }

    const pickup = n => {
        const pickupCards = deal(n)
        const updatedHand = hand.concat(pickupCards)
        setHand(updatedHand)
    }

    const playCard = playedCardID => {
        if (cardsAllowedIDs.includes(playedCardID)) {
            // remove card from hand
            const updatedHand = hand.filter(card => {
                return card.id !== playedCardID
            })
            setHand(updatedHand)
            // transfer to played cards
            const playedCard = hand.filter(card => {
                return card.id === playedCardID
            })
            const updatedCardsPlayed = cardsPlayed.concat(playedCard)
            setCardsPlayed(updatedCardsPlayed)
            // add on any pickups
            const newPickupAmount = pickupAmount + playedCard[0].pickupAmount
            setPickupAmount(newPickupAmount)
            // set inPlay status
            playedCard[0].pickupAmount > 0
                ? setIsPickupInPlay(true)
                : setIsPickupInPlay(false)
            setIsRunInPlay(true)
        }
        console.log('CANNOT PLAY THAT CARD!')
    }

    const updateCardsAllowed = () => {
        if (cardsPlayed.length) {
            const lastPlayedCard = cardsPlayed[cardsPlayed.length - 1]
            const updatedCardsAllowedIDs = getAllowedCards(
                lastPlayedCard,
                isPickupInPlay,
                isRunInPlay
            )
            setCardsAllowedIDs(updatedCardsAllowedIDs)
            return
        }
        console.log('Could not update allowed cards', cardsPlayed.length)
    }

    const resetPickupAmount = () => {
        if (!isPickupInPlay) setPickupAmount(1)
        console.log('reset pickup amount to', 1)
    }

    useEffect(updateCardsAllowed, [cardsPlayed])
    useEffect(resetPickupAmount, [isPickupInPlay])

    return (
        <div className="App">
            <h1>Blackjack</h1>
            <button onClick={() => setHand(deal(7))}>DEAL HAND</button>
            <button onClick={() => setCardsPlayed(deal(1))}>
                DEAL FIRST CARD
            </button>
            <button onClick={updateCardsAllowed}>START</button>
            <h3>Your Hand</h3>
            {hand.map(card => (
                <Card card={card} callback={playCard} isInHand={true} />
            ))}
            <br />
            <button onClick={() => pickup(pickupAmount)}>PICK UP</button>
            <button onClick={() => setIsRunInPlay(false)}>END GO</button>
            <br />
            <h3>Cards Played</h3>
            {cardsPlayed.map(card => (
                <Card card={card} callback={playCard} />
            ))}
        </div>
    )
}

export default App
