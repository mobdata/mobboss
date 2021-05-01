/*
   change redux state variables on networkGraph page
*/
import {
  GET_NODE_GRAPH, VIEW_SUB_GRAPH, SHOW_NODE_PROPS, CHANGE_NODE_GROUP,
  TOGGLE_LOOP_GRAPH, CHANGE_ALT_DISPLAY,
} from '../actions'

const initialState = {
  // 2d array containing arrays of nodes and edges for nodeGraph
  nodeGraph: {
    nodes: [],
    edges: [],
  },
  filterdb: '', // name of database to return graph data for
  filtergroup: '', // name of group to return graph data for
}

// returns new instance of redux state based on changes passed from NetworkGraph page
const GraphReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_NODE_GRAPH:
      return {
        ...state,
        nodeGraph: action.nodeGraph,
      }
    case VIEW_SUB_GRAPH:
      return {
        ...state,
        filterdb: action.db,
      }
    case CHANGE_NODE_GROUP:
      return {
        ...state,
        [action.layer]: action.group,
      }
    case SHOW_NODE_PROPS:
      return {
        ...state,
        selection: action.name,
      }
    case TOGGLE_LOOP_GRAPH:
      return {
        ...state,
        open: action.open,
      }
    case CHANGE_ALT_DISPLAY:
      return {
        ...state,
        displayType: action.displayType,
      }
    default:
      return state
  }
}

export default GraphReducer
