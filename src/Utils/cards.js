export const suits = ['h', 'd', 'c', 's']
export const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
export const pickupCards = [
    'h_2',
    'd_2',
    'c_2',
    's_2',
    'c_11',
    's_11',
    'h_11',
    'd_11'
]
export const pickupAmounts = {
    h_2: 2,
    d_2: 2,
    c_2: 2,
    s_2: 2,
    c_11: 5,
    s_11: 5,
    h_11: 0,
    d_11: 0
}

export const cardID = (suit, value) => {
    return value + '_' + suit
}

export const cardName = (suit, value) => {
    const suitNames = {
        h: 'heart',
        d: 'diamond',
        c: 'club',
        s: 'spade'
    }
    const valueNames = {
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
        6: '6',
        7: '7',
        8: '8',
        9: '9',
        10: '10',
        11: 'jack',
        12: 'queen',
        13: 'king'
    }
    return suitNames[suit] + '_' + valueNames[value]
}

export const getDeck = (shuffle = true, withJokers = false) => {
    const deck = []

    // generate standard deck
    suits.map(suit => {
        values.map(value => {
            deck.push({
                id: cardID(value, suit),
                name: cardName(suit, value),
                color: ['h', 'd'].includes(suit) ? 'r' : 'b',
                suit: suit,
                value: value,
                pickupAmount: 0
            })
        })
    })

    // add pickup amounts
    deck.map(card => {
        if (pickupCards.includes(card.id)) {
            card.pickupAmount = pickupAmounts[card.id]
        }
    })

    // add jokers
    if (withJokers) {
        const jokers = [
            {
                id: '0_r',
                color: 'r',
                suit: 'joker',
                value: 0
            },
            {
                id: '0_b',
                color: 'b',
                suit: 'joker',
                value: 0
            }
        ]
        jokers.forEach(joker => deck.push(joker))
    }

    if (shuffle) {
        return deck.sort(() => 0.5 - Math.random())
    }

    return deck
}

export const getAllowedCards = (lastPlayedCard, isPickupInPlay) => {
    const allowedCards = []

    if (isPickupInPlay) {
        pickupCards.map(cardID => allowedCards.push(cardID))
    } else if (lastPlayedCard.value === 12) {
        // queens
        values.map(value => {
            allowedCards.push(cardID(value, lastPlayedCard.suit))
        })
        suits.map(suit => {
            allowedCards.push(cardID(12, suit))
        })
    } else {
        // regular values
        values.map(value => {
            allowedCards.push(cardID(value, lastPlayedCard.suit))
        })
        // regular suits
        suits.map(suit => {
            allowedCards.push(cardID(lastPlayedCard.value, suit))
        })
        // aces
        suits.map(suit => {
            allowedCards.push(cardID(1, suit))
        })
    }

    console.log('allowedCards', allowedCards)

    return allowedCards
}
