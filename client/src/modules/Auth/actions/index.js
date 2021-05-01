/*
   handles login/logout attempts using redux store
   NOTE: this code is likely deprecated. client more likely to require pki authentication
*/
import { push } from 'connected-react-router' // connects redux states to router
import { showLoading, hideLoading } from 'react-redux-loading-bar' // loading bar for long api calls

import callApi from '../../../util/apiCaller' // gets data from server
import { toggleDialog } from '../../App/actions' // toggles dialog

// exports to ./actions
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_ATTEMPT = 'LOGIN_ATTEMPT'
export const LOGIN_FAILURE = 'LOGIN_FAILURE'

export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'
export const LOGOUT_ATTEMPT = 'LOGOUT_ATTEMPT'
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE'

export function loginSuccess() {
  return {
    type: LOGIN_SUCCESS,
  }
}

export function loginAttempt() {
  return {
    type: LOGIN_ATTEMPT,
  }
}

export function loginFailure() {
  return {
    type: LOGIN_FAILURE,
  }
}

export function logoutSuccess() {
  return {
    type: LOGOUT_SUCCESS,
  }
}

export function logoutAttempt() {
  return {
    type: LOGOUT_ATTEMPT,
  }
}

export function logoutFailure() {
  return {
    type: LOGOUT_FAILURE,
  }
}

export function login(credentials) {
  return async (dispatch) => {
    dispatch(showLoading()) // slow loading until completion of login process

    try {
      dispatch(loginAttempt())
      const { response, json } = await callApi('users/login', 'post', credentials)

      /* if response.ok from server is false,
         then parse which kind of failure and dispatch appropriate actions */
      if (!response.ok) {
        let statusText
        if (response.status === 500) { statusText = 'Internal Server Error' }
        if (response.status === 401) { statusText = 'Unauthorized' }
        if (response.status === 400) { statusText = 'Bad Request' }

        dispatch(loginFailure())
        dispatch(toggleDialog(true, statusText, json.reason))
        dispatch(hideLoading())
        return
      }

      // else if login success, allow user to continue to app
      dispatch(loginSuccess())
      dispatch(push('/dashboard'))
      dispatch(hideLoading())
    } catch (err) { // in case of netwoek error
      dispatch(loginFailure())
      dispatch(toggleDialog(true, 'Network Error', err.message))
      dispatch(hideLoading())
    }
  }
}

// authenticate user by checking server for user
export function authenticate() {
  return async (dispatch) => {
    try {
      const { json } = await callApi('users/me')

      if (json.authenticated) {
        dispatch(loginSuccess())
        dispatch(push('/dashboard'))
      }
    } catch (err) {
      dispatch(loginFailure())
    }
  }
}

// attempt to logout from server
export function logout() {
  return async (dispatch) => {
    dispatch(logoutAttempt())

    try {
      const { response } = await callApi('users/logout', 'post')

      // if response.ok from server is false, dispatch login failure
      if (!response.ok) {
        dispatch(logoutFailure())
        return
      }

      dispatch(logoutSuccess())
      dispatch(push('/'))
      return
    } catch (err) {
      dispatch(logoutFailure())
    }
  }
}
