import {
  LOGIN_SUCCESS, LOGIN_ATTEMPT, LOGIN_FAILURE,
  LOGOUT_SUCCESS, LOGOUT_ATTEMPT, LOGOUT_FAILURE,
} from '../actions'

const initialState = {
  authenticated: process.env.NODE_ENV === 'development',
  loading: false,
}

const AuthReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return { authenticated: true, loading: false }
    case LOGIN_ATTEMPT:
      return { authenticated: false, loading: true }
    case LOGIN_FAILURE:
      return { authenticated: false, loading: false }
    case LOGOUT_SUCCESS:
      return { authenticated: false, loading: false }
    case LOGOUT_ATTEMPT:
      return { authenticated: true, loading: true }
    case LOGOUT_FAILURE:
      return { authenticated: true, loading: false }
    default:
      return state
  }
}

export const getAuthenticated = (state) => state.auth.authenticated
export const getLoading = (state) => state.auth.loading

export default AuthReducer
