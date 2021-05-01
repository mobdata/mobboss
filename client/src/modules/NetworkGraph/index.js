import React, { Component } from 'react' // basic building block of react app
import PropTypes from 'prop-types' // prop type checking
import { connect } from 'react-redux' //
import Graph from 'react-graph-vis' // component to display network graphs
import {
  fetchNodeGraph,
  showNodeProps,
  createGroupsList,
  findAllNeighbors,
  getSubgraphByDB,
  generateEdgesWithLengths,
} from './actions'
import ViewSelector from './components/ViewSelector/ViewSelector' // custom component for configuring graph settings
import NodeDisplay from './components/NodeDisplay/NodeDisplay' // custom conmponent for displaying node info
import LoopGraph from './components/LoopGraph/LoopGraph' // custom component for displaying loop graph

class NetworkGraph extends Component {
  // eslint-disable-next-line
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    nodeGraph: PropTypes.shape({
      nodes: PropTypes.arrayOf(PropTypes.shape({})),
      edges: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    filterdb: PropTypes.string,
    filtergroup: PropTypes.string,
    secondgroup: PropTypes.string,
    selection: PropTypes.string,
    openLoopGraph: PropTypes.bool,
    displayType: PropTypes.string,
  }
  // eslint-disable-next-line
  static defaultProps = {
    nodeGraph: {
      nodes: [],
      edges: [],
    },
    filterdb: '',
    filtergroup: '',
    secondgroup: '',
    selection: '',
    openLoopGraph: false,
    displayType: 'LoopsWithNeighbors',
  }
  // eslint-disable-next-line
  UNSAFE_componentWillMount() {
    // call function that maps CouchDB data to appropriate graph shape
    const { dispatch } = this.props
    // TODO Gotta make this function so we actually get data!
    dispatch(fetchNodeGraph())
  }

  // TODO Possibly offload some of this processing to .actions, increase reusability

  // Show subgraph from one node, either just contacts list or aggregate of all its dbs
  filterEdges = (attribute, value) => this.props.nodeGraph.edges
    .filter((edge) => edge[attribute] === value)

  // helper color converter to get rgb
  HSVtoRGB = (h, s, v) => {
    let r; let g; let b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: [r, g, b] = [v, t, p]; break;
      case 1: [r, g, b] = [q, v, p]; break;
      case 2: [r, g, b] = [p, v, t]; break;
      case 3: [r, g, b] = [p, q, v]; break;
      case 4: [r, g, b] = [t, p, v]; break;
      case 5: [r, g, b] = [v, p, q]; break;
      default: [r, g, b] = [1, 0.9, 0.5]; break;
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  // Color code nodes based on specified category
  // ! Constants in here are pretty optimized for readability, staying in bounds
  mapGroupsToColors = (rawgroups) => {
    // * turn the groups list into equally spaced colors
    // enforce one or two groups
    const groups = Array.isArray(rawgroups[0]) ? rawgroups : [rawgroups]
    // declare constants and define hue-step
    const v = 0.99
    const s = 0.3
    const n = groups[0].length
    const mainstep = Number((1.0 / (n)).toPrecision(3))
    const init = -mainstep

    // generate HSV array and assign to group names
    const colorArray = []
    for (let i = 1; i <= groups[0].length; i += 1) {
      const h = i * mainstep + init
      const id = groups[0][i - 1]
      if (groups[1][0] !== 'undefined' && groups[1].length >= 1) {
        const satstep = 0.45 / (groups[1].length)
        const substep = mainstep / (3 + groups[1].length)
        for (let j = 0; j < groups[1].length; j += 1) {
          const id2 = `${id}-${groups[1][j]}`
          // eslint-disable-next-line
          const rgb = this.HSVtoRGB(h + (substep * j), s + (j * satstep), v - (j * substep / n))
          colorArray.push({ [id2]: { color: `rgb(${rgb.r},${rgb.g},${rgb.b})` } })
        }
      } else {
        const rgb = this.HSVtoRGB(h, (-0.1 * h) + s + 0.1, v)
        colorArray.push({ [id]: { color: `rgb(${rgb.r},${rgb.g},${rgb.b})` } })
      }
    }

    return colorArray.reduce((acc, cur) => ({ ...acc, ...cur }), {})
  }

  // define edge lengths from edge count and possible grouping property
  // ! DON'T MESS WITH THE CONSTANTS IN HERE THEY WORK AMAZINGLY
  generateEdgesWithLengths = (graph) => {
    let filter = false
    const { edges } = graph
    const keys = graph.nodes.reduce((acc, cur) => ([...acc, ...Object.keys(cur.attributes)]), [])
    if (keys.includes('region')) filter = 'region'
    return graph.edges.map((edge) => {
      const { from, to } = edge
      let baseLength = 3
      if (filter) {
        const nodes = this.nodesFromIds([from, to])
        baseLength = (nodes[0].attributes[filter] === nodes[1].attributes[filter] ? 3 : 4)
      }
      const weight = (
        this.findAllNeighbors(from, edges).length + this.findAllNeighbors(to, edges).length + 20
      )
      return { ...edge, length: weight * baseLength }
    })
  }

  // TODO Change line color based on whether replication is synced, ongoing, or halted

  // If we're really interested, add a few view controls from our list
  displaySelection = (values, id, selected) => {
    const { dispatch } = this.props
    // eslint-disable-next-line no-param-reassign
    values.borderWidth = 4
    if (selected) dispatch(showNodeProps(id))
  }

  render() {
    // relevant props
    const {
      nodeGraph, filterdb, dispatch, selection, filtergroup, secondgroup,
      openLoopGraph, displayType,
    } = this.props
    const dbs = nodeGraph.edges.map((edge) => edge.db).filter((db, i, arr) => i === arr.indexOf(db))

    const nonTreeDbs = dbs.filter((db) => {
      const subgraph = getSubgraphByDB(nodeGraph, db)
      return (subgraph.edges.length >= subgraph.nodes.length)
    })
    const warning = nonTreeDbs[0] ? `WARNING! The following databases were found to have loops in their network: ${nonTreeDbs.join(', ')}. \n\n Loops in a replication network increase the risk of conflict; consider structuring your replication differently.` : ''
    // TODO Placeholder attributes for our very well behaved test data
    const attributes = nodeGraph.nodes.map((node) => Object.keys(node.attributes))[0] || []
    let groups = createGroupsList(nodeGraph, filtergroup)
    let secondgroups = createGroupsList(nodeGraph, secondgroup)

    if (filtergroup === '' && secondgroup !== '') {
      groups = ['undefined']
      secondgroups = []
    }

    // checking whether or not to render the full graph or a subgraph
    let graphPre = nodeGraph
    if (typeof filterdb === 'string' && filterdb !== '') {
      graphPre = getSubgraphByDB(nodeGraph, filterdb)
    }

    // reformatting the graph to the props used by our graphing library
    const graph = {
      nodes: graphPre.nodes.map((node) => {
        const group = (secondgroup !== '' && filtergroup !== '') ? `${node.attributes[filtergroup]}-${node.attributes[secondgroup]}` : `${node.attributes[filtergroup]}`
        return {
          id: node.name,
          label: node.name,
          title: node.dbs.join(', '),
          attributes: node.attributes,
          group,
          shape: (findAllNeighbors(node.name, graphPre.edges).length > 1 ? 'box' : 'triangle'),
          size: (findAllNeighbors(node.name, graphPre.edges).length * 2 + 5),
        }
      }),
      edges: generateEdgesWithLengths(graphPre),
    }

    // all of the graph options. Covers color and methods for rendering the nodes' positions
    const gravity = graph.nodes.length > (graph.edges.length + 1) ? 0.05 : 0.02
    const colorArray = this.mapGroupsToColors([groups.sort(), secondgroups.sort()])

    const options = {
      layout: {
        improvedLayout: true,
      },
      /* edges: {
        color: '#022222',
      }, */
      physics: {
        // ! DONT CHANGE PHYSICS CONSTANTS THESE ARE VERY OPTIMIZED
        forceAtlas2Based: {
          gravitationalConstant: -450,
          centralGravity: gravity,
          damping: 0.95,
          springConstant: 0.2,
          avoidOverlap: 0.9,
        },
        timestep: 0.3,
        solver: 'forceAtlas2Based',
        maxVelocity: 1000,
        minVelocity: 10,
      },
      nodes: {
        chosen: {
          node: this.displaySelection,
        },
        borderWidth: 2,
      },
      groups: colorArray,
    }

    // pass on the selected node to display or generate a placeholder for the code.
    let selected = graph.nodes.find((node) => node.id === selection)
    if (typeof selected === 'undefined') selected = {}
    selected = {
      ...selected,
      Neighbors: findAllNeighbors(selection, graph.edges).join(', '),
    }
    // let loading = false
    /* if (loading) {
      return (
        <div style={{
          width: '75%', height: 1000, padding: 10, float: 'left',
        }}
        >
          <div width="100%" align="center">
            <ReactLoading type="spinningBubbles" color="gray"
            style={{ align: 'center', height: '10%', width: '10%' }} />
          </div>
        </div>
      )
    } */
    return (
      <div>
        <div
          // onLoad
          style={{
            width: '75%', height: 1000, padding: 10, float: 'left',
          }}
        >
          <Graph
            graph={graph}
            options={options}
            style={{ width: '100%', height: '60%' }}
          />
          <NodeDisplay selected={selected} /* displays info on selected node */ />
        </div>
        <div style={{
          width: '20%', height: '100%', padding: 25, float: 'right',
        }}
        >
          <ViewSelector // changes settings for network graph
            dbs={dbs}
            filterdb={filterdb}
            dispatch={dispatch}
            filtergroup={filtergroup}
            secondgroup={secondgroup}
            attributes={attributes}
            colorArray={colorArray}
            warning={warning}
          />
        </div>
        <LoopGraph // generates adv tools graph onClick of "examine loop button"
          open={openLoopGraph}
          graph={graph}
          message={warning}
          options={options}
          dbs={dbs}
          dispatch={dispatch}
          colorArray={colorArray}
          attributes={attributes}
          filtergroup={filtergroup}
          secondgroup={secondgroup}
          selected={selected}
          displayType={displayType}
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  nodeGraph: state.graph.nodeGraph,
  filterdb: state.graph.filterdb,
  filtergroup: state.graph.filtergroup,
  secondgroup: state.graph.secondgroup,
  selection: state.graph.selection,
  dispatch: state.dispatch,
  openLoopGraph: state.graph.open,
  displayType: state.graph.displayType,
})

export default connect(mapStateToProps)(NetworkGraph)
