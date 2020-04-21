import React, { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'

const Lobby = () => {
    const socket = socketIOClient('http://127.0.0.1:4001')
    const [playerID, setPlayerId] = useState(sessionStorage.playerID || null)
    const [playerList, setPlayerList] = useState([])

    const onLoad = () => {
        if (sessionStorage.playerID) {
            console.log(
                'Found playerID in local storage',
                sessionStorage.playerID
            )
            setPlayerId(sessionStorage.playerID)
        } else {
            socket.on('getPlayerID', data => {
                console.log('new player', data)
                sessionStorage.playerID = data.playerID
                setPlayerId(sessionStorage.playerID)
            })
        }
        socket.emit('replyWithPlayerID', { playerID })
    }

    useEffect(onLoad, [])

    setInterval(() => {
        console.log('getting player list')
        socket.on('currentPlayerIDs', data => {
            setPlayerList(data.currentPlayerIDs)
        })
    }, 1000)

    return (
        <React.Fragment>
            <h1>Lobby</h1>
            <h2>
                Welcome: <em>{playerID}</em>
            </h2>
            <h3>Current Players:</h3>
            {playerList &&
                playerList.map(player => {
                    return (
                        <p key={player}>
                            <em>{player}</em>
                        </p>
                    )
                })}
        </React.Fragment>
    )
}

export default Lobby
