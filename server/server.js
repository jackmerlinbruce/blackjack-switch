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

let players = []

io.on('connection', socket => {
    /* only adds players to the playerList 
    if they get replied from the client's
    local storage */
    const playerID = 'player-' + uuid.v4()
    socket.emit('getPlayerID', { playerID })
    socket.on('reply', data => {
        console.log(data)
        if (!players.includes(data.playerID)) {
            players.push(data.playerID)
        }
        console.log('players', players)
    })
    players = players.map(p => p)
    socket.emit('getAllPlayers', { players })

    // console.log('New client connected', playerID)
    // socket.on('disconnect', () => console.log('Client disconnected', playerID))
})

server.listen(port, () => console.log(`Listening on port ${port}`))
