/*
    custom component that allows user to examine loops in nodeGraph
*/
import React from 'react' // basic react rendering
import PropTypes from 'prop-types' // checks type of props
import Graph from 'react-graph-vis' // network graph for react
import {
  Dialog, Button, Divider, DialogActions, List,
  FormControl, Select, MenuItem, ListItem, ListSubheader,
} from '@material-ui/core' // material ui components
import ViewSelector from '../ViewSelector/ViewSelector' // custom filtering component
import {
  closeLoopGraph, trimToLoops, loopsWithNeighbors,
  changeAltDisplay, removableLoopEdges, identifyLoops, // checkConnected,
} from '../../actions'
import NodeDisplay from '../NodeDisplay/NodeDisplay' // custom display selected node

const LoopGraph = (props) => {
  const {
    graph, // import graph from NetworkGraph component
    message, // for view selector
    open, // boolean, is this dialog open/closed
    options, // react Graph settings
    dbs, // for view selector
    dispatch, // links this redux store
    colorArray, // array of colors used to make this graph
    attributes, // attributes of these nodes
    filtergroup, // for view selector
    secondgroup, // for view selector
    selected, // for node display, contains attributes about selected nodes
    displayType, // determines type of graph
  } = props

  if (!open) return null

  // dispatches action to close this component
  const onClose = () => {
    dispatch(closeLoopGraph())
  }

  const filterdb = 'false'

  // Any time you add a new type of loop structure, create a new switch case assigning newgraph
  let newgraph
  if (open) {
    /*
        change newGraph variable to match desired loop to be examined
    */
    const loops = identifyLoops(trimToLoops(graph))
      .sort((a, b) => (a.nodes.length < b.nodes.length ? 1 : -1))
    switch (displayType) {
      case 'Connected_Loops':
        newgraph = trimToLoops(graph)
        break
      case 'Loops_With_Neighbors':
        newgraph = loopsWithNeighbors(graph)
        break
      case 'Separated_Loops':
        // eslint-disable-next-line prefer-destructuring
        if (loops[0] !== undefined) {
          [newgraph] = loops
        }
        newgraph = loopsWithNeighbors(graph)
        break
      default:
        newgraph = loopsWithNeighbors(graph)
        break
    }
    // ! Just a place for checking if it's connected, most convenient spot while testing
    // console.log(checkConnected(newgraph))
  }
  const badEdges = removableLoopEdges(graph)
  newgraph = {
    nodes: newgraph.nodes,
    edges: newgraph.edges.map((edge) => {
      if (badEdges.map((bad) => bad.id).includes(edge.id)) {
        return {
          ...edge,
          color: '#BB0000',
          shadow: {
            enabled: true,
            color: 'rgba(255,10,10,0.9)',
            size: 22,
          },
        }
      }
      return edge
    }),
  }
  // this should contain all the switch cases
  const actions = ['Connected_Loops', 'Loops_With_Neighbors', 'Separated_Loops']

  const onChangeView = (e) => {
    dispatch(changeAltDisplay(e.target.value))
  }

  // ! Annoying bug? I can't figure out how to make the initial state be properly sized
  const altViewList = (
    <FormControl variant="standard" fullWidth>
      <Select value={displayType} onChange={onChangeView} autoWidth>
        {actions.map((action) => (
          <MenuItem value={action} key={action}>{action.split('_').join(' ')}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )

  return (
    <Dialog open={open} fullWidth maxWidth="xl" onBackdropClick={onClose}>
      <div>
        <div style={{
          width: '70%', height: 1000, padding: 10, float: 'left',
        }}
        >
          <Graph // graph of loops
            graph={newgraph}
            options={options}
            style={{ width: '100%', height: '60%' }}
          />
          <NodeDisplay // displays info about selected node
            selected={selected}
          />
        </div>
        <div style={{
          width: '20%', height: '100%', padding: 25, float: 'right',
        }}
        >
          <List>
            <ListSubheader>Choose a different view of the graph</ListSubheader>
            <ListItem width="100%">
              {altViewList}
            </ListItem>
          </List>
          <div style={{ height: 15 }} />
          <ViewSelector
            dbs={dbs}
            filterdb={filterdb}
            dispatch={dispatch}
            filtergroup={filtergroup}
            secondgroup={secondgroup}
            attributes={attributes}
            colorArray={colorArray}
            warning={message}
          />
        </div>
      </div>
      <Divider />
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

LoopGraph.propTypes = {
  graph: PropTypes.shape({}).isRequired,
  message: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  dbs: PropTypes.arrayOf(PropTypes.string).isRequired,
  dispatch: PropTypes.func.isRequired,
  options: PropTypes.shape({}).isRequired,
  colorArray: PropTypes.shape({}).isRequired,
  attributes: PropTypes.arrayOf(PropTypes.string).isRequired,
  filtergroup: PropTypes.string.isRequired,
  secondgroup: PropTypes.string.isRequired,
  selected: PropTypes.shape({}).isRequired,
  displayType: PropTypes.string.isRequired,
}

export default LoopGraph
