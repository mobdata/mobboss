/*
  class component that contains a row of table cells
  that allow you to sort NodeTable by column caterogy
*/
import React, { Component } from 'react'; // component rendering
import PropTypes from 'prop-types'; // prop typechecking
import { Dropdown } from 'semantic-ui-react' // expandable menu
import 'semantic-ui-css/semantic.min.css' // CSS styles
import TableCell from '@material-ui/core/TableCell'; // component for table cell
import TableRow from '@material-ui/core/TableRow'; // component for table row
import shortid from 'shortid'; // generates unique short id

import CheckCircleIcon from '@material-ui/icons/CheckCircle' // icon for green circle check
import ErrorIcon from '@material-ui/icons/Error' // icon for red error icon
import WifiIcon from '@material-ui/icons/Wifi' // incon, indicates wifi on
import WifiOffIcon from '@material-ui/icons/WifiOff' // icon, indicates wifi off
import WeekendIcon from '@material-ui/icons/Weekend' // icon used to represent couchdb connectivity

// redux functions
import {
  searchNodes, clearSearch,
} from '../../actions'

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

class SearchRow extends Component {
  constructor(props) {
    super(props);
    // state variables for tracking filters, when empty filter is not active
    this.state = {
      names: [],
      allDisable: false, // disables all sorting options
      statusDisable: false, /* disables select sorting options
                               iff server status is being sorted */
      streamDisable: false, /* disables select sorting options
                               iff failed streams status is being sorted */
      nameDisable: false, // disables select sorting options iff names are being sorted
      pings: '',
      servers: '',
      couchs: '',
      reps: '',
      syncs: '',
      fails: '',
    }
  }

    /* takes value and sets names filter to that value,
       then configures namedisable state based on value */
    handleNamesChange = (e, { value }) => {
      this.setState({ names: value });
      if (value.length && value !== undefined) {
        this.setState({
          nameDisable: true, servers: '', pings: '', couchs: '', reps: '', syncs: '', fails: '',
        })
      } else { this.setState({ nameDisable: false, statusDisable: false, streamDisable: false }) }
    }

    /* takes value and sets servers filter to that value,
       then configures streamDisable state based on value */
    handleServersChange = (e, { value }) => {
      this.setState({ servers: value });
      if (value !== undefined && value !== '') { this.setState({ statusDisable: true, pings: '', couchs: '' }) } else { this.setState({ statusDisable: false }) }
      if (value === 'Server down') {
        this.setState({
          streamDisable: true, pings: '', couchs: '', reps: '', syncs: '', fails: '',
        })
      } else { this.setState({ streamDisable: false }) }
    }

    // takes value and sets pings filter to that value
    handlePingsChange = (e, { value }) => this.setState({ pings: value })

    // takes value and sets couchdb filter to that value
    handleCouchsChange = (e, { value }) => this.setState({ couchs: value })

    // takes value and sets replication fails filter to that value
    handleRepsChange = (e, { value }) => this.setState({ reps: value })

    // takes value and sets num synced filter to that value
    handleSyncsChange = (e, { value }) => this.setState({ syncs: value })

    // takes value and sets num failed reps filter to that value
    handleFailsChange = (e, { value }) => this.setState({ fails: value })

