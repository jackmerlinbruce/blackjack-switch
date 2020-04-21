const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const axios = require('axios')
const cors = require('cors')
const uuid = require('uuid')

const port = process.env.PORT || 4001
const index = require('./routes/index')
const app = express()
app.use(cors())
app.use(index)
const server = http.createServer(app)
const io = socketIo(server)

/*
 *
 * The IO Server
 *
 */

let playerList = []
let initState = require('./states/initState')

function setAdmin(playerList) {
    playerList.sort((a, b) => {
        return a.joined - b.joined
    })
    if (playerList.length) {
        playerList[0].isAdmin = true
    }
    return playerList
}

function addPlayer(playerID, playerList) {
    playerList.push({
        playerID,
        joined: new Date(),
        isAdmin: false
    })
    return playerList
}

function removePlayer(playerID, playerList) {
    return playerList.filter(p => {
        return p.playerID !== playerID
    })
}

function updateNextPlayer(state) {
    const newPlayerIndex =
        state.currentPlayerIndex + state.numEightSkips >=
        state.playerList.length - 1
            ? 0
            : state.currentPlayerIndex + 1 + state.numEightSkips

    return {
        ...state,
        isRunInPlay: false,
        numEightSkips: 0,
        currentPlayerIndex: newPlayerIndex,
        currentPlayerID: state.playerList[newPlayerIndex].playerID
    }
}

io.on('connection', socket => {
    let playerID = socket.id

    // emit to all players1
    socket.emit('new player', { playerID })
    console.log('new player', playerID)

    // emit to all players
    playerList = addPlayer(playerID, playerList)
    playerList = setAdmin(playerList)
    io.emit('current players', { playerList })

    // disconnect and remove player, reset admin
    socket.on('disconnect', () => {
        playerList = removePlayer(playerID, playerList)
        playerList = setAdmin(playerList)
        io.emit('current players', { playerList })
    })

    // initiate start game sequence
    socket.on('start game', () => {
        console.log('game started by', playerID)
        io.emit('init state', initState(playerList))
        io.emit('start game', { start: true })
    })

    // recieve and update new state
    socket.on('update state', data => {
        console.log('new state arrived')
        console.log('calculating next player')
        io.emit('update state', updateNextPlayer(data))
    })
})

server.listen(port, () => console.log(`Listening on port ${port}`))
