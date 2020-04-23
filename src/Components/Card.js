import React from 'react'
import './Card.css'
import { useSpring, animated } from 'react-spring'

const Card = props => {
    const spring = useSpring({
        opacity: 1,
        transform: 'scale(1)',
        from: { opacity: 0, transform: 'scale(0)' }
    })

    return (
        <React.Fragment>
            {props.faceUp && (
                <animated.div
                    className={props.isInHand ? 'card inHand' : 'card'}
                    id={props.card.id}
                    key={props.card.id}
                    onClick={
                        props.isInHand
                            ? () => props.callback(props.card.id)
                            : null
                    }
                    style={spring}
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
                </animated.div>
            )}

            {!props.faceUp && (
                <animated.div
                    className={`card ${props.isIcon ? 'icon' : ''}`}
                    onClick={props.isInHand ? props.callback : null}
                    style={spring}
                >
                    <img
                        src={process.env.PUBLIC_URL + 'Cards/back-teal.png'}
                        alt="card"
                    ></img>
                </animated.div>
            )}
        </React.Fragment>
    )
}

export default Card
