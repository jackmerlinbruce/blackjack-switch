/*
The goal of the waiting room is to create the playerList
to pass to <Game players={playerList} />
*/

import React, { useState, useEffect } from 'react'
import Game from './Game'
import { v4 as uuid } from 'uuid'
import socketIOClient from 'socket.io-client'
//https://www.valentinog.com/blog/socket-react/

const GAME_ID = 'WfF19APDbocNLq9IEznI'

const playerList = [
    // prompt('Player 1?'),
    sessionStorage.tabID
        ? sessionStorage.tabID
        : (sessionStorage.tabID = uuid())
    // prompt('Player 3?')
]

const WaitingRoom = () => {
    const [start, setStart] = useState(false)
    const [playerID, setPlayerId] = useState(sessionStorage.playerID || null)
    const [myPlayerList, setMyPlayerList] = useState([])
    const socket = socketIOClient('http://127.0.0.1:4001')

    useEffect(() => {
        // if no playerID in local storage
        // get fresh ID from server
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

        socket.emit('reply', { playerID })

        socket.on('getAllPlayers', data => {
            console.log('all players', data)
            setMyPlayerList(data.players)
        })
    }, [])

    return (
        <div className={'WaitingRoom'}>
            {!start && (
                <React.Fragment>
                    <h1>You: {playerID}</h1>
                    {myPlayerList.length &&
                        myPlayerList.map(p => {
                            return <p>{p}</p>
                        })}
                    <button onClick={() => setStart(true)}>START</button>
                </React.Fragment>
            )}
            {start && <Game playerList={myPlayerList} GAME_ID={GAME_ID} />}
        </div>
    )
}

export default WaitingRoom
