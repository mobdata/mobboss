/*
  class component that creates cell within node row
*/
import React, { Component } from 'react' // Component rendering
import PropTypes from 'prop-types' // prop checking
import ReactLoading from 'react-loading' // loading animations

import CheckCircleIcon from '@material-ui/icons/CheckCircle' // green circle check icon
import WarningIcon from '@material-ui/icons/Warning' // orange triangle (!) icon
import ErrorIcon from '@material-ui/icons/Error' // red circle (!) icon
import IconButton from '@material-ui/core/IconButton' // icon with event listener
import TableCell from '@material-ui/core/TableCell' // table cell container
import Checkbox from '@material-ui/core/Checkbox' // interactable checkbox component
import Tooltip from '@material-ui/core/Tooltip' // component for tooltip onEvent
import WifiIcon from '@material-ui/icons/Wifi' // green wifi icon
import WifiOffIcon from '@material-ui/icons/WifiOff' // red wifi icon
import WeekendIcon from '@material-ui/icons/Weekend'; // couch icon

// Action imports
import {
  selectNode, deselectNode,
} from '../../actions'

class NodeCell extends Component {
  // Function that dispatches action on row selection
  onRowSelection(nodeName) {
    const { dispatch, selectedRows } = this.props

    if (selectedRows.includes(nodeName)) {
      dispatch(deselectNode(nodeName))
      return
    }
    dispatch(selectNode(nodeName))
  }

