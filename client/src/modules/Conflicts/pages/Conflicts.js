/*
  conflicts page index
*/
import React, { Component } from 'react' // react rendering
import PropTypes from 'prop-types' // prop typecheck
import { connect } from 'react-redux' // database management
import PanelGroup from 'react-panelgroup' // manages placement of coponents on screen
import { Button } from '@material-ui/core' // material ui button
import Collapsible from 'react-collapsible' // collapsible panel for react
import DocEditor from '../components/DocEditor' // doc editor
import DocList from '../components/DocList' // list of document revisions
import RevisionGraph from '../components/RevisionGraph' // tree of document revisions
import '../styles/collapsibleStyles.css' // collapsible css

/* eslint-disable max-len */

// redux functions for changing state variables and fetching store data
import {
  changeSelectedDb,
  changeSelectedDoc,
  changeRevisionList,
  changeDisplayData,
  changeRevisionData,
  changeRevisedDoc,
  fetchRevisionData,
  fetchRevisionDocForMerge,
  fetchPreviousRevisionDoc,
  pushWinningRevision,
} from '../actions'

// redux getters for retrieving state variables and store data
import {
  getSelectedDb,
  getSelectedDoc,
  getDisplayData,
  getLdrDocA,
  getLdrDocB,
  getPreviousRevisionDoc,
  getRevisionData,
  getRevisionList,
  getRevisedDoc,
} from '../reducer'

// redux getters for nodes and node data
import {
  getNodes,
} from '../../Nodes/actions'

import {
  getNodeData,
} from '../../Nodes/reducer'

class Conflicts extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openGraph: false,
    }
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(getNodes())
  }

  render() {
    const {
      dispatch, displayData: propdisplay, selectedDb: thisDB, selectedDoc: thisDOC,
      nodes: thisNodes, revisionList: thisRevList, revisionData: thisRevData,
      ldrDocA: thisDocA, ldrDocB: thisDocB, previousRevisionDoc: thisPrevRev,
      revisedDoc: thisRevisedDoc,
    } = this.props

    // Functions for handling our graph states
    const graphClose = () => {
      this.setState({ openGraph: false })
    }
    const graphOpen = () => {
      this.setState({ openGraph: true })
    }

    const { openGraph: thisOpenGraph } = this.state
    return (
      <div
        style={{
          height: window.innerHeight - 114,
        }}
      >
        <RevisionGraph // allows user to see conflict history
          open={thisOpenGraph}
          onClose={graphClose}
          displayData={propdisplay}
          graphHeight={window.innerHeight / 2}
          graphWidth={window.innerWidth / 2}
          fetchRevisionData={(revision) => dispatch(
            fetchRevisionData(
              thisDB,
              thisDOC,
              revision,
            ),
          )}
        />
        <Collapsible // allows user to select conflict
          classParentString="Collapsible--conflict"
          open
          trigger={<h3 style={{ display: 'inline-block', padding: '15px' }}>Select a Conflict to Merge below </h3>}
        >
          <DocList // list of documents and conficts
            nodes={thisNodes}
            selectedDb={thisDB}
            selectedDoc={thisDOC}
            revisionList={thisRevList}
            changeRevisionList={(revisionList) => dispatch(changeRevisionList(revisionList))}
            changeSelectedDb={(db) => dispatch(changeSelectedDb(db))}
            changeSelectedDoc={(doc) => dispatch(changeSelectedDoc(doc))}
            changeDisplayData={(displayData) => dispatch(changeDisplayData(displayData))}
            fetchRevisionA={
                (db, doc, revisionList) => dispatch(
                  fetchRevisionDocForMerge(db, doc, revisionList[0], 'A'),
                )
              }
            fetchRevisionB={
                (db, doc, revisionList) => dispatch(
                  fetchRevisionDocForMerge(db, doc, revisionList[1], 'B'),
                )
              }
            fetchPrevRevisionDoc={
                (db, doc, revisionList) => dispatch(
                  fetchPreviousRevisionDoc(db, doc, revisionList[0]),
                )
              }
            changeRevisedDoc={() => dispatch(changeRevisedDoc({}))}
          />
        </Collapsible>
        {thisDOC && <Button style={{ border: '2px solid #3f51b5', left: '20px' }} onClick={graphOpen}>Visual Aid</Button>}
        <PanelGroup
          direction="column"
          borderColor="grey"
          panelSize={[
            {
              size: 50,
              minSize: 0,
              maxSize: 100,
              resize: 'fixed',
            },
            {
              size: 100,
              minSize: 50,
              resize: 'fixed',
            },
          ]}
        >
          <DocEditor // little differ react container
            key={thisDOC}
            selectedDb={thisDB}
            selectedDoc={thisDOC}
            revisionData={thisRevData}
            revisionList={thisRevList}
            ldrDocA={thisDocA}
            ldrDocB={thisDocB}
            previousRevisionDoc={thisPrevRev}
            changeRevisionData={(data) => dispatch(changeRevisionData(data))}
            changeRevisedDoc={(doc) => { dispatch(changeRevisedDoc(doc)) }}
            revisedDoc={thisRevisedDoc}
            pushWinningRevision={(data) => dispatch(
              pushWinningRevision(
                thisDB,
                thisDOC,
                data,
                thisRevList,
                thisDocA,
                thisDocB,
              ),
            )}
          />
        </PanelGroup>
      </div>
    )
  }
}

Conflicts.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  selectedDb: PropTypes.string.isRequired,
  selectedDoc: PropTypes.string.isRequired,
  displayData: PropTypes.shape({}).isRequired,
  ldrDocA: PropTypes.shape({}).isRequired,
  ldrDocB: PropTypes.shape({}).isRequired,
  previousRevisionDoc: PropTypes.shape({}).isRequired,
  revisionData: PropTypes.shape({}).isRequired,
  revisionList: PropTypes.arrayOf(PropTypes.string).isRequired,
  revisedDoc: PropTypes.shape({}).isRequired,
  dispatch: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  nodes: getNodeData(state),
  selectedDb: getSelectedDb(state),
  selectedDoc: getSelectedDoc(state),
  displayData: getDisplayData(state),
  ldrDocA: getLdrDocA(state),
  ldrDocB: getLdrDocB(state),
  previousRevisionDoc: getPreviousRevisionDoc(state),
  revisionData: getRevisionData(state),
  revisionList: getRevisionList(state),
  revisedDoc: getRevisedDoc(state),
})

export default connect(mapStateToProps)(Conflicts)
