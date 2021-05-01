/*
  Component that displays graph of Node's connectivity over time, used in NodeInfoItem
*/
import React from 'react'
import PropTypes from 'prop-types'
import { Sparklines, SparklinesLine } from 'react-sparklines'
import { red, green, amber } from '@material-ui/core/colors'

const NodeSparkline = (props) => {
  /* PROPS:
     historicalData: Array of X Node's aility to connect to influx host
     tracks frequency of connectivity statuses */
  const freq = { up: 0, appDown: 0, connDown: 0 }
  props.historicData.forEach((stat) => {
    if (stat === 2) { freq.up += 1 }
    if (stat === 1) { freq.appDown += 1 }
    if (stat === 0) { freq.connDown += 1 }
  })
  let color

  /*
    set color variable based on the most frequent conectivity status
  */
  if (freq.up >= freq.appDown && freq.up >= freq.connDown) {
    // eslint-disable-next-line
    color = green[500]
  } else if (freq.appDown > freq.connDown) {
    // eslint-disable-next-line
    color = amber[500]
  } else {
    // eslint-disable-next-line
    color = red[500]
  }

  return (
    <Sparklines // creates simple line graph
      data={props.historicData.map((stat) => stat)}
      min={0}
      max={2}
    >
      <SparklinesLine color={color} />
    </Sparklines>
  )
}

NodeSparkline.propTypes = {
  historicData: PropTypes.arrayOf(
    PropTypes.number,
  ).isRequired,
}

export default NodeSparkline
