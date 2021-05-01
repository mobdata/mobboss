/*
   functions for managing redux data on Nodes page
*/
import shortid from 'shortid' // random generated short id number
import { push } from 'connected-react-router' // pushes new data to react

import { getNodeData } from '../reducer'

// action types
import {
  GET_NODES, ADD_NODES, ADD_STAT_DATA,
  SELECT_NODE, DESELECT_NODE,
  SEARCH_NODE, CLEAR_SEARCH,
  TOGGLE_POLLING, TOGGLE_SELECT_ALL,
} from './constant'

import { toggleDialog } from '../../App/actions'
import callApi from '../../../util/apiCaller'

/*
  JS functions corresponding to Node reducer actions
*/
export function toggleSelectAll() {
  return {
    type: TOGGLE_SELECT_ALL,
  }
}

export function getNodes() {
  return {
    type: GET_NODES,
  }
}

export function addNodes(nodes) {
  return {
    type: ADD_NODES,
    nodes,
  }
}

export function addStatData(stats) {
  return {
    type: ADD_STAT_DATA,
    stats,
  }
}

export function selectNode(selectedRow) {
  return {
    type: SELECT_NODE,
    selectedRow,
  }
}

export function deselectNode(selectedRow) {
  return {
    type: DESELECT_NODE,
    selectedRow,
  }
}

export function searchNodes(searchedNodes) {
  return {
    type: SEARCH_NODE,
    searchedNodes,
  }
}

export function clearSearch(clearedSearch) {
  return {
    type: CLEAR_SEARCH,
    clearedSearch,
  }
}

export function togglePolling(isPolling) {
  return {
    type: TOGGLE_POLLING,
    isPolling,
  }
}

// gets nodes from couch
export function fetchNodes() {
  return async (dispatch, getState) => {
    dispatch(getNodes())

    try {
      const { response, json } = await callApi('nodes')

      if (response.status === 401 || response.status === 400) {
        dispatch(push('/'))
        return
      }

      if (response.status === 500) {
        // keeping this in for possible future use
        // dispatch(togglePolling(false))
        dispatch(toggleDialog(true, 'Internal Server Error', json.message))
        return
      }

      // If node exists with an ID already assigned, only update the data
      const oldNodes = getNodeData(getState())
      const newNodes = json
        .map((newNode) => {
          const node = oldNodes.find((oldNode) => oldNode.node_name === newNode.node_name)
          return Object.assign(newNode, { id: !node ? shortid.generate() : node.id })
        })

      dispatch(addNodes(newNodes))
    } catch (err) {
      // dispatch(togglePolling(false))
      dispatch(toggleDialog(true, 'Network Error', err.message))
    }
  }
}

/*
   fetches data about nodes from DB
*/
export function fetchStatData() {
  return async (dispatch) => {
    try {
      const [
        resStats, repStats,
      ] = await Promise.all([callApi('nodes/stats/response'), callApi('nodes/stats/replication')])

      const { response: statRes, json: statJson } = resStats
      const { response: repRes, json: repJson } = repStats

      if (statRes.status === 401 || repRes.status === 401) {
        dispatch(push('/'))
        return
      }

      if (statRes.status === 500 || repRes.status === 500) {
        dispatch(toggleDialog(true, 'Internal Server Error', statJson.message || repJson.message))
        return
      }

      const data = statJson.stats.map((stat, index) => Object.assign(
        stat, repJson.stats[index],
      ))

      dispatch(addStatData(data))
    } catch (e) {
      dispatch(toggleDialog(true, 'Internal Server Error', e.message))
    }
  }
}
