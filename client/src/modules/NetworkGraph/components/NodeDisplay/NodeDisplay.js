/*
  Describes selected properties of node selected on the NodeGraph
*/
import React from 'react' // basic react rendering
import PropTypes from 'prop-types' // prop type check
import {
  List, ListItem, // material ui list
} from '@material-ui/core'

const NodeDisplay = (props) => {
  const { selected } = props

  const selection = {
    // eslint-disable-next-line
    Name: selected.label,
    // eslint-disable-next-line
    Databases: selected.title,
    // eslint-disable-next-line
    Neighbors: selected.Neighbors,
    // eslint-disable-next-line
    ...selected.attributes,
  }

  /*

  */
  // Now intending to include a separate actions component within this
  // Will require nesting the elements, and creating a list of buttons linked to actions
  // define actions below for each; each is an alternative graph operation

  // Action: generate graph with selected node removed, not-repaired

  // Action: (if node has no neighbors) connect to graph. Alt, connect all "free" nodes

  // Action: Fix all nodes in the graph

  // Action: hide disconnected/"free" nodes in the graph

  // Action: apply connection rule, i.e. only add edges within members of group X
  // Note - yes this is more complicated, so it's more about writing
  // a general function that we could easily implement in different ways as desired

  /*
     list all of node's attricutes: name, neighbors etc.
  */
  return (
    <List dense subheader="Selected Node's Properties:">
      {Object.keys(selection).map((att) => {
        if (typeof selection[att] === 'undefined' || selection[att] === '') {
          return <ListItem key={att} />
        }
        return (<ListItem key={att} divider>{`${att}: ${selection[att]}`}</ListItem>)
      })}
    </List>
  )
}

NodeDisplay.propTypes = {
  selected: PropTypes.shape({}).isRequired,
}

export default NodeDisplay
