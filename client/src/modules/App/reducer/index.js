/*
  updates states specific to app page
*/
import { TOGGLE_DRAWER, TOGGLE_DIALOG } from '../actions' // actions

const initialState = {
  loading: false, // true when app components loading
  drawerOpen: false, // true when user opens drawer
  dialogOpen: false, // true when app opens dialog
  dialogTitle: '',
  dialogMessage: '',
}

// updates state based on action
const AppReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_DRAWER:
      return { ...state, drawerOpen: !state.drawerOpen }
    case TOGGLE_DIALOG:
      return {
        ...state,
        dialogOpen: action.open,
        dialogTitle: action.title,
        dialogMessage: action.message,
      }
    default:
      return state
  }
}

// getters
export const getDrawerOpen = (state) => state.app.drawerOpen
export const getDialogOpen = (state) => state.app.dialogOpen
export const getDialogTitle = (state) => state.app.dialogTitle
export const getDialogMessage = (state) => state.app.dialogMessage

export default AppReducer
