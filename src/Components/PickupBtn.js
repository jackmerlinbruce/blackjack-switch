import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import Badge from '@material-ui/core/Badge'
import { scaleLinear } from 'd3-scale'

const PickupBtn = props => {
    const MAX_PICKUP = 2 * 2 * 2 * 2 * 5 + 5 + 2 * 4

    const scaleColor = scaleLinear()
        .domain([1, 20])
        .range(['black', 'red'])

    const useStyles = makeStyles(theme => ({
        margin: {
            margin: theme.spacing(1),
            position: 'fixed',
            bottom: '120px',
            right: '40px',
            backgroundColor: scaleColor(props.pickupAmount)
        },
        extendedIcon: {
            marginRight: theme.spacing(1)
        }
    }))

    const classes = useStyles()

    return (
        <div className={classes.margin}>
            <Badge
                badgeContent={'+' + props.pickupAmount}
                color="secondary"
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
            >
                <Fab
                    variant="extended"
                    size="medium"
                    color="primary"
                    aria-label="add"
                    className={classes.margin}
                    onClick={props.callback}
                    disabled={props.disabled}
                >
                    <AddIcon className={classes.extendedIcon} />
                    PICKUP
                </Fab>
            </Badge>
        </div>
    )
}

export default PickupBtn
