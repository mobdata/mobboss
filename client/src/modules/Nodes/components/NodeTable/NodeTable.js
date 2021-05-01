import React, { Component } from 'react'; // component rendering
import PropTypes from 'prop-types'; // proptype check
import shortid from 'shortid'; // create unique ids

import Typography from '@material-ui/core/Typography'; // text box
import Table from '@material-ui/core/Table'; // container component for react table
import TableCell from '@material-ui/core/TableCell'; // container component for cell of react table
import TableHead from '@material-ui/core/TableHead'; // header component for MUi table
import TableRow from '@material-ui/core/TableRow'; // contains row cells
import Checkbox from '@material-ui/core/Checkbox'; // component checkbox

import SearchRow from './SearchRow'
import NodeTableBody from './NodeTableBody'

import {
  selectNode, deselectNode, toggleSelectAll,
} from '../../actions'

// array of cell titles
const headerCells = [
  'Checkbox',
  'Name',
  'Server Up',
  'Ping',
  'CouchDb Up',
  'Replication',
  'Fully Synced',
  'Failed Streams',
]

class NodeTable extends Component {
  /*
    lifecycle function that updates component IFF
      - the number of node objects passed to this component changes
      - the number of selected rows changes
      - the array of searched nodes changes
      - if node property values change
  */
  shouldComponentUpdate(nextProps) {
    // assigns next props to variables in the form np<PropName>
    const {
      nodes: npNodes, selectedRows: npSelectedRows,
      searchedNodes: npSearchedNodes,
    } = nextProps

    // assigns current props to variables in the form this<PropName>
    const {
      nodes: thisNodes, selectedRows: thisSelectedRows,
      searchedNodes: thisSearchedNodes,
    } = this.props

    // update conditions
    if (npNodes.length !== thisNodes.length) {
      return true
    }
    if (npSelectedRows.length !== thisSelectedRows.length) {
      return true
    }
    if (npSearchedNodes !== thisSearchedNodes) {
      return true
    }

    /*
       Returns true if any node properties change
    */
    // Return the first node that differs, if any
    return nextProps.nodes.some((newNode) => (
      // Iterate through each property and filter the ones that differ

      Object.keys(newNode).filter((prop) => { // Ignore trivial properties
        if (prop !== 'average_response_ms'
          && prop !== 'message'
          && prop !== 'time'
        ) {
          // find this X property in old node by searching thisNodes array
          const oldNodeProp = thisNodes.find((node) => node.id === newNode.id)[prop]
          switch (prop) {
            case 'conflicts':// conflicts needs to be compared with strings otherwise can return a false true
              return JSON.stringify(newNode[prop]) !== JSON.stringify(oldNodeProp)
            case 'standard_deviation_ms':// ignores small deviations which causes all the noderows to be rerendered
              if (newNode[prop] > oldNodeProp) {
                return newNode[prop] > oldNodeProp + 0.01
              }
              if (newNode[prop] < oldNodeProp) {
                return newNode[prop] < oldNodeProp - 0.01
              }
              return newNode[prop] !== oldNodeProp
            default:
              return newNode[prop] !== oldNodeProp
          }
        }
        return false
      }).length
    ))
  }

  // function that handles output if selectall checkbox is clicked
  onSelectAll() {
    /* PROPS
       allSelected: boolean that indicates if allSelect is on/off
       dispatch: redux functions
       nodes: array of node data
       searchedNodes: array of nodes that fit search criteria, empty if search critera empty
    */
    const {
      allSelected, dispatch, nodes, searchedNodes, selectedRows,
    } = this.props

    // if search criteria have been applied, then select/deselect all nodes based on allSelected
    if (searchedNodes.length) {
      if (allSelected) {
        dispatch(toggleSelectAll())
        searchedNodes[0].forEach((node) => {
          dispatch(deselectNode(node.node_name))
        })
        return
      }

      dispatch(toggleSelectAll())
      searchedNodes[0].forEach((node) => {
        if (selectedRows.includes(node.node_name)) {
          return
        }
        dispatch(selectNode(node.node_name))
      })
    } else {
      /* if no search criteria have not been applied, s
         elect/deselect every node in the nodes array prop */
      if (allSelected) {
        dispatch(toggleSelectAll())
        nodes.forEach((node) => {
          dispatch(deselectNode(node.node_name))
        })
        return
      }

      dispatch(toggleSelectAll())
      nodes.forEach((node) => {
        if (selectedRows.includes(node.node_name)) {
          return
        }
        dispatch(selectNode(node.node_name))
      })
    }
  }

  render() {
    const {
      nodes, loading, selectedRows, searchedNodes, dispatch, allSelected,
    } = this.props

    return (
      <Table>
        <TableHead>
          <TableRow>
            {headerCells.map((column) => {
              if (column === 'Checkbox') {
                return (
                  <TableCell padding="default" key={shortid.generate()}>
                    <Checkbox
                      onClick={() => { this.onSelectAll() }}
                      checked={allSelected}
                    />
                  </TableCell>
                )
              }
              return (
                <TableCell // headers cells
                  padding="default"
                  tooltip={column}
                  key={shortid.generate()}
                >
                  <Typography // text of titles
                    variant="caption"
                    align="center"
                  >
                    {column}
                  </Typography>
                </TableCell>
              )
            }, this)}
          </TableRow>
          <SearchRow // contians UI for node column filters
            nodes={nodes}
            dispatch={dispatch}
            searchedNodes={searchedNodes}
          />
        </TableHead>
        { NodeTableBody({ // loads the cells of the table that contain node data
          headerCells, nodes, loading, selectedRows, searchedNodes, dispatch,
        }) }
      </Table>
    )
  }
}

NodeTable.propTypes = {
  nodes: PropTypes.arrayOf(
    PropTypes.shape({
      node_name: PropTypes.string,
      url: PropTypes.string,
    }),
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  selectedRows: PropTypes.arrayOf(PropTypes.string).isRequired,
  allSelected: PropTypes.bool.isRequired,
  searchedNodes: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({}))).isRequired,
  dispatch: PropTypes.func.isRequired,
}

export default NodeTable
