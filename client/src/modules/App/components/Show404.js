/*
   display this page when user tries to route app to nonexistant component
*/
import React from 'react' // react rendering
import PropTypes from 'prop-types' // prop typecheck

const Show404 = (props) => {
  const { location } = props

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>404 - Not Found</h1>
      <p>
        The page
        {location.pathname}
        {' '}
        was not found.
      </p>
    </div>
  )
}

Show404.propTypes = {
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired }).isRequired,
}

export default Show404
