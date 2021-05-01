/* displays circular progress bar when components take a long time to load */
import React from 'react' // prop rendering
import PropTypes from 'prop-types' // prop type
import CircularProgress from '@material-ui/core/CircularProgress' // loading animation
import { grey, blueGrey } from '@material-ui/core/colors' // imports colors from material ui

const styles = {
  loadingScreen: {
    position: 'absolute', // position relative to adjacent components
    top: 0, // position top left corner
    left: 0,
    height: '100%', // takes up 100 pct of the screen
    width: '100%',
    backgroundColor: blueGrey[700],
    zIndex: 9999,
  },
  progress: {
    margin: 'auto',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
}

const LoadingScreen = (props) => {
  const { loading } = props
  // if not loading reurn null
  if (!loading) return null
  // else  return progress circle that covers the whole screen
  return (
    <div style={styles.loadingScreen}>
      <CircularProgress
        style={styles.progress}
        size={100}
        thickness={5}
        color={grey[100]}
      />
    </div>
  )
}

LoadingScreen.propTypes = {
  loading: PropTypes.bool,
}

LoadingScreen.defaultProps = {
  loading: false,
}

export default LoadingScreen
