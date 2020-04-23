import React from 'react'
import Backdrop from '@material-ui/core/Backdrop'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff'
    }
}))

const WinLose = props => {
    const classes = useStyles()
    return (
        <Backdrop className={classes.backdrop} open={true}>
            {props.isWinner ? <h1>YOU HAVE WON!</h1> : <h1>YOU HAVE LOST!</h1>}
        </Backdrop>
    )
    return
}

export default WinLose
