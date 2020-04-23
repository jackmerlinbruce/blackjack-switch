import React from 'react'

const DevTools = () => {
    return (
        <div className={'DevTools'}>
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
        </div>
    )
}

export default DevTools
