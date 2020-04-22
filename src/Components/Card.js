import React from 'react'

const Card = props => {
    return (
        <React.Fragment>
            {props.faceUp && (
                <div
                    className={props.isInHand ? 'card inHand' : 'card'}
                    id={props.card.id}
                    key={props.card.id}
                    onClick={
                        props.isInHand
                            ? () => props.callback(props.card.id)
                            : null
                    }
                >
                    <img
                        src={
                            process.env.PUBLIC_URL +
                            'Cards/' +
                            props.card.name +
                            '.png'
                        }
                        alt="card"
                    ></img>
                </div>
            )}

            {!props.faceUp && (
                <div
                    className={props.isInHand ? 'card inHand' : 'card'}
                    onClick={props.isInHand ? props.callback : null}
                >
                    <img
                        src={process.env.PUBLIC_URL + 'Cards/back-teal.png'}
                        alt="card"
                    ></img>
                </div>
            )}
        </React.Fragment>
    )
}

export default Card
