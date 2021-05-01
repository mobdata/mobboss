/*
    Logs user in to mobboss
*/
import React, { Component } from 'react' // basic rendering
import PropTypes from 'prop-types' // prop type checks
import Button from '@material-ui/core/Button' // material UI button
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator' // validates text plaed in box

const textFieldStyle = {
  marginBottom: '2em',
}

const buttonStyle = {
  marginTop: '2em',
}

class LoginForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
    }
  }

  /*
     change username and password redux states
  */
  handleSubmit = () => {
    const { onSubmit } = this.props
    const { username, password } = this.state

    onSubmit({ username, password })
  }

  handleChange = (event) => {
    const { target } = event
    const { name, value } = target

    this.setState({
      [name]: value,
    })
  }

  render() {
    const { loading } = this.props
    const { username, password } = this.state
    return (
      <ValidatorForm
        onSubmit={this.handleSubmit}
        autoComplete="off"
        noValidate
      >
        <TextValidator
          name="username"
          hintText="Enter Your Username"
          onChange={this.handleChange}
          floatingLabelText="Username"
          fullWidth
          value={username}
          disabled={loading}
          style={textFieldStyle}
          validators={['required']}
          errorMessages={['This field is required']}
        />
        <TextValidator
          name="password"
          hintText="Enter Your Password"
          floatingLabelText="Password"
          type="password"
          onChange={this.handleChange}
          value={password}
          fullWidth
          disabled={loading}
          style={textFieldStyle}
          validators={['required']}
          errorMessages={['This field is required']}
        />
        <Button
          type="submit"
          label="Login"
          disabled={loading}
          fullWidth
          style={buttonStyle}
        />
      </ValidatorForm>
    )
  }
}

LoginForm.propTypes = {
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default LoginForm
