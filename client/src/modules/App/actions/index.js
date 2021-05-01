/*
  react functions that allow user to toggle drawer and dialog state on the Mobboss App
*/
export const TOGGLE_DRAWER = 'TOGGLE_DRAWER'
export const TOGGLE_DIALOG = 'TOGGLE_DIALOG'

export function toggleDrawer() {
  return {
    type: TOGGLE_DRAWER,
  }
}

export function toggleDialog(open, title, message) {
  return {
    type: TOGGLE_DIALOG,
    open,
    title,
    message,
  }
}
