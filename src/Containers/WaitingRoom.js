/*
The goal of the waiting room is to create the playerList
to pass to <Game players={playerList} />
*/

import React, { useState, useEffect } from 'react'
import Game from './Game'
import socketIOClient from 'socket.io-client'
import { initState } from '../Utils/initState'
import { db } from '../firebase'

const GAME_ID = 'WfF19APDbocNLq9IEznI'

const WaitingRoom = () => {
    const [start, setStart] = useState(false)
    const [playerID, setPlayerId] = useState(sessionStorage.playerID || null)
    const [myPlayerList, setMyPlayerList] = useState([])
    const socket = socketIOClient('http://127.0.0.1:4001')

    const syncToFirebase = () => {
        const newGameState = initState(['Jack'])
        db.collection('games')
            .doc(GAME_ID)
            .get()
            .then(doc => console.log('game exists?', doc.exists))
        db.collection('games')
            .doc(GAME_ID)
            .set({ state: initState(['Jack']) })
            .then(() => console.log('initState synced to Firebase!'))
            .catch(error => console.error('Error syncing to Firebase: ', error))
    }

    useEffect(syncToFirebase, [])

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

    const handleStart = () => {
        setStart(true)
        sessionStorage.gameStarted = true
    }

    return (
        <div className={'WaitingRoom'}>
            {!start && (
                <React.Fragment>
                    <h1>You: {playerID}</h1>
                    {myPlayerList.length &&
                        myPlayerList.map(playerID => {
                            return <p key={playerID}>{playerID}</p>
                        })}
                    <button onClick={handleStart}>START</button>
                </React.Fragment>
            )}
            {start && <Game playerList={myPlayerList} GAME_ID={GAME_ID} />}
        </div>
    )
}

export default WaitingRoom
