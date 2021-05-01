import callApi from '../../../util/apiCaller'

export const GET_NODE_GRAPH = 'GET_NODE_GRAPH'
export const VIEW_SUB_GRAPH = 'VIEW_SUB_GRAPH'
export const CHANGE_NODE_GROUP = 'CHANGE_NODE_GROUP'
export const SHOW_NODE_PROPS = 'SHOW_NODE_PROPS'
export const TOGGLE_LOOP_GRAPH = 'TOGGLE_LOOP_GRAPH'
export const CHANGE_ALT_DISPLAY = 'CHANGE_ALT_DISPLAY'

/*
  react functions that facilitate changes to redux state on NetworkGraph page
*/
export function getNodeGraph(nodeGraph) {
  // process nodes from db into right graph shape
  return {
    type: GET_NODE_GRAPH,
    nodeGraph,
  }
}

export function viewSubGraph(db) {
  return {
    type: VIEW_SUB_GRAPH,
    db,
  }
}

// Add checks to handle weird group behavior
export function changeNodeGroup(group, layer) {
  return {
    type: CHANGE_NODE_GROUP,
    group,
    layer,
  }
}

export function showNodeProps(node) {
  const name = (typeof node === 'string' ? node : node.id)
  return {
    type: SHOW_NODE_PROPS,
    name,
  }
}

export function changeAltDisplay(displayType) {
  return {
    type: CHANGE_ALT_DISPLAY,
    displayType,
  }
}

export function openLoopGraph() {
  return {
    type: TOGGLE_LOOP_GRAPH,
    open: true,
  }
}

export function closeLoopGraph() {
  return {
    type: TOGGLE_LOOP_GRAPH,
    open: false,
  }
}

// async GET

export const fetchNodeGraph = () => async (dispatch) => {
  // get the data, just making the test call for now
  const res = await callApi('nodes/graph')
  const body = await res.json

  const nodes = body.nodes.map((node) => ({
    attributes: {},
    id: node.name,
    ...node,
  }))
  const edges = body.edges.map((edge) => ({
    ...edge,
    from: edge.source,
    to: edge.target,
    shadow: {
      enabled: true,
      color: '#333333',
    },
  })).filter((edge) => ![undefined, null, ''].includes(edge.db))

  dispatch(getNodeGraph({ nodes, edges }))
}

// --------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------

// * Analysis methods; pull new graphs, or other objects, out of a graph based on some parameters

// * All of the following are very WIDESPREAD
// general helpers for finding adjacent nodes and retrieving their data
export const findChildren = (id, edges) => edges.filter((edge) => id === edge.from)
  .map((edge) => edge.to)

export const findParents = (id, edges) => edges.filter((edge) => id === edge.to)
  .map((edge) => edge.from)

export const findAllNeighbors = (id, edges) => [
  ...findChildren(id, edges),
  ...findParents(id, edges),
].reduce((acc, cur) => (acc.includes(cur) ? acc : [...acc, cur]), [])

export const nodesFromIds = (graph, ids) => graph.nodes.filter((node) => ids.includes(node.id))

export const edgesFromIds = (graph, ids) => graph.edges
  .filter((edge) => (ids.includes(edge.from) || ids.includes(edge.to)))

// * USED CORE, this is how we look at our main subgraphs
// ? Needs to be majorly redefined if we have cases of intraserver replication, db name-changing
// creates a subgraph representing the replication of a specific database
export const getSubgraphByDB = (graph, filterdb) => ({
  // eslint-disable-next-line
  nodes: graph.nodes.filter((node) => {if(node.dbs !== undefined){return node.dbs.includes(filterdb)}else{return}}),
  edges: graph.edges.filter((edge) => edge.db === filterdb),
})

// * USED in our reconstruction of graphs to remove repetition/dual direction
// removes any edges with identical or reversed source/target as another edge in the graph
export const consolidateEdges = (graph) => {
  const consolidatededges = graph.edges.reduce((acc, cur) => {
    const edgecheck = acc.find((edge) => [edge.from, edge.to].includes(cur.from)
      && [edge.from, edge.to].includes(cur.to))
    if (edgecheck) {
      return acc
    }
    return [...acc, cur]
  }, [])
  return {
    nodes: graph.nodes,
    edges: consolidatededges,
  }
}

