/*
  top level component for Nodes page, serves as mobboss home page
*/
import React, { Component } from 'react' // component rendering
import PropTypes from 'prop-types' // prop typechecking
import { connect } from 'react-redux' // database management

import NodeTable from '../components/NodeTable/NodeTable' // component that creates table containing current node data
import Chart from '../components/NodeChart/NodeChart' // component that creates line graph with historical node data
import SideBarInfo from '../components/SideBarInfo/SideBarInfo' // component containing information about selected nodes

// redux functions
import {
  fetchStatData,
} from '../actions'

// redux fuctions for getting node data and API call status
import {
  getAllSelected,
  getNodeData,
  getStatData,
  isLoading,
  getSelectedRows,
  getSelectedNodes,
  getSearchedNodes,
} from '../reducer'

const styles = {
  dashboard: {
    display: 'flex', // determines dashboard screen usage
    flexDirection: 'row', // dashboard orientation
  },
  tableContainer: {
    flex: '8', // sets flexible length on table
  },
  infoContainer: {
    flex: '3', // sets flexible length on side bar info
    position: 'realtive', // sets side bar info to the right of nodeTable
  },
  chart: {
    display: 'flex', // sets flexible size requirements on NodeChart
    position: 'relative', // sets node chart position below nodeTable
  },
}

class Dashboard extends Component {
  // when component mounts fetch stat data from redux store
  componentDidMount() {
    const { dispatch } = this.props
    dispatch(fetchStatData())
  }

  render() {
    const {
      nodes, statData, loading,
      selectedRows, selectedNodes,
      searchedNodes,
      dispatch, allSelected,
    } = this.props
    return (
      <div style={styles.dashboard}>
        <section style={styles.tableContainer}>
          <NodeTable // contians table(column and row) with node info
            dispatch={dispatch}
            nodes={nodes}
            loading={loading}
            selectedRows={selectedRows}
            allSelected={allSelected}
            searchedNodes={searchedNodes}
          />
          <div style={styles.chart}>
            <Chart // contains nodechart(line graph) and adv node chart
              nodes={nodes}
              statData={statData}
              selectedNodes={selectedNodes}
            />
          </div>

        </section>
        <div style={styles.infoContainer}>
          <SideBarInfo // contians right-side bar info for selected nodes
            selectedNodes={selectedNodes}
            isLoading={loading}
          />
        </div>
      </div>
    )
  }
}

Dashboard.propTypes = {
  dispatch: PropTypes.func.isRequired,
  nodes: PropTypes.arrayOf(
    PropTypes.shape({
      node_name: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  statData: PropTypes.arrayOf(
    PropTypes.shape({}),
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  selectedRows: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedNodes: PropTypes.arrayOf(PropTypes.shape({
    node_name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  })).isRequired,
  searchedNodes: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({}))).isRequired,
  allSelected: PropTypes.bool.isRequired,
}

const mapStateToProps = (state) => ({
  nodes: getNodeData(state),
  statData: getStatData(state),
  loading: isLoading(state),
  selectedRows: getSelectedRows(state),
  selectedNodes: getSelectedNodes(state),
  searchedNodes: getSearchedNodes(state),
  allSelected: getAllSelected(state),
})

export default connect(mapStateToProps)(Dashboard)
