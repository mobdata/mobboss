/*
  custom container component for NodeTable
*/
import React from 'react' // component loading
import PropTypes from 'prop-types' // prop typechecking
import shortid from 'shortid' // function to create unique IDs
import ReactLoading from 'react-loading' // creates loading animations

import Typography from '@material-ui/core/Typography'; // creates text box
import TableBody from '@material-ui/core/TableBody'; // component for table body
import TableCell from '@material-ui/core/TableCell'; // component for a cell within a table row
import TableRow from '@material-ui/core/TableRow'; // component that creates row within table body

import NodeRow from './NodeRow' // custom contianer component that creates tableRow

const NodeTableBody = (props) => {
  /* PROPS
    headerCells: array of strings of column names
    nodes: array of node data
    loading: boolean that indicates whether data is loading
    selectedRows: list of selected rows
    searchedNodes: list of nodes that fit search criteria
    dispatch: redux functions
  */
  const {
    headerCells, nodes, loading, selectedRows, searchedNodes, dispatch,
  } = props

  // if loading === true create loading animation
  if (loading) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={headerCells.length + 1}>
            <div width="100%" align="center">
              <ReactLoading type="spinningBubbles" color="gray" style={{ align: 'center', height: '10%', width: '10%' }} />
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    )
  // if nodes array is empty print that there are no nodes to display
  } if (nodes.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={headerCells.length + 1}>
            <Typography align="center">
              No nodes to display.
            </Typography>
          </TableCell>
        </TableRow>
      </TableBody>

    )
  }
  // if searched nodes has any nodes, use searchedNodes array to create table
  if (searchedNodes.length) {
    return (
      <TableBody>
        {searchedNodes[0].map((node) => {
          const selected = selectedRows.includes(node.node_name)

          return (
            <TableRow
              style={{ transition: 'width 100ms ease-in-out' }}
              selected={selected}
              key={shortid.generate()}
            >
              <NodeRow
                node={node}
                selectedRows={selectedRows}
                headerCells={headerCells}
                dispatch={dispatch}
              />
            </TableRow>
          )
        })}
      </TableBody>
    )
  }
  // else use Nodes array to create a table
  return (
    <TableBody>
      {nodes.map((node) => {
        const selected = selectedRows.includes(node.node_name)

        return (
          <TableRow
            style={{ transition: 'width 100ms ease-in-out' }}
            selected={selected}
            key={shortid.generate()}
          >
            <NodeRow
              node={node}
              selectedRows={selectedRows}
              headerCells={headerCells}
              dispatch={dispatch}
            />
          </TableRow>
        )
      })}
    </TableBody>
  )
}

NodeTableBody.propTypes = {
  headerCells: PropTypes.arrayOf(PropTypes.string).isRequired,
  nodes: PropTypes.arrayOf(PropTypes.shape({
    node_name: PropTypes.string,
    url: PropTypes.string,
  })).isRequired,
  loading: PropTypes.bool.isRequired,
  searchedNodes: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({}))).isRequired,
  selectedRows: PropTypes.arrayOf(PropTypes.string).isRequired,
  dispatch: PropTypes.func.isRequired,
}

export default NodeTableBody
