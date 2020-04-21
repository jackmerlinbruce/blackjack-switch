import React, { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'
import Game from './Game'
import './Lobby.css'

const socket = socketIOClient('http://127.0.0.1:4001')
const GAME_ID = 'WfF19APDbocNLq9IEznI'

const Lobby = () => {
    const [playerID, setPlayerId] = useState(false)
    const [playerList, setPlayerList] = useState([])
    const [isAdmin, setIsAdmin] = useState(false)
    const [initState, setInitState] = useState({})
    const [start, setStart] = useState(false)

    const onLoad = () => {
        socket.on('new player', data => {
            setPlayerId(data.playerID)
            console.log(data)
        })
        socket.on('current players', data => {
            setPlayerList(data.playerList)
            console.log('current players', data)
        })
        socket.on('start game', data => setStart(data.start))
        socket.on('init state', data => setInitState(data))
    }

    const checkAdmin = () => {
        let you = playerList.filter(p => p.playerID === playerID)[0]
        if (you && you.isAdmin) {
            setIsAdmin(you.isAdmin)
        }
    }

    const handleGameStart = () => {
        if (isAdmin) {
            socket.emit('start game')
        }
        socket.on('init state', data => setInitState(data))
    }

    useEffect(onLoad, 0)
    useEffect(checkAdmin, [playerList])
    useEffect(() => {
        if (Object.keys(initState).length) {
            console.trace(initState)
            setStart(true)
        }
    }, [initState])

    return (
        <div>
            {!start && (
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
                                    <p
                                        className={`${
                                            p.isAdmin ? 'isAdmin' : ''
                                        }`}
                                    >
                                        <em>{p.playerID}</em>
                                    </p>
                                    <br></br>
                                </div>
                            )
                        })}
                </div>
            )}

            {start && (
                <Game initState={initState} GAME_ID={GAME_ID} socket={socket} />
            )}
        </div>
    )
}

export default Lobby