  render() {
    /* PROPS
      column: indicates which type of cell to return
      node:   structure that contains network data for node in the current row
      selected: boolean that indicates whether or not node is selected */
    const {
      column, node, selected,
    } = this.props

    // assigning this.props.node.children to local variables
    const {
      active_tasks: activeTasks,
      active_tasks_fully_synced: activeTasksFullySynced,
      errored_reps: erroredReps,
      percent_packet_loss: percentPacketsLost,
      app_status: appStatus,
      triggered_reps: triggeredReps,
    } = node

    // initializing variables for differnt type of node cells
    let icon
    let percent
    let toolTip = ''

    switch (column) {
      case 'Checkbox': // type of table cell that displays checkbox
        return (
          <TableCell // container for click triggers row selection
            padding="default"
            onClick={() => this.onRowSelection(node.node_name)}
          >
            <Checkbox // check flips on/off onRowSelection
              checked={selected}
            />
          </TableCell>
        )
      case 'Name': // type of table cell that displays node name, 2nd column
        if (appStatus === 'up') {
          return (
            <TableCell
              onClick={() => this.onRowSelection(node.node_name)}
            >
              <a href={`https://${node.url}/mobnode`}>{node.node_name}</a>
            </TableCell>
          )
        }
        return (/* eslint-disable */
          <TableCell
            onClick={() => this.onRowSelection(node.node_name)}
          >
            <font color="red" toolTip="Node offline">{node.node_name}</font>
          </TableCell>
          //<a href="#">{node.node_name}</a>
          )/* eslint-disable */
      case 'Server Up': // type of table cell that indicates noder server status(up/down/other)
        if (percentPacketsLost === 100 || appStatus === 'net_conn_down') {
          icon = (<ErrorIcon htmlColor="red" />)// red icon if packets lost and connection down
        } else if (percentPacketsLost === 0 && appStatus === 'app_conn_down') {
          icon = (<WarningIcon htmlColor="orange" />) //orange icon if 0 packers lost and connection down
        } else if (percentPacketsLost === 0 && appStatus === 'up') { // green if 0 packets ost and conn up
          icon = (<CheckCircleIcon htmlColor="green" />) 
        } else if (percentPacketsLost === 0 && appStatus === null) { // orange icon if 0 packets lost and connection is null
          icon = (<WarningIcon htmlColor="orange" />)
        } else {                                       // default: no icon
          icon = null
        }
        break
      case 'Ping': // type of cell that indicates percent of packets lost from node
        if (percentPacketsLost === 100) { // red icon if 100 percent packet loss
          icon = (<WifiOffIcon htmlColor="red" />)
        } else if (percentPacketsLost === 0) {
          icon = (<WifiIcon htmlColor="green" />) // green icon if 0 percent packet loss
        } else {
          icon = null // default: no icon
        }
        break
      case 'CouchDb Up': // type of node cell that indicates couchdb connectivity status
        if (appStatus === 'app_conn_down' || appStatus === 'net_conn_down' || appStatus === null) {
          icon = (<WeekendIcon htmlColor="red" />)
          toolTip = 'Application connection fails'
        } else if (appStatus === 'up') {
          icon = (<WeekendIcon htmlColor="green" />)
        } else {
          icon = null
        }
        break
      case 'Replication': //type of table cell that indicates how many tasks are currently replicating
        // Show nothing
        if (erroredReps == null && activeTasks == null) {
          icon = null
          toolTip = 'Error retrieving data'
        // Show GREEN
        } else if ((erroredReps == null || erroredReps === 0)
        && (activeTasks === activeTasksFullySynced)
        && (triggeredReps <= activeTasks)) {
          icon = (<font color="green">{ activeTasks }</font>)
          toolTip = 'All tasks currently replicating'
        // Show YELLOW
        } else if (activeTasksFullySynced < activeTasks
          || (erroredReps < activeTasks && erroredReps > 0)) {
          icon = (<font color="orange">{ activeTasks }</font>)
          toolTip = 'Some tasks currently replicating'
        // Show RED
        } else if (erroredReps >= activeTasks && (triggeredReps <= activeTasks)) {
          icon = (<font color="red">{ activeTasks }</font>)
          toolTip = 'Few tasks currently replicating'
        // Show nothing
        } else {
          icon = (<ReactLoading type="spinningBubbles" color="gray" style={{ align: 'center', height: '20px', width: '20px' }} />)
          toolTip = 'Loading new data'
        }
        break
      case 'Fully Synced': // type of cell that indidates percent of tasks that are fully synced
        // Show nothing
        if (activeTasks == null || activeTasksFullySynced == null) {
          icon = null
          toolTip = 'Error retrieving data'
        // Show GREEN
        } else if (activeTasksFullySynced === activeTasks && (triggeredReps <= activeTasks)) {
          icon = (<font color="green">100%</font>)
          toolTip = 'All active tasks are fully synced'
        // Show YELLOW
        } else if (activeTasksFullySynced < activeTasks) {
          percent = (activeTasksFullySynced / activeTasks) * 100
          icon = (<font color="yellow">{ percent }</font>)
          toolTip = 'Not all active tasks are fully synced'
        // Show nothing
        } else {
          icon = (<ReactLoading type="spinningBubbles" color="gray" style={{ align: 'center', height: '20px', width: '20px' }} />)
          toolTip = 'Loading new data'
        }
        break
      case 'Failed Streams': // type of cell that indicates the number of failed streams
        // Show nothing
        if (erroredReps == null) {
          icon = null
          toolTip = 'Error retrieving data'
        // Show GREEN
        } else if (erroredReps === 0 && (triggeredReps <= activeTasks)) {
          icon = (<font color="green">{ erroredReps }</font>)
          toolTip = 'There are no errors replicatings'
        // Show RED
        } else if (erroredReps > 0 && (triggeredReps <= activeTasks)) {
          icon = (<font color="red">{ erroredReps }</font>)
          toolTip = 'There are errors when replicating'
        // Show nothing
        } else {
          icon = (<ReactLoading type="spinningBubbles" color="gray" style={{ align: 'center', height: '20px', width: '20px' }} />)
          toolTip = 'Loading new data'
        }
        break

      default:
        break
    }


    return (
      <TableCell // generic node cell container
        padding="default"
        onClick={() => this.onRowSelection(node.node_name)}
      >
        <Tooltip // container that displays data on hover
          title={toolTip}
        >
          <IconButton // icon that performs action onEvent
            style={{ overflow: 'visible' }}
          >
            {icon}
          </IconButton>
        </Tooltip>
      </TableCell>
    )
  }
}

NodeCell.propTypes = {
  column: PropTypes.string.isRequired,
  node: PropTypes.shape({
    node_name: PropTypes.string,
    url: PropTypes.string,
    errored_reps: PropTypes.number,
    active_tasks: PropTypes.number,
    active_tasks_fully_synced: PropTypes.number,
    percent_packet_loss: PropTypes.number,
    app_status: PropTypes.string,
    triggered_reps: PropTypes.number,
    conflicts: PropTypes.shape({
      total: PropTypes.number,
    }),
  }).isRequired,
  selectedRows: PropTypes.arrayOf(PropTypes.string).isRequired,
  dispatch: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
}

export default NodeCell
