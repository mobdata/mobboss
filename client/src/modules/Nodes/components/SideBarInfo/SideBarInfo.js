/*
   Custom container component, contians NodeInfoList
*/
import React from 'react' // prop rendering
import PropTypes from 'prop-types' // prop type checking

import NodeInfoList from '../NodeInfo/NodeInfoList' // custom node info display box

// CSS for Side bar
const styles = {
  sideBar: {
    display: 'flex', // bar will fill the empty space on the screen
    flexDirection: 'column', // flexible item displayed vertically
    padding: '1.2em',
  },
}

const SideBarInfo = (props) => {
  const { selectedNodes } = props // contains list of nodes that have been "checked"

  return (
    <div style={styles.sideBar}>
      <NodeInfoList // contains pertinent node data
        selectedNodes={selectedNodes}
      />
    </div>
  )
}

SideBarInfo.propTypes = {
  selectedNodes: PropTypes.arrayOf(
    PropTypes.shape({}),
  ).isRequired,
}

export default SideBarInfo
