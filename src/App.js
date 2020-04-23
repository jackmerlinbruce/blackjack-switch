import React from 'react'
import Header from './Containers/Header'
import Container from '@material-ui/core/Container'
import Lobby from './Containers/Lobby'

const App = () => {
    return (
        <div className={'App'}>
            <Header />
            <Container maxWidth="md">
                <Lobby />
            </Container>
        </div>
    )
}

export default App
