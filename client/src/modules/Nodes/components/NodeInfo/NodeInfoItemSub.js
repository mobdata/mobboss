/* Fucntional component that displays subheader for NodeInfoItem object */
import React from 'react'
import PropTypes from 'prop-types'
import ListSubheader from '@material-ui/core/ListSubheader'

// CSS for divider, ListSubheader, and Unorderd List Element
const styles = {
  div: {
    padding: '0px',
  },
  subheader: {
    padding: '2px',
    lineHeight: '1em',
  },
  listItem: {
    padding: '2px',
    lineHeight: '12px',
    fontSize: '12px',
  },
}

/* COMPONENTS
   ul: unordered list item that contains name of a single sever in the list(prop) array
*/
const NodeInfoItemSub = (props) => {
  const { list, subheaderText } = props
  // List: list of servers with type X of document transfer
  // Subheader Text: String of X type of document transfer( either failed, active, or completed)
  const items = (typeof list === 'undefined') ? [] : list
  return (
    <div style={styles.div}>
      <ListSubheader style={styles.subheader}>{subheaderText}</ListSubheader>
      {items.map((item) => (
        <ul key={item} style={styles.listItem}>
          {' '}
          {item}
          {' '}
        </ul>
      ))}
    </div>
  )
}

NodeInfoItemSub.propTypes = {
  subheaderText: PropTypes.string,
  list: PropTypes.arrayOf(PropTypes.string),
}

NodeInfoItemSub.defaultProps = {
  subheaderText: '',
  list: [],
}
export default NodeInfoItemSub
