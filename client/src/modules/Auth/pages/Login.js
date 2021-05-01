/*
  TODO: find where Login used, this seems to be dead code
*/
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Paper from '@material-ui/core/Paper'

import { login, authenticate } from '../actions'
import { getLoading } from '../reducer'

import LoginForm from '../components/LoginForm'

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2em',
  },
  paper: {
    padding: '2em 4em 3em 4em',
    width: '600px',
  },
}

class Login extends Component {
  constructor(props) {
    super(props)
    this.props.dispatch(authenticate())
  }

  onSubmit = (formData) => {
    this.props.dispatch(login(formData))
  }

  render() {
    const { loading } = this.props

    return (
      <section style={styles.container}>
        <Paper style={styles.paper} zDepth={2}>
          <LoginForm
            loading={loading}
            onSubmit={this.onSubmit}
          />
        </Paper>
      </section>
    )
  }
}

Login.propTypes = {
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
}

const mapStateToProps = (state) => ({
  loading: getLoading(state),
})

export default connect(mapStateToProps)(Login)