    // searches rows for nodes meeting criteria of function parameters
    searchRows(names, servers, pings, couchs, reps, syncs, fails) {
      const { dispatch, nodes } = this.props
      const searchedNodes = nodes.reduce((result, node) => {
        // If a user searchs for a name then we assume the other parameters do not matter
        if (names !== undefined && names.length) {
          names.forEach((name) => {
            if (name === node.node_name) {
              result.push(node)
            }
          })
        } else {
          // Since our server status is a combination of app status and percent packet loss,
          // then it is impossible for the server to be up or down without both being similar values
          // Ex. If a user searchs for a ping down and a server up they will never find a match
          if (servers === 'Server up') {
            if (node.app_status !== 'up' && node.percent_packet_loss !== 0) {
              return result
            }
          }
          if (servers === 'Server down') {
            if ((node.app_status !== 'net_conn_down' || 'app_conn_down') && node.percent_packet_loss !== 100) {
              return result
            }
          }

          if (pings !== '' && pings !== undefined) {
            if (node.percent_packet_loss !== pings) {
              return result
            }
          }
          // Unfortunaly couch can report two diffrent errors for the same status,
          // therefore we can not use a single value to determine status
          if (couchs !== '' && couchs !== undefined) {
            if (couchs === 'net_conn_down') {
              if (!((node.app_status === 'net_conn_down')
              || (node.app_status === 'app_conn_down')
              || (node.app_status === null))) {
                return result
              }
            }
            if (couchs === 'up') {
              if (node.app_status !== couchs) {
                return result
              }
            }
          }

          // Similar situation with all of our stream info,
          // if the server status is down there will be no info avalible
          if (servers !== 'Server down') {
            if (reps !== '' && reps !== undefined) {
              if (reps === 'All succesful') {
                if (!((node.errored_reps == null || node.errored_reps === 0)
                            && (node.active_tasks === node.active_tasks_fully_synced)
                            && (node.triggered_reps <= node.active_tasks)
                            && (node.active_tasks !== null))) {
                  return result
                }
              }
              if (reps === 'Most succesful') {
                if (!(node.active_tasks_fully_synced < node.active_tasks
                            || (node.errored_reps < node.active_tasks && node.errored_reps > 0))) {
                  return result
                }
              }
              if (reps === 'Some succesful') {
                if (!(node.errored_reps >= node.active_tasks
                    && (node.triggered_reps <= node.active_tasks)
                    && node.errored_reps > 0 && node.active_tasks > 0)) {
                  return result
                }
              }
              if (reps === 'None succesful') {
                if (!(node.errored_reps > 0 && node.active_tasks === 0)) {
                  return result
                }
              }
            }
            if (syncs !== '' && syncs !== undefined) {
              if (syncs === '100%') {
                if (!(node.active_tasks_fully_synced === node.active_tasks
                    && (node.triggered_reps <= node.active_tasks)
                    && node.active_tasks_fully_synced !== null)) {
                  return result
                }
              }
              if (syncs === 'Less than 100%') {
                if (!(node.active_tasks_fully_synced < node.active_tasks
                    && (node.triggered_reps <= node.active_tasks)
                    && node.active_tasks_fully_synced !== null)) {
                  return result
                }
              }
            }
            if (fails !== '' && fails !== undefined) {
              if (fails === 'No failures') {
                if (!(node.errored_reps === 0 && (node.triggered_reps <= node.active_tasks)
                            && node.errored_reps !== null)) {
                  return result
                }
              }
              if (fails === 'Some failures') {
                if (!(node.active_tasks_fully_synced < node.active_tasks
                    || (node.errored_reps < node.active_tasks
                    && node.errored_reps > 0))) {
                  return result
                }
              }
              if (fails === 'Most failures') {
                if (!(node.errored_reps >= node.active_tasks
                    && (node.triggered_reps <= node.active_tasks)
                    && node.errored_reps > 0 && node.active_tasks > 0)) {
                  return result
                }
              }
              if (fails === 'All failures') {
                if (!(node.errored_reps > 0 && node.active_tasks === 0)) {
                  return result
                }
              }
            }
          }
          result.push(node)
        }
        return result
      }, []);
      dispatch(searchNodes(searchedNodes))
      this.setState({ allDisable: true })
    }

    // clears all filters, dispatches redux action to empty searchedNodes
    clearRows() {
      const { dispatch } = this.props

      this.setState({ names: [] })
      this.setState({ allDisable: false })
      this.setState({ statusDisable: false })
      this.setState({ streamDisable: false })
      this.setState({ nameDisable: false })
      this.setState({ pings: '' })
      this.setState({ servers: '' })
      this.setState({ couchs: '' })
      this.setState({ reps: '' })
      this.setState({ syncs: '' })
      this.setState({ fails: '' })

      dispatch(clearSearch())
    }

