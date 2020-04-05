import React from 'react'

const Card = props => {
    return (
        <div
            className={props.isInHand ? 'card inHand' : 'card'}
            id={props.card.id}
            key={props.card.id}
            onClick={
                props.isInHand ? () => props.callback(props.card.id) : null
            }
        >
            <img
                src={
                    process.env.PUBLIC_URL + 'Cards/' + props.card.name + '.png'
                }
            ></img>
        </div>
    )
}

export default Card
