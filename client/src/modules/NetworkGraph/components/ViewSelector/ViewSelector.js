/*
  Allows user to change options for NetworkGraph, and open examine loops window
*/
import React from 'react' // basic react app
import PropTypes from 'prop-types' // prop type checking
import {
  List, ListItem, FormControl, InputLabel, Select, MenuItem, ListSubheader, Grid, Paper, Button,
} from '@material-ui/core' // material-ui components
import { viewSubGraph, changeNodeGroup, openLoopGraph } from '../../actions' // redux actions

const ViewSelector = (props) => {
  const {
    dbs, filterdb, filtergroup, attributes, dispatch, colorArray, secondgroup, warning,
  } = props

  const onChangeDB = (e) => {
    // dispatch some action to update the graph
    dispatch(viewSubGraph(e.target.value))
  }

  const onChangeGroup = (e) => {
    // dispatch action to change color coding
    const group = e.target.value
    const layer = e.target.name
    if (layer === 'filtergroup') {
      if (group === '') {
        dispatch(changeNodeGroup('', 'secondgroup'))
      }
      if (group === secondgroup) {
        dispatch(changeNodeGroup('', 'secondgroup'))
      }
    }
    dispatch(changeNodeGroup(group, layer))
  }

  const openGraphDialog = () => {
    // dispatch line to open dialog
    dispatch(openLoopGraph())
  }

  // map graphs colors to List Items IFF filtergroup contains some value
  const mapColorsToChips = (colors) => {
    const groups = Object.keys(colors)
    if (filtergroup === '') { return null }

    return groups.map((group) => (
      <Grid
        item
        xs={6}
        key={group}
      >
        <Paper style={{
          height: 35, width: '80%', backgroundColor: colors[group].color, padding: 2,
        }}
        >
          {group}
        </Paper>
      </Grid>
    ))
  }

  const databases = filterdb !== 'false' // databases = true IFF filterdb !== 'false'
  const subheader = databases ? 'Select a database to view its subgraph' : '' // creates subheader for list as long as databases exist

  return (
    <List>
      <ListSubheader>{subheader}</ListSubheader>
      <ListItem>
        <span style={{ color: 'red' }}>{warning}</span>
      </ListItem>
      {databases /* if databases === true, then */? (
        <ListItem width="100%">
          <FormControl variant="outlined" fullWidth>
            <InputLabel id="db">Database:</InputLabel>
            <Select value={filterdb} onChange={onChangeDB} autoWidth>
              <MenuItem value="">All</MenuItem>
              {dbs.map((db) => <MenuItem value={db} key={db}>{db}</MenuItem>)}
            </Select>
          </FormControl>
          {(filterdb !== '' && warning !== '') ? <Button onClick={openGraphDialog}>Examine Loops</Button> : null}
        </ListItem>
      ) : null}
      <ListSubheader>Select a grouping to recolor the graph </ListSubheader>
      <ListItem width="100%">
        <FormControl variant="outlined" fullWidth>
          <InputLabel id="attribute">Group By:</InputLabel>
          <Select value={filtergroup} onChange={onChangeGroup} name="filtergroup" autoWidth>
            <MenuItem value="" key="">All</MenuItem>
            {attributes.map((att) => <MenuItem value={att} key={att}>{att}</MenuItem>)}
          </Select>
        </FormControl>
      </ListItem>
      {(filtergroup !== '') /* if filtergroup is not blank */ && (
      <ListItem width="100%">
        <FormControl variant="outlined" fullWidth>
          <InputLabel id="attribute">Secondary Group:</InputLabel>
          <Select value={secondgroup} onChange={onChangeGroup} name="secondgroup" autoWidth>
            <MenuItem value="" key="">All</MenuItem>
            {attributes.filter((att) => att !== filtergroup)
              .map((att) => <MenuItem value={att} key={att}>{att}</MenuItem>)}
          </Select>
        </FormControl>
      </ListItem>
      )}
      <ListItem width="100%">
        <Grid container spacing={1}>
          {mapColorsToChips(colorArray)}
        </Grid>
      </ListItem>
    </List>
  )
}

ViewSelector.propTypes = {
  dbs: PropTypes.arrayOf(PropTypes.string).isRequired,
  filterdb: PropTypes.string.isRequired,
  attributes: PropTypes.arrayOf(PropTypes.string).isRequired,
  filtergroup: PropTypes.string.isRequired,
  secondgroup: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  colorArray: PropTypes.shape({}).isRequired,
  warning: PropTypes.string.isRequired,
}

export default ViewSelector
