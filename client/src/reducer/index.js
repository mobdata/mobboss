import { combineReducers } from 'redux' // streamlines mobboss's various reducers
import { loadingBarReducer as loadingBar } from 'react-redux-loading-bar' // provides loading bar for long loading tasks
import { connectRouter } from 'connected-react-router' // synchronize router state with redux store

// import various different reducers form across mobboss app
import app from '../modules/App/reducer'
import auth from '../modules/Auth/reducer'
import conflict from '../modules/Conflicts/reducer'
import node from '../modules/Nodes/reducer'
import graph from '../modules/NetworkGraph/reducer'

/*
    turns an object whose values are different reducing functions into
    a single reducing function you can pass to createStore
*/
export default (history) => combineReducers({
  router: connectRouter(history),
  app,
  auth,
  conflict,
  node,
  graph,
  loadingBar,
})
