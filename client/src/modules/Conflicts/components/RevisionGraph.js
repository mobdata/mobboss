/*
   creates data tree of all revisions
*/
import React from 'react' // react rendering
import PropTypes from 'prop-types' // prop type check
import Tree from 'react-tree-graph' // renders tree graph from data
import '../styles/graphStyles.css' // graph css styles
import { Dialog, DialogActions, Button } from '@material-ui/core' // dialog box and controls

const RevisionGraph = ({
  displayData, graphWidth, graphHeight, onClose, open,
}) => (
  <Dialog open={open} maxWidth={graphWidth + 1000} onBackdropClick={onClose}>
    <div className="custom-container">
      <Tree
        data={displayData}
        height={graphHeight}
        width={graphWidth}
        margins={{
          bottom: 0,
          left: graphWidth * 0.02,
          right: graphWidth * 0.4,
          top: graphHeight * 0.25,
        }}
        svgProps={{
          className: 'custom',
        }}
        gProps={{

        }}
        animated
      />
    </div>
    <DialogActions>
      <Button onClick={onClose}>
        Close
      </Button>
    </DialogActions>
  </Dialog>
)

RevisionGraph.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  displayData: PropTypes.shape({}).isRequired,
  graphWidth: PropTypes.number.isRequired,
  graphHeight: PropTypes.number.isRequired,
}

export default RevisionGraph
