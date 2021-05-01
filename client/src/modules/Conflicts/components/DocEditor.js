/*
   allows mobboss user to resolve doc conflicts
*/
import React from 'react' // react rendeirng
import PropTypes from 'prop-types' // prop type checking
import ReactLoading from 'react-loading' // loading animation
import AppComponent from '@mobdata/little-differ-react/' // helps merge documents

const DocEditor = ({
  selectedDoc,
  pushWinningRevision,
  ldrDocA,
  ldrDocB,
  previousRevisionDoc,
}) => (

  <div
    style={{
      paddingLeft: 20,
      paddingTop: 5,
      paddingRight: 20,
      paddingBottom: 20,
      overflow: 'scroll',
      width: '100%',
      height: '100%',
      align: 'center',
    }}
  >
    {
    (!previousRevisionDoc['Waiting to Load'] && !ldrDocA['Waiting to Load'] && !ldrDocB['Waiting to Load'])
      ? (
        <AppComponent
          orig={previousRevisionDoc}
          docA={ldrDocA}
          docB={ldrDocB}
          selectedDoc={selectedDoc}
          acceptFinalButtonText="Push Current Buffer as Winning Revision"
          changeRevisedDataForCaller={(doc) => pushWinningRevision(doc)}
        />
      )
      : (
        <ReactLoading
          type="spinningBubbles"
          color="blue"
          style={{ align: 'center', height: '5%', width: '5%' }}
        />
      )
    }
  </div>
)

DocEditor.propTypes = {
  selectedDoc: PropTypes.string.isRequired,
  pushWinningRevision: PropTypes.func.isRequired,
  ldrDocA: PropTypes.shape({
    'Waiting to Load': PropTypes.string,
  }).isRequired,
  ldrDocB: PropTypes.shape({
    'Waiting to Load': PropTypes.string,
  }).isRequired,
  previousRevisionDoc: PropTypes.shape({
    'Waiting to Load': PropTypes.string,
  }).isRequired,
}

export default DocEditor
