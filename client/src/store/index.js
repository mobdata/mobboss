/*
  configures redux store
*/
import { createStore, compose, applyMiddleware } from 'redux' // basic redux functions
import thunk from 'redux-thunk' // redux middleware
// eslint-disable-next-line import/no-extraneous-dependencies
import immutableStateInvariantMiddleware from 'redux-immutable-state-invariant' // disallows direct state mutations, must return new isntance of the state
import { routerMiddleware } from 'connected-react-router'

import combineReducers from '../reducer' // streamlines mobboss reducers

// configures store based on production or development mode
export default function configureStore(history, initialState = {}) {
  const middleware = process.env.NODE_ENV !== 'production'
    ? [
      thunk,
      immutableStateInvariantMiddleware(),
      routerMiddleware(history),
    ]
    : [
      thunk,
      routerMiddleware(history),
    ]

  // Create the initial store and apply thunk middleware

  return createStore(
    combineReducers(history),
    initialState,
    compose(
      applyMiddleware(...middleware),
    ),

  )
}
