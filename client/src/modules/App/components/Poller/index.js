import { Component } from 'react' // react app building
import PropTypes from 'prop-types' // prop type checking

class Poller extends Component {
  constructor(props) {
    super(props)

    this.poll = null
  }

  componentDidMount() {
    const { onPoll } = this.props
    onPoll()
    this.poll = setInterval(onPoll, 5000)
  }

  shouldComponentUpdate() {
    return false
  }

  componentDidUpdate() {
    const { onPoll } = this.props
    clearInterval(this.poll)
    this.poll = null
    this.poll = setInterval(onPoll, 5000)
  }

  componentWillUnmount() {
    clearInterval(this.poll)
    this.poll = null
  }

  render() {
    return null
  }
}
/* eslint-disable */
Poller.propTypes = {
  onPoll: PropTypes.func,
}


export default Poller
