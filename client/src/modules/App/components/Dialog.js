/*
   superimpose messages over app screen
   (about connection erros, node fetching errors, auth errors, etc)
*/
import React from 'react' // react rendering
import PropTypes from 'prop-types' // prop typechecking
import Dialog from '@material-ui/core/Dialog' // dialog box
import Button from '@material-ui/core/Button' // button

const AppDialog = (props) => {
  /*
    PROPS
    message: string, text to  be displayed
    title: string, title to be displayed, if any
    open: boolean, if open, opens dialog
    toggleDialog: function: opens/closes dialog
  */
  const {
    message, title, open, toggleDialog,
  } = props

  const actions = [
    <Button
      ButtonClassKey="flat"
      label="Ok"
      onClick={toggleDialog}
      primary
    />,
  ]

  return (
    <div>
      <Dialog // creates dialog
        title={title}
        actions={actions} // dialog buttons/feaures
        modal={false}
        open={open} // if true, then dialog open
        onClose={toggleDialog} // flips open to false
      >
        {message}
      </Dialog>
    </div>
  )
}

AppDialog.defaultProps = {
  title: '',
  message: '',
}

AppDialog.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  open: PropTypes.bool.isRequired,
  toggleDialog: PropTypes.func.isRequired,
}

export default AppDialog