// * WIDESPREAD used for all of our color-coding
// creates a list of all values held under a given attribute in the set of nodes
export const createGroupsList = (graph, filtergroup) => graph.nodes.reduce((acc, cur) => {
  const group = cur.attributes[filtergroup]
  return (acc.includes(group) ? acc : [...acc, group])
}, []).map((group) => (typeof group === 'string' ? group : `${group}`))

// * USED and important! Core to the nice graph physics we have
// rebuilds the graphs with lengths assigned to edges based on the traffic of their source/target
// ! DON'T MESS WITH THE CONSTANTS IN HERE THEY WORK AMAZINGLY
// ? currently factors in a "region" attribute if its there, generalize?
export const generateEdgesWithLengths = (graph) => {
  let filter = false
  const { edges } = graph
  const keys = graph.nodes.reduce((acc, cur) => ([...acc, ...Object.keys(cur.attributes)]), [])
  if (keys.includes('region')) filter = 'region'
  return graph.edges.map((edge) => {
    const { from, to } = edge
    let baseLength = 4
    if (filter) {
      const nodes = nodesFromIds(graph, [from, to])
      baseLength = (nodes[0].attributes[filter] === nodes[1].attributes[filter] ? 3 : 4)
    }
    const weight = (
      findAllNeighbors(from, edges).length + findAllNeighbors(to, edges).length + graph.nodes.length
    )
    return { ...edge, length: weight * baseLength }
  })
}

// * USED for checking for loops, eventually to be used for building new graphs
// function identifyLoops to find smallest subgraph which is a loop, returns false if none
// along with essential helper functions that may be reusable elsewhere
export const removeNode = (graph, nodeId) => ({
  nodes: graph.nodes.filter((node) => node.id !== nodeId),
  edges: graph.edges.filter((edge) => ![edge.to, edge.from].includes(nodeId)),
})

// * WIDESPREAD for checking nature of graph. Very simple but reusable
// The difference of nodes and edges length says a lot; results and meaning are:
// 0: contains (or is) a loop, aka a "face"
// 1: perfect tree
// 2+: excess nodes, one or more nodes are disconnected
// <0: has more than one loop structure in the graph
export const cyclicity = (graph) => (graph.nodes.length - graph.edges.length)

// * WIDESPREAD determines if the graph is a loop or set of loops
// ! Note, cannot distinguish two disconnected loops from a single loop
export const isLoop = (graph) => {
  if (cyclicity(graph) !== 0) return false
  let all2neighbors = true
  graph.nodes.forEach((node) => {
    if (findAllNeighbors(node.id, graph.edges).length !== 2) all2neighbors = false
  })
  return all2neighbors
}

// TODO function to check if a graph is connected - coupled with cyclicity, verifies a tree
// helpers included
export const unvisitedNeighbors = (graph, id, visited) => findAllNeighbors(id, graph.edges)
  .filter((neighbor) => !visited.includes(neighbor))

export const addPathToVisited = (startId, graph, visited) => {
  const nextNode = unvisitedNeighbors(graph, startId, visited)[0]

  if (typeof nextNode === 'string') {
    visited.push(nextNode)
    addPathToVisited(nextNode, graph, visited)
  }
}
// ! THIS IS NOT A SOLUTION
// ! It's something I tried, only left it in as an example of an approach that doesn't work
// UNUSED-UNTESTED, maybe just use this as a jumping off point
export const checkConnected = (graph) => {
  if (graph !== undefined) {
    const unvisited = graph.nodes.map((node) => node.id)
    const visited = []
    let connected = false
    unvisited.forEach((id) => {
      addPathToVisited(id, graph, visited)
      if (visited.length === unvisited.length) connected = true
    })
    return connected
  }
  return undefined
  // * Generally, the idea is to pick any one node, go to all its neighbors, add them to visited
  // * Basically go all the way to the "corners" of the graph and then back track adding everything
}

// * UNUSED-UNTESTED function to find disconnected nodes. This simple?
export const findDisconnectedNodes = (graph) => {
  const disconnected = []
  graph.nodes.forEach((node) => {
    if (findAllNeighbors(node.id, graph.edges).length === 0) disconnected.push(node.id)
  })
  return disconnected
}

