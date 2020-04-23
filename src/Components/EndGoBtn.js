import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Fab from '@material-ui/core/Fab'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'

const useStyles = makeStyles(theme => ({
    margin: {
        margin: theme.spacing(1),
        position: 'fixed',
        bottom: '40px',
        right: '40px'
    },
    extendedIcon: {
        marginRight: theme.spacing(1)
    }
}))

const EndGoBtn = props => {
    const classes = useStyles()

    return (
        <div className={'EndGoBtn'}>
            <Fab
                variant="extended"
                size="medium"
                color="primary"
                aria-label="add"
                className={classes.margin}
                onClick={props.callback}
            >
                <NavigateNextIcon className={classes.extendedIcon} />
                END GO
            </Fab>
        </div>
    )
}

export default EndGoBtn
