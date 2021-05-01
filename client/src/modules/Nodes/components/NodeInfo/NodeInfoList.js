/* Component that displays stack of NodeInfoItems for selected nodes
   on right side of Nodes page */
import React from 'react'
import PropTypes from 'prop-types'

import NodeInfoItem from './NodeInfoItem'

// CSS for unordered list (ul) element
const styles = {
  list: {
    padding: '1em',
    marginTop: '0',
    overflowY: 'visible',
    height: '600px',
  },
}

/*
 COMPONENTS
  List: Contains all NodeInfoItems for selectedNodes
  NodeInfoItem: Contains info for a node
*/
const NodeInfoList = (props) => {
  const { selectedNodes } = props
  const nodes = selectedNodes

  const list = nodes.map((node) => (
    <NodeInfoItem
      node={node}
      key={node.id}
    />
  ))

  return (
    <ul style={styles.list}>
      {list.length ? list : 'No nodes selected'}
    </ul>
  )
}

NodeInfoList.propTypes = {
  selectedNodes: PropTypes.arrayOf(
    PropTypes.shape({}),
  ).isRequired,
}

export default NodeInfoList
