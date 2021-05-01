import React, { Component } from 'react' // prop rendering
import { connect } from 'react-redux' // database management
import PropTypes from 'prop-types' // prop type checkin
import { renderRoutes } from 'react-router-config' // centralized route configuration

import AppBar from '@material-ui/core/AppBar' // menu at top of screen, including links to other pages
import { Link } from 'react-router-dom' // functions for controlling route
import Toolbar from '@material-ui/core/Toolbar'; // provides style to appbar
import Typography from '@material-ui/core/Typography'; // text component
import Button from '@material-ui/core/Button' // button ui
import ListIcon from '@material-ui/icons/List' // three horizontal bars ui
import { amber, grey } from '@material-ui/core/colors' // coloring for loading bar and icons
import LoadingBar from 'react-redux-loading-bar' // loading bar
import { Helmet } from 'react-helmet' // html head manager for react
import ClassificationBanner from '@mobdata/classification-banner' // displays classification

import LoadingScreen from './components/LoadingScreen' // custom component to display while loading
import AppDrawer from './components/Drawer' // pop out menu
import AppDialog from './components/Dialog' // menu that overlays screen
import Poller from './components/Poller' // triggers & manages polling
import PollingButton from './components/PollingButton/PollingButton' // custom polling button component

import { toggleDrawer, toggleDialog } from './actions' // redux actions for polling data
import {
  getDrawerOpen, getDialogOpen,
  getDialogTitle, getDialogMessage,
} from './reducer' // redux getters and setters

import { getNodes, fetchNodes, togglePolling } from '../Nodes/actions' // redux functions for Node info
import { getIsPolling } from '../Nodes/reducer' // geter for redux polling boolean

import { logout } from '../Auth/actions' // username and password authentication
import { getAuthenticated, getLoading } from '../Auth/reducer' // redux functions

const styles = {
  container: {
    marginTop: 25, // defines amt of buffer space at top of component
  },
  loadingBar: {
    backgroundColor: amber[500], // coor for loading bar
  },
  icons: {
    color: grey, // color for list icon
  },
  routes: {
    position: 'absolute', // toolbar is positioned relative to cosest ancestor component
    right: '100px', // affects horizontal position of toolbar element
  },
}

class App extends Component {
  // trigger onPoll function
  componentDidMount() {
    const { dispatch } = this.props
    dispatch(togglePolling(true))
  }

  // trigger onPollDisable function
  componentWillUnmount() {
    const { dispatch } = this.props
    dispatch(togglePolling(false))
  }

  // when polling button pressed, get nodes get, fetch nodes and toggle polling to true
  onPollEnable = () => {
    const { dispatch } = this.props
    dispatch(getNodes())
    dispatch(fetchNodes())
    dispatch(togglePolling(true))
  }

  // when polling button
  onPollDisable = () => {
    const { dispatch } = this.props
    dispatch(togglePolling(false))
  }

  onPoll() {
    const { dispatch } = this.props
    dispatch(fetchNodes())
  }

  // opens drawer menu
  toggleDrawer = () => {
    const { dispatch } = this.props
    dispatch(toggleDrawer())
  }

  // sets dialog to false
  toggleDialog = () => {
    const { dispatch } = this.props
    dispatch(toggleDialog(false))
  }

  logout = () => {
    const { dispatch } = this.props
    dispatch(logout())
  }

