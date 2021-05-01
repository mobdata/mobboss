/*
  updates state of redux variables on the nodes page
*/
import {
  GET_NODES, ADD_NODES, ADD_STAT_DATA,
  SELECT_NODE, DESELECT_NODE,
  SEARCH_NODE, CLEAR_SEARCH,
  TOGGLE_POLLING, TOGGLE_SELECT_ALL,
} from '../actions/constant'

const initialState = {
  data: [], // array of current node data
  statData: [], // array of historical node data
  selectedRows: [], // array of nodes that have been selected
  searchedNodes: [], // array of nodes that fit seatch criteria
  polling: false, // boolean: true before response from server
  loading: true, // boolean: true if nodes have not been fetched
  allSelected: false, // boolean: true if select all button pressed
}

const NodeReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_NODES:
      return { ...state, loading: false }
    case ADD_NODES:
      return { ...state, loading: false, data: action.nodes }
    case ADD_STAT_DATA:
      return { ...state, loading: false, statData: action.stats }
    case SELECT_NODE:
      return { ...state, selectedRows: [...state.selectedRows, action.selectedRow] }
    case SEARCH_NODE:
      return { ...state, searchedNodes: [...state.searchedNodes, action.searchedNodes] }
    case CLEAR_SEARCH:
      return { ...state, searchedNodes: [] }
    case DESELECT_NODE:
      return {
        ...state,
        selectedRows: state.selectedRows.filter(
          (element) => element !== action.selectedRow,
        ),
      }
    case TOGGLE_SELECT_ALL:
      return { ...state, allSelected: !state.allSelected }
    case TOGGLE_POLLING:
      return { ...state, loading: false, polling: action.isPolling }
    default:
      return state
  }
}

export const getNodeData = (state) => state.node.data
export const isLoading = (state) => state.node.loading
export const getSelectedRows = (state) => state.node.selectedRows
export const getSelectedNodes = (state) => state.node.data.filter(
  (node) => state.node.selectedRows.includes(node.node_name),
)
export const getSearchedNodes = (state) => state.node.searchedNodes
export const getIsPolling = (state) => state.node.polling
export const getStatData = (state) => state.node.statData
export const getAllSelected = (state) => state.node.allSelected

export default NodeReducer
