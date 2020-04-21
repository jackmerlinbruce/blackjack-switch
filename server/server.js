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

const playerList = {}
let playerList2 = []

io.on('connection', socket => {
    // set playerID
    let playerID = socket.id

    // add player to list
    // set time joined
    playerList[playerID] = {
        joined: new Date(),
        isAdmin: false
    }
    playerList2.push({
        playerID,
        joined: new Date()
    })

    // make earliest player the admin
    playerList2.sort((a, b) => {
        return a.joined - b.joined
    })
    playerList2.length ? (playerList2[0].isAdmin = true) : null

    console.log('new player', playerID)

    socket.emit('new player', { playerID })
    io.emit('current players', {
        playerList,
        playerList2
    })

    socket.on('disconnect', () => {
        delete playerList[playerID]
        playerList2 = playerList2.filter(p => {
            return p.playerID !== playerID
        })
        // make earliest player the admin
        playerList2.sort((a, b) => {
            return a.joined - b.joined
        })
        playerList2[0].isAdmin = true
        io.emit('current players', {
            playerList,
            playerList2
        })
    })
})

server.listen(port, () => console.log(`Listening on port ${port}`))
