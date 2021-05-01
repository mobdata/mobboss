/*
  Indicetes status of polling for mobboss
*/
import React, { Component } from 'react' // react rendering

import PropTypes from 'prop-types' // prop type checking
import Button from '@material-ui/core/Button' // material ui button
import Toolbar from '@material-ui/core/Toolbar' //
import Tooltip from '@material-ui/core/Tooltip' // displays some text onHover
import IconButton from '@material-ui/core/IconButton'; // button that can be represented as icon
import PauseCircleOutline from '@material-ui/icons/PauseCircleOutline' // pause symbol
import PlayCircleOutline from '@material-ui/icons/PlayCircleOutline' // play symbol

import Typography from '@material-ui/core/Typography'

class PollingButton extends Component {
  // component should update if polling or loading status changed
  shouldComponentUpdate(nextProps) {
    return nextProps.isPolling !== this.props.isPolling
      || nextProps.isLoading !== this.props.isLoading
  }

  render() {
    const {
      onClick, isPolling, isLoading,
    } = this.props

    // if loading, display "attempting to reconnect"
    if (isLoading) {
      return (
        <Button //
          label="Attempting to reconnect..."
          disabled={isLoading}
        >
          <Typography style={{ color: 'white' }}>
            Attempting to reconnect...
          </Typography>
        </Button>
      )
    }

    // if not loading, then display polling status/options
    return (
      <Toolbar style={{ position: 'right' }}>
        <Typography style={{ color: 'white', paddingRight: '15px' }}>
          {isPolling ? 'POLLING' : 'POLLING SUSPENDED'}
        </Typography>
        <Tooltip title={isPolling ? 'Pause Polling' : 'Resume Polling'}>
          <IconButton color="inherit" size="medium" onClick={onClick}>
            {isPolling ? <PauseCircleOutline /> : <PlayCircleOutline />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    )
  }
}
/* eslint-disable */
PollingButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  isPolling: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
}

export default PollingButton
