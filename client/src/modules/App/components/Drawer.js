/*
  container component for custom appDrawer, links user to all available routes
*/
import React from 'react' // basic rendering
import PropTypes from 'prop-types' // prop typechecking
import { Link } from 'react-router-dom' // routing functions
import AppBar from '@material-ui/core/AppBar' // Bar containing options for
import Drawer from '@material-ui/core/Drawer' // menu at top of screen; includes links to other pages
import MenuItem from '@material-ui/core/MenuItem' // clickable menu item button

const AppDrawer = (props) => {
  /* PROPS
     authenticated: boolean, returns true if authentication successful
     open: boolean, returns true if this conponent is open
     toggleDrawer: function, toggles open variable from true/false
     isLoading: boolean, returns true if components loading
     logout: function, toggles authentication to false, erases authentication data
  */
  const {
    authenticated, open, toggleDrawer, isLoading, logout,
  } = props

  return (
    <div>
      <Drawer // menu that opens and closes from right side of screen
        // docked={false}
        open={open}
        onClose={toggleDrawer}
        width={250}
      >
        <AppBar // displays title of drawer
          title="Menu"
          position="relative"
        >
          Menu
        </AppBar>
        {
          /* if authenticated display menu for node/conflicts/network pages
             otherwise display menu options to login page */
        authenticated
          ? (
            <div>
              <Link to="/">
                <MenuItem // link to node page
                  onClick={toggleDrawer}
                  disabled={isLoading}
                >
                  Nodes
                </MenuItem>
              </Link>
              <Link to="/conflicts">
                <MenuItem // links to conflicts page
                  onClick={toggleDrawer}
                  disabled={isLoading}
                >
                  Conflicts
                </MenuItem>
              </Link>
              <Link to="/network">
                <MenuItem // links to node network page
                  onClick={toggleDrawer}
                  disabled={isLoading}
                >
                  Network
                </MenuItem>
              </Link>
              <MenuItem // log out user, set authentication to false
                onClick={logout}
                disabled={isLoading}
              >
                Logout
              </MenuItem>
            </div>
          )
          : (
            <Link to="/">
              <MenuItem onClick={toggleDrawer}>Login</MenuItem>
            </Link>
          )
      }
      </Drawer>
    </div>
  )
}

AppDrawer.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  open: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
}

export default AppDrawer