  render() {
    const {
      authenticated, drawerOpen, dialogOpen,
      dialogMessage, dialogTitle, isLoading,
      location, polling, route,
    } = this.props
    // TODO: Find a less hacky way to do this
    const { host } = window.location // URL of the current page
    const hostName = host.indexOf('.') > 0 ? host.slice(0, host.indexOf('.')) : host // name of the server
    const nodeName = `${hostName} Boss`
    const appBarTitle = 'MobBoss'
    // array of routes to the different app components
    const routesArray = Array.prototype.slice.call(route.routes)

    /*
       chooses which buttons to display  based on the current location.
       (e.g display buttons for nodes and conflicts when on network page)
    */
    const locations  = [
      {
        currentPath: '/', buttonTitle: 'Conflicts', newPath: '/conflicts', buttonTitle2: 'Network', newPath2: '/network',
      },
      {
        currentPath: '/conflicts', buttonTitle: 'Nodes', newPath: '/', buttonTitle2: 'Network', newPath2: '/network',
      },
      {
        currentPath: '/network', buttonTitle: 'Nodes', newPath: '/', buttonTitle2: 'Conflicts', newPath2: '/conflicts',
      },
      {
        currentPath: '/mobboss/', buttonTitle: 'Conflicts', newPath: '/mobboss/conflicts', buttonTitle2: 'Network', newPath2: '/mobboss/network',
      },
      {
        currentPath: '/mobboss/conflicts', buttonTitle: 'Nodes', newPath: '/mobboss/', buttonTitle2: 'Network', newPath2: '/mobboss/network',
      },
      {
        currentPath: '/mobboss/network', buttonTitle: 'Nodes', newPath: '/mobboss/', buttonTitle2: 'Conflicts', newPath2: '/mobboss/conflicts',
      },
    ].filter((paths) => paths.currentPath === location.pathname)
    let pollingButton // initialize polling button

    // determind polling button apprearance based on pollingstate
    if (polling) { // if polling, call onPollDisable
      pollingButton = (
        <PollingButton
          onClick={this.onPollDisable}
          isPolling={polling}
          isLoading={isLoading}
          style={{ position: 'right' }}
        />
      )
    } else { // if polling === false, call onPollingEnable
      pollingButton = (
        <PollingButton
          onClick={this.onPollEnable}
          isPolling={polling}
          isLoading={isLoading}
          style={{ position: 'right' }}
        />
      )
    }

    return (
      <div style={styles.container}>
        <Helmet>
          <title>{nodeName}</title>
        </Helmet>
        <ClassificationBanner classification="unclassified" /* displays classification of node *//>
        <LoadingScreen /* if loading then display this */ />
        <AppBar position="sticky" color="primary">
          <Toolbar>
            <Button onClick={this.toggleDrawer}>
              <ListIcon htmlColor="white" />
            </Button>
            <Typography variant="h4" color="inherit">
              {appBarTitle}
            </Typography>
            <Toolbar style={styles.routes}>
              <Link to={locations[0].newPath}>
                <Typography style={{ color: 'white', paddingRight: '15px' }}>
                  {locations[0].buttonTitle}
                </Typography>
              </Link>
              <Link to={locations[0].newPath2}>
                <Typography style={{ color: 'white', paddingRight: '5px' }}>
                  {locations[0].buttonTitle2}
                </Typography>
              </Link>
              {polling && <Poller onPoll={() => this.onPoll()} />}
              {pollingButton}
            </Toolbar>
          </Toolbar>
        </AppBar>
        <LoadingBar style={styles.loadingBar} /* indicates api call progress */ />
        <AppDrawer
          authenticated={authenticated}
          open={drawerOpen}
          toggleDrawer={this.toggleDrawer}
          isLoading={isLoading}
          logout={this.logout}
        />
        <AppDialog
          title={dialogTitle}
          message={dialogMessage}
          open={dialogOpen}
          toggleDialog={this.toggleDialog}
        />
        {renderRoutes(routesArray)}
      </div>
    )
  }
}

// prop typechecking
App.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  dialogOpen: PropTypes.bool.isRequired,
  dialogTitle: PropTypes.string,
  dialogMessage: PropTypes.string,
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired }).isRequired,
  dispatch: PropTypes.func.isRequired,
  drawerOpen: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  route: PropTypes.shape({
    routes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  }).isRequired,
  polling: PropTypes.bool.isRequired,
}

App.defaultProps = {
  dialogTitle: '',
  dialogMessage: '',
}

/* each line maps (X react props: Y redux state)
   and updates this component every time redux store updates */
const mapStateToProps = (state) => ({
  authenticated: getAuthenticated(state),
  isLoading: getLoading(state),
  drawerOpen: getDrawerOpen(state),
  dialogOpen: getDialogOpen(state),
  dialogTitle: getDialogTitle(state),
  dialogMessage: getDialogMessage(state),
  polling: getIsPolling(state),
})

export default connect(mapStateToProps)(App)
