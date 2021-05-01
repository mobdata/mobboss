import React from 'react' // react building blocks
import { render } from 'react-dom' // imports render function for react
import { Provider } from 'react-redux' // makes redux store available to any nested components
import { renderRoutes } from 'react-router-config' // render pages connected to routes
import { ConnectedRouter } from 'connected-react-router' // sync router state with react store
import { createBrowserHistory as createHistory } from 'history' // create router history
import createMuiTheme from '@material-ui/core/styles/createMuiTheme' // creates theme
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider' // allows theme to be used down the react tree
import { grey, blueGrey } from '@material-ui/core/colors' // color scheme for mobboss

import registerServiceWorker from './registerServiceWorker' // background client script
import configureStore from './store' // configure store function
import routes from './routes' // import routes
import './main.css' // import local css styles

// create router history
const history = createHistory()
// configure redux store for history
const store = configureStore(history)

// color scheme for material ui components in this app
const muiTheme = createMuiTheme({
  palette: {
    primary1Color: grey[700],
    primary2Color: grey[500],
    primary3Color: grey[100],
    accent1Color: blueGrey[100],
    accent2Color: blueGrey[500],
    accent3Color: blueGrey[700],
  },
})
const App = () => (
  <Provider store={store}>
    <MuiThemeProvider theme={muiTheme}>
      <ConnectedRouter history={history}>
        <div>
          { renderRoutes(routes) }
        </div>
      </ConnectedRouter>
    </MuiThemeProvider>
  </Provider>
)

render(<App />, document.getElementById('root'));
registerServiceWorker()
