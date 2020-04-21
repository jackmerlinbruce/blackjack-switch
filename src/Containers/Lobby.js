import React, { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'
import './Lobby.css'

const socket = socketIOClient('http://127.0.0.1:4001')

const Lobby = () => {
    const [playerID, setPlayerId] = useState(false)
    const [playerList, setPlayerList] = useState([])
    const [isAdmin, setIsAdmin] = useState(false)

    const onLoad = () => {
        socket.on('new player', data => {
            setPlayerId(data.playerID)
            console.log(data)
        })
        socket.on('current players', data => {
            setPlayerList(data.playerList)
            console.log('current players', data)
        })
    }

    const checkAdmin = () => {
        let you = playerList.filter(p => p.playerID === playerID)[0]
        if (you && you.isAdmin) {
            setIsAdmin(you.isAdmin)
        }
    }

    const handleGameStart = () => {
        socket.emit('start game')
        socket.on('init state', data => console.log(data))
    }

    useEffect(onLoad, 0)
    useEffect(checkAdmin, [playerList])

    return (
        <div className={'Lobby'}>
            <h1>Lobby</h1>
            <h2 className={`${isAdmin ? 'isAdmin' : ''}`}>
                Welcome: <em>{playerID}</em>
            </h2>

            {isAdmin ? (
                <button
                    onClick={handleGameStart}
                    disabled={playerList.length <= 1}
                >
                    Start
                </button>
            ) : (
                <p>Only the admin can start the game</p>
            )}

            {playerList.length <= 1 ? (
                <p>Wait for more players to join</p>
            ) : null}

            <h3>Current Players:</h3>
            {playerList &&
                playerList.map(p => {
                    return (
                        <div key={p.playerID}>
                            <p className={`${p.isAdmin ? 'isAdmin' : ''}`}>
                                <em>{p.playerID}</em>
                            </p>
                            <br></br>
                        </div>
                    )
                })}
        </div>
    )
}

export default Lobby
