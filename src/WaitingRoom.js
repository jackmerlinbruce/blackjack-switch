/*
The goal of the waiting room is to create the playerList
to pass to <Game players={playerList} />
*/

import React, { useState } from 'react'
import Game from './Game'
import { v4 as uuid } from 'uuid'

const GAME_ID = 'WfF19APDbocNLq9IEznI'

const playerList = [
    prompt('Player 1?'),
    sessionStorage.tabID
        ? sessionStorage.tabID
        : (sessionStorage.tabID = uuid()),
    prompt('Player 3?')
]

const WaitingRoom = () => {
    const [start, setStart] = useState(false)
    // const [playerList, setPlayerList] = useState(false)

    return (
        <div className={'WaitingRoom'}>
            {!start && (
                <React.Fragment>
                    <button onClick={() => setStart(true)}>START</button>
                </React.Fragment>
            )}
            {start && <Game playerList={playerList} GAME_ID={GAME_ID} />}
        </div>
    )
}

export default WaitingRoom