    render() {
      const {
        names, servers, pings, couchs, reps, syncs, fails,
        statusDisable, streamDisable, nameDisable, allDisable,
      } = this.state
      const {
        nodes, searchedNodes,
      } = this.props

      // options to filter by name
      const dropopt = nodes.map((node) => ({
        key: node.node_name,
        text: node.node_name,
        value: node.node_name,
      }))

      // options to filter by  server up/down column
      const serverUpOpt = [
        {
          key: 'Server up',
          text: 'Server up',
          icon: <CheckCircleIcon htmlColor="green" />,
          value: 'Server up',
        },
        {
          key: 'Server down',
          text: 'Server down',
          icon: <ErrorIcon htmlColor="red" />,
          value: 'Server down',
        },
      ]

      // outines options to filter by ping ping filters
      const pingOpt = [
        {
          key: 'Ping up',
          text: 'Ping up',
          icon: <WifiIcon htmlColor="green" />,
          value: 0,
        },
        {
          key: 'Ping down',
          text: 'Ping down',
          icon: <WifiOffIcon htmlColor="red" />,
          value: 100,
        },
      ]
      // options to filter couchdb connection filters
      const couchOpt = [
        {
          key: 'Couch up',
          text: 'Couch up',
          icon: <WeekendIcon htmlColor="green" />,
          value: 'up',
        },
        {
          key: 'Couch down',
          text: 'Couch down',
          icon: <WeekendIcon htmlColor="red" />,
          value: 'net_conn_down',
        },
      ]

      // options to filter replication tasks filters
      const repOpt = [
        {
          key: 'All succesful',
          text: 'All succesful',
          value: 'All succesful',
        },
        {
          key: 'Most succesful',
          text: 'Most succesful',
          value: 'Most succesful',
        },
        {
          key: 'Some succesful',
          text: 'Some succesful',
          value: 'Some succesful',
        },
        {
          key: 'None succesful',
          text: 'None succesful',
          value: 'None succesful',
        },
      ]

      // options to filter percent of documents syncd filters
      const syncOpt = [
        {
          key: '100%',
          text: '100%',
          value: '100%',
        },
        {
          key: 'Less than 100%',
          text: 'Less than 100%',
          value: 'Less than 100%',
        },
      ]

      // options to filter for task failures
      const failOpt = [
        {
          key: 'No failures',
          text: 'No failures',
          value: 'No failures',
        },
        {
          key: 'Some failures',
          text: 'Some failures',
          value: 'Some failures',
        },
        {
          key: 'Most failures',
          text: 'Most failures',
          value: 'Most failures',
        },
        {
          key: 'All failures',
          text: 'All failures',
          value: 'All failures',
        },
      ]

      return (
        <TableRow>
          {headerCells.map((column) => {
            if (column === 'Checkbox') {
              if (searchedNodes.length) {
                return (
                  <TableCell width="5%" key={shortid.generate()}>
                    <button type="button" onClick={() => this.clearRows()}>Clear</button>
                  </TableCell>
                )
              }
              return (
                /* eslint-disable */
                <TableCell width="5%" key={shortid.generate()}>
                  <button type="button" onClick={() => this.searchRows(names, servers, pings, couchs, reps, syncs, fails)}>
                    Search
                  </button>
                </TableCell>
              )/* eslint-disable */
            } if (column === 'Name') {
              return (
                <TableCell
                  width="15%"
                >
                  <Dropdown // sorts by name
                    onChange={this.handleNamesChange}
                    placeholder="Select node"
                    width="15%"
                    multiple
                    floating
                    disabled={allDisable}
                    search
                    selection
                    options={dropopt}
                    value={names}
                  />
                </TableCell>
              )
            } if (column === 'Server Up') {
              return (
                <TableCell
                  width="12%"
                >
                  <Dropdown // sorts by node connectivity status
                    onChange={this.handleServersChange}
                    placeholder="Select status"
                    fluid
                    clearable
                    selection
                    disabled={allDisable || nameDisable}
                    options={serverUpOpt}
                    value={servers}
                  />
                </TableCell>
              )
            } if (column === 'Ping') {
              return (
                <TableCell
                  width="12%"
                >
                  <Dropdown // sorts by packet loss
                    onChange={this.handlePingsChange}
                    placeholder="Select status"
                    fluid
                    clearable
                    disabled={statusDisable || allDisable || nameDisable}
                    selection
                    options={pingOpt}
                    value={pings}
                  />
                </TableCell>
              )
            } if (column === 'CouchDb Up') {
              return (
                <TableCell // cell that contains menu
                  width="12%"
                >
                  <Dropdown // sortys by couchdb status
                    onChange={this.handleCouchsChange}
                    placeholder="Select status"
                    fluid
                    clearable
                    disabled={statusDisable || allDisable || nameDisable}
                    selection
                    options={couchOpt}
                    value={couchs}
                  />
                </TableCell>
              )
            } if (column === 'Replication') {
              return (
                <TableCell // cell that contains menu
                  width="12%"
                >
                  <Dropdown // drop don menu to sort by # of replication tasks
                    onChange={this.handleRepsChange}
                    placeholder="Select status"
                    fluid
                    clearable
                    selection
                    disabled={streamDisable || allDisable || nameDisable}
                    options={repOpt}
                    value={reps}
                  />
                </TableCell>
              )
            } if (column === 'Fully Synced') {
              return (
                <TableCell
                  width="12%"
                >
                  <Dropdown //drop down menu to sort by pct of tasks syncd
                    onChange={this.handleSyncsChange}
                    placeholder="Select status"
                    fluid
                    clearable
                    selection
                    disabled={streamDisable || allDisable || nameDisable}
                    options={syncOpt}
                    value={syncs}
                  />
                </TableCell>
              )
            } if (column === 'Failed Streams') {
              return (
                <TableCell
                  width="12%"
                >
                  <Dropdown // sorts by # of failed doc replications
                    onChange={this.handleFailsChange}
                    placeholder="Select status"
                    fluid
                    clearable
                    selection
                    disabled={streamDisable || allDisable || nameDisable}
                    options={failOpt}
                    value={fails}
                  />
                </TableCell>
              )
            }
            return (
              <TableCell
                padding="default"
                tooltip={column}
                key={shortid.generate()}
              >
                <Dropdown // place holder, in case of no recognized column name
                  placeholder="Select status"
                />
              </TableCell>
            )
          }, this)}
        </TableRow>
      )
    }
}

SearchRow.propTypes = {
  nodes: PropTypes.arrayOf(
    PropTypes.shape({
      node_name: PropTypes.string,
      url: PropTypes.string,
    }),
  ).isRequired,
  dispatch: PropTypes.func.isRequired,
  searchedNodes: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({}))).isRequired,
}
export default SearchRow