// * WIDESPREAD for taking out "irrelevant" nodes from certain perspectives
export const trimLeaves = (graph) => {
  const nodeIds = graph.nodes.map((node) => node.id)
  let newgraph = graph
  nodeIds.forEach((id) => {
    if (findAllNeighbors(id, newgraph.edges).length < 2) {
      newgraph = removeNode(newgraph, id)
    }
  })
  return newgraph
}

// * WIDESPREAD as jumping off point for other subgraph constructions, and standalone
export const trimToLoops = (graph) => {
  let cursize = [1, 1]
  let newsize = [0, 0]
  let newgraph = graph
  while (cursize[0] !== newsize[0] || cursize[1] !== newsize[1]) {
    cursize = [newgraph.nodes.length, newgraph.edges.length]
    newgraph = trimLeaves(newgraph)
    newsize = [newgraph.nodes.length, newgraph.edges.length]
  }
  return newgraph
}

// * USED as display option for loop examination
export const identifyLoops = (graph, loops = []) => {
  if (isLoop(graph)) {
    loops.push(graph)
    return loops
  }
  const nodeIds = graph.nodes.map((node) => node.id)
  nodeIds.forEach((id) => {
    const newgraph = removeNode(graph, id)
    if (cyclicity(newgraph) < 1) identifyLoops(newgraph, loops)
  })
  return loops
}

// * USED as display option for loop examination
export const loopsWithNeighbors = (graph) => {
  const { edges } = graph
  const core = trimToLoops(graph)
  const neighbors = core.nodes
    .reduce((acc, cur) => [...acc, ...findAllNeighbors(cur.id, edges)], [])
    .reduce((acc, cur) => (acc.includes(cur) ? acc : [...acc, cur]), [])
  return {
    nodes: nodesFromIds(graph, neighbors),
    edges: edgesFromIds(graph, neighbors),
  }
}

// ! ----------------------------------------------------------------------

// * A set of functions for defining how to fix a problematic network
// ? In general this is still concept/hypothetical work
// The next function here is currently useful, but for others to be useful, we need:
// - Easy-to-read but comprehensive feedback function
// - Functions for specifying how a new graph needs to look both with a graph
//   - As well as textual feedback describing the new replication that's needed.

// * USED right now just to recolor the bad edges in a loop
// Helper function to identify edges that can be removed from a loop
export const removableLoopEdges = (graph) => {
  if (cyclicity(graph) > 0) return []
  const loop = loopsWithNeighbors(graph)
  if (cyclicity(loop) > 0) return []
  const conflictNodes = loop.nodes.map((node) => ({
    id: node.id, parents: findParents(node.id, loop.edges).length,
  })).filter((node) => node.parents > 1)
    .map((node) => node.id)
  return loop.edges.filter((edge) => conflictNodes.includes(edge.to))
}

// TODO A function for determining the better edge to remove and then removing it

// * UNUSED-TESTED works for simple individual removals, might be flawed in certain complex graphs
// A function for keeping a graph complete after removing a node
// I.e., ensuring a node's children are still replicated to if removed.
// Like all of these functions, must operate on a db subgraph.
// Intended use rebuilds full graph from these subgraphs
export const rebuildFromNodeRemoval = (graph, remove) => {
  // Steps! Find paths that need to be preserved. Works best operating on one node at a time.
  const parents = findParents(remove, graph.edges)
  const children = findChildren(remove, graph.edges)
  const rebuiltPaths = edgesFromIds(graph, children)
    .map((edge) => {
      // long term this may be where we add our "flowsorter" for how to choose a parent
      const newsource = parents[0]
      return {
        ...edge,
        from: newsource,
        source: newsource,
      }
    })
  // Remove all specified nodes
  const newgraph = removeNode(graph, remove)

  // Add new edges to complete path
  return consolidateEdges({
    nodes: newgraph.nodes,
    edges: [...newgraph.edges, ...rebuiltPaths],
  })
}

// TODO a function for removing bad edges from a loop
// Should take in a graph that is already trimmed and known to have loops,
// As well as some function for choosing how to prioritize bad edge removal.
// Should recursively call itself until no bad edges are found, return that graph.
