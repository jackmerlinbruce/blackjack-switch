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
let initState = require('./initState')

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
        joined: new Date()
    })
    return playerList
}

function removePlayer(playerID, playerList) {
    return playerList.filter(p => {
        return p.playerID !== playerID
    })
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
        socket.emit('init state', initState(playerList))
    })
})

server.listen(port, () => console.log(`Listening on port ${port}`))
