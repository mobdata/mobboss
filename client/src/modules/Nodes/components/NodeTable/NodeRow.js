/*
   component that contains node cells
*/
import React, { Component } from 'react' // component rendering
import PropTypes from 'prop-types' // proptype checking
import shortid from 'shortid' // unique id generator

import NodeCell from './NodeCell' // custom node cell component

class NodeRow extends Component {
  render() {
    /* PROPS
      node: node network data for <this> row's node
      selectedRows: array of names of selected nodes
      headerCells: array of strings used to create chart headers titles
      dispatch: redux functions
    */
    const {
      node, selectedRows, headerCells, dispatch,
    } = this.props
    const selected = selectedRows.includes(node.node_name)

    return (
      headerCells.map((column) => (
        <NodeCell
          column={column} // array of cell type identifiers
          selected={selected} // boolean to indicate whether this column is selected
          node={node} // node network data
          key={shortid.generate()} // generates id for nodecell
          selectedRows={selectedRows} // array of selected rows
          dispatch={dispatch} // actions
        />
      ))
    )
  }
}

NodeRow.propTypes = {
  node: PropTypes.shape({
    node_name: PropTypes.string,
    url: PropTypes.string,
  }).isRequired,
  selectedRows: PropTypes.arrayOf(PropTypes.string).isRequired,
  headerCells: PropTypes.arrayOf(PropTypes.string).isRequired,
  dispatch: PropTypes.func.isRequired,
}

export default NodeRow
