import React, { useState, useEffect } from 'react'
import './App.css'
import { getDeck, getAllowedCards } from './Utils/cards'
import Card from './Components/Card'

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
    const [deck, setDeck] = useState(getDeck())
    const [hand, setHand] = useState([])
    const [cardsPlayed, setCardsPlayed] = useState([])
    const [aceChangedSuit, setAceChangedSuit] = useState('')
    const [cardsAllowedIDs, setCardsAllowedIDs] = useState([])
    const [pickupAmount, setPickupAmount] = useState(1)
    const [isPickupInPlay, setIsPickupInPlay] = useState(false)
    const [isRunInPlay, setIsRunInPlay] = useState(false)
    const [isQueenInPlay, setIsQueenInPlay] = useState(false)
    const [queenMultiplier, setQueenMultiplier] = useState(1)

    const deal = n => {
        const dealtCards = deck.slice(0, n)
        const updatedDeck = deck.slice(n, deck.length)
        setDeck(updatedDeck)
        console.log('Dealt', n, 'cards', dealtCards)
        console.log('Deck is now', deck.length)
        return dealtCards
    }

    const pickup = n => {
        const pickupCards = n > 1 ? deal(n - 1) : deal(n)
        const updatedHand = hand.concat(pickupCards)
        setHand(updatedHand)
        setPickupAmount(1)
        setIsPickupInPlay(false)
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
        if (cardsPlayed.length) {
            const lastPlayedCard = cardsPlayed[cardsPlayed.length - 1]
            const updatedCardsAllowedIDs = getAllowedCards(
                lastPlayedCard,
                isPickupInPlay,
                isRunInPlay,
                aceChangedSuit
            )
            setCardsAllowedIDs(updatedCardsAllowedIDs)
            return
        }
        console.log('Could not update allowed cards', cardsPlayed.length)
    }

    const updateQueenMultiplier = () => {
        const newQueenMultiplier = queenMultiplier * 2
        isQueenInPlay
            ? setQueenMultiplier(newQueenMultiplier)
            : setQueenMultiplier(1)
    }

    useEffect(updateCardsAllowed, [cardsPlayed, isPickupInPlay, isRunInPlay])
    useEffect(updateQueenMultiplier, [isQueenInPlay, cardsPlayed])
    useEffect(() => {
        document.title = deck.length
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
            <button onClick={() => setHand(deal(7))}>DEAL HAND</button>
            <button onClick={() => setCardsPlayed(deal(1))}>
                DEAL FIRST CARD
            </button>
            <button onClick={() => console.log(cardsAllowedIDs)}>START</button>
            <h3>Cards Played</h3>
            {cardsPlayed.map(card => (
                <Card card={card} callback={playCard} />
            ))}
            <h3>Your Hand</h3>
            {hand.map(card => (
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
