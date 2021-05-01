/*
  Dialog box for node info that opens on Node Selection
*/
import React, { Component } from 'react' // react rendering
import PropTypes from 'prop-types' // prop typechecks
import Card from '@material-ui/core/Card' // Container component
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Collapsible from 'react-collapsible' // hides/expands text
import NodeInfoItemSub from './NodeInfoItemSub' // displays document transfer data
import NodeSparkline from '../NodeSparkline' // dTODO: isplays
import callApi from '../../../../util/apiCaller'
import './NodeInfo.css'

// Styles for CardHeader component
const styles = {
  cardHeader: {
    padding: '5px',
  },
}

// eslint-disable-next-line react/prefer-stateless-function
class NodeInfoItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      active: {}, // array of active tasks
      completed: {}, // array of completed tasks
      historicData: [], // array of node network data
    }
  }

  // gets Node data when component mounts
  componentDidMount() {
    this.getData()
  }

  // Uses API call to set initial state values
  async getData() {
    const { node } = this.props
    /* sets state for number of tasks active/completed if call was successful */
    const { targets } = (await callApi(`nodes/stats/completed?node=${node.node_name}`)).json
    if (targets !== null && targets !== undefined) {
      this.setState({ active: targets.active })
      this.setState({ completed: targets.completed })
    }

    /* sets state for historic data if */
    const { json } = await callApi(`nodes/stats/status?node=${node.node_name}`)
    if (json !== null && json !== undefined && json.filteredStats !== null
      && this.state.historicData !== json.filteredStats) {
      this.setState({ historicData: json.filteredStats })
    }
  }

  render() {
    const { node: propsNode } = this.props // the node the be parsed
    const { historicData } = this.state // will contain historic data of prop node
    const { active } = this.state // active tasks of prop node
    const { completed } = this.state // completed tasks of prop node

    /*
       assigning enum properties of the prop node to local variables
    */
    const {
      docs_written: docsWritten,
      total_docs: totalDocs,
      node_name: nodeName,
      errored_reps: failedTasks,
      triggered_reps: triggeredReps,
      active_tasks: activeTasks,
      percent_packet_loss: percentPacketLoss,
      unsynced_targets: unsyncedTargets,
      failing_targets: failingTargets,
    } = propsNode
    const docs = `(${docsWritten} of ${totalDocs} docs transferred)`
    const totalReps = failedTasks + triggeredReps
    let subtitleText // string for displaying number of tasks failed
    let loading // boolean for tracking if all tasks requests were received

    if (triggeredReps > activeTasks) {
      loading = true
    } else {
      loading = false
    }

    if (percentPacketLoss === 100) {
      subtitleText = 'Node is unreachable'
    } else {
      subtitleText = failedTasks > 0
        ? `${failedTasks} of ${totalReps} tasks failing 
        ${docs}`
        : `No tasks failed
         ${docs}`
    }

    /*
       the following code
       parses through active, completed, and failed document transfers and creates strings
       that track the number of each type of process for the prop Node
    */

    const activeTargetsArray = []
    if (typeof active !== 'undefined' && active !== null && active.length > 0) {
      active.forEach((element) => {
        const activeSplit = element.replace('"', '').replace('/"', '/').split(':')
        if (activeSplit[2] === '1') {
          activeTargetsArray.push(`${activeSplit[0]}:${activeSplit[1]}: ${activeSplit[2]} process`)
        } else {
          activeTargetsArray.push(`${activeSplit[0]}:${activeSplit[1]}: ${activeSplit[2]} processes`)
        }
      })
    }

    const completedTargetsArray = []
    if (typeof completed !== 'undefined' && completed !== null && completed.length > 0) {
      completed.forEach((element) => {
        const completedSplit = element.replace('"', '').replace('/"', '/').split(':')
        if (completedSplit[2] === '1') {
          completedTargetsArray.push(`${completedSplit[0]}:${completedSplit[1]}: ${completedSplit[2]} process`)
        } else {
          completedTargetsArray.push(`${completedSplit[0]}:${completedSplit[1]}: ${completedSplit[2]} processes`)
        }
      })
    }

    const failingTargetsArray = []
    if (typeof failingTargets !== 'undefined' && failingTargets !== null) {
      const parsedFailing = JSON.parse(failingTargets)
      Object.keys(parsedFailing).forEach((element) => {
        if (parsedFailing[element] === 1) {
          failingTargetsArray.push(`${element}: ${parsedFailing[element]} process`)
        } else {
          failingTargetsArray.push(`${element}: ${parsedFailing[element]} processes`)
        }
      })
    }

    const unsyncedTargetsArray = []
    if (typeof unsyncedTargets !== 'undefined' && unsyncedTargets !== null) {
      const parsedUnsynced = JSON.parse(unsyncedTargets)
      Object.keys(parsedUnsynced).forEach((element) => {
        if (parsedUnsynced[element] === 1) {
          unsyncedTargetsArray.push(`${element}: ${parsedUnsynced[element]} process`)
        } else {
          unsyncedTargetsArray.push(`${element}: ${parsedUnsynced[element]} processes`)
        }
      })
    }

    // Strings only display in dialog box if length > 0
    const FailedText = `Failed processes: ${failedTasks}`
    const ActiveText = `Active processes: ${activeTargetsArray.length}`
    const CompletedText = `Completed processes: ${completedTargetsArray.length}`

    /*
    COMPONENTS
    Card: Container that displays info for the Prop Node
    CardHeader: Displays name of Node
    CardContent: Divider for different child components inside of Card
    Collapsible: number of <type of document transfer>(failed, active, completed),
                 allows NodeInfoItemSub to be displayed/hidden
    NodeInfoItemSub:  list of servers with
  */
    return (
      <Card raised>
        {loading && (
        <CardHeader
          title={nodeName}
          style={styles.cardHeader}
        />
        )}
        {!loading && (
        <CardHeader
          title={nodeName}
          subheader={subtitleText}
          style={styles.cardHeader}
        />
        )}
        {loading && <CardContent>Loading new data...</CardContent>}
        {!loading && (
        <CardContent>
          { activeTargetsArray.length > 0 && (
          <Collapsible classParentString="Collapsible--info" trigger={ActiveText}>
            <NodeInfoItemSub subheaderText="Servers with active processes: " list={activeTargetsArray} />
          </Collapsible>
          )}
          { completedTargetsArray.length > 0 && (
          <Collapsible classParentString="Collapsible--info" trigger={CompletedText}>
            <NodeInfoItemSub subheaderText="Servers with completed processes: " list={completedTargetsArray} />
          </Collapsible>
          )}
          {unsyncedTargetsArray.length > 0 && (
          <Collapsible classParentString="Collapsible--info" trigger="Unsynced Servers">
            <NodeInfoItemSub subheaderText="Servers not fully synced: " list={unsyncedTargetsArray} />
          </Collapsible>
          )}
          {typeof failedTasks === 'number' && failedTasks > 0 && (
          <Collapsible classParentString="Collapsible--info" trigger={FailedText}>
            <NodeInfoItemSub subheaderText="Servers with failed processes: " list={failingTargetsArray} />
          </Collapsible>
          )}
          <p>Recent status:</p>
          {typeof historicData !== 'undefined' && (<NodeSparkline historicData={historicData} />)}
        </CardContent>
        )}

      </Card>
    )
  }
}

NodeInfoItem.propTypes = {
  node: PropTypes.shape({
    url: PropTypes.string.isRequired,
    node_name: PropTypes.string.isRequired,
    errored_reps: PropTypes.number,
    triggered_documents: PropTypes.number,
    active_tasks: PropTypes.number,
    message: PropTypes.string,
    percent_packet_loss: PropTypes.number.isRequired,
    unsynced_targets: PropTypes.string,
    failing_targets: PropTypes.string,
  }).isRequired,
}

export default NodeInfoItem
