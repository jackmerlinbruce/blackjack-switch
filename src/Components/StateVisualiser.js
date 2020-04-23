import React from 'react'
import '../Components/StateVisualiser.css'

const StateVisualiser = props => {
    return (
        <div className={'state'}>
            <p>Pickup Amount: {props.state.pickupAmount}</p>
            <p className={`${props.state.isPickupInPlay}`}>
                Pickup In Play?: {`${props.state.isPickupInPlay}`}
            </p>
            <p className={`${props.state.isRunInPlay}`}>
                Run In Play?: {`${props.state.isRunInPlay}`}
            </p>
            <p className={`${props.state.isQueenInPlay}`}>
                Queen In Play?: {`${props.state.isQueenInPlay}`}
            </p>
            <p className={`${props.state.isEightInPlay}`}>
                Eight In Play?: {`${props.state.isQueenInPlay}`}
            </p>
            <p className={`${props.state.queenMultiplier}`}>
                Queen Multiplier: {`${props.state.queenMultiplier}`}
            </p>
            <p className={`${props.state.numEightSkips}`}>
                Eight Skips: {`${props.state.numEightSkips}`}
            </p>
        </div>
    )
}

export default StateVisualiser
