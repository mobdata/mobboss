import React from 'react' // component rendering
import PropTypes from 'prop-types' // prop checking
import moment from 'moment' // Handles timestamps
import { Line as LineChart } from 'react-chartjs-2' // Creates NodeChart
import Dialog from '@material-ui/core/Dialog' // Creates dialog for AdvNodeChart
import DialogActions from '@material-ui/core/DialogActions' // Event handler for dialog
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import IconButton from '@material-ui/core/IconButton' // Icon Button Style
import { Divider, Grid } from '@material-ui/core' // Creates divider for dialog content

import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined' // Icon
import Tooltip from '@material-ui/core/Tooltip' // Tooltip component on event

import { makeStyles } from '@material-ui/core/styles' // Makes style for dialog box
import Typography from '@material-ui/core/Typography'
import Slider from '@material-ui/core/Slider' // Creates range bar
import AdvNodeChart from './AdvNodeChart' // Creates filterabe version of NodeChart

// Style for divider
const style = {
  padding: '2em',
}

// Style for adv node chart dialog box
const useStyles = makeStyles({
  dialogPaper: {
    minHeight: '50%', // sets dialog to 50 pct of total screen height
    maxHeight: '50%',
  },
});

// Colors for different lines and points of chart (red, yellow, blue)
const colors = [
  {
    backgroundColor: 'rgba(255, 99, 132, 0.2)',
    borderColor: 'rgba(255, 99, 132, 1)',
  },
  {
    backgroundColor: 'rgba(54, 162, 235, 0.2)',
    borderColor: 'rgba(54, 162, 235, 1)',
  },
  {
    backgroundColor: 'rgba(255, 206, 86, 0.2)',
    borderColor: 'rgba(255, 206, 86, 1)',
  },
  {
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    borderColor: 'rgba(75, 192, 192, 1)',
  },
  {
    backgroundColor: 'rgba(153, 102, 255, 0.2)',
    borderColor: 'rgba(153, 102, 255, 1)',
  },
  {
    backgroundColor: 'rgba(255, 159, 64, 0.2)',
    borderColor: 'rgba(255, 159, 64, 1)',
  },
]

// Fucntion that displays date of data point above range marker on range bar
function ValueLabelComponent(props) {
  const { children, open, value } = props;

  return (
    <Tooltip open={open} enterTouchDelay={0} placement="top" title={value}>
      {children}
    </Tooltip>
  );
}

const marks = []; // Array for storing each mark on Range Slider
const months = []; // Array for storing each months represented by data

// Component that displays line graph at bottom of Nodes page
const NodeChart = (props) => {
  const { statData } = props // historical node data

  const [open, setOpen] = React.useState(false)

  const [reset, setReset] = React.useState(false)

  const [value, setValue] = React.useState([0, 84]);

  const classes = useStyles();

  // Function that changes value on range
  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

  // Function that resets filter values
  const handleReset = () => {
    if (reset === false) {
      setValue([0, (marks.length - 1)]);
      setReset(true);
    } else {
      setValue([0, (marks.length - 1)]);
      setReset(false);
    }
  }

  // Function that opens Advanced node chart
  const handleClickOpen = () => {
    setMarks() //eslint-disable-line
    setValue([0, (marks.length - 1)]);
    setOpen(true);
  }

  // Function that closes AdvNodeChart
  const handleClose = () => {
    setOpen(false);
  }

  // Function that inputs data point and displays date of data point on the range bar
  const valuetext = (val) => `${marks[val].date}`

  // Function that iterates statData and sets marks on range bar based on date of data point
  const setMarks = () => statData.map((stat) => {
    if (marks === null) { marks.push({ value: 0, label: moment(statData[0].time).format('MM-YY') }); } //eslint-disable-line
    // if new month, push month label
    if (!(months.includes(moment(stat.time).format('MM-YY')))) {
      marks.push({
        value: marks.length, label: moment(stat.time).format('MM-YY'), date: moment(stat.time).format('MMM YYYY'), time: stat.time,
      });
      months.push(moment(stat.time).format('MM-YY'))
    } else {
      // if new day push blank "day" label
      marks.push({
        value: marks.length, label: '', date: moment(stat.time).format('MMM: DD'), time: stat.time,
      })
    }
    return 0;
  });

  // Function that NodeChart X-axis
  const labels = statData
    .map((stat) => moment(stat.time).format('MMMM Do YYYY'))

  // Function that sets Node Chart data types
  const dataSetLabel = [
    'Average Ping Response(sec)',
    'Average HTTP Response(sec)',
    'Average Tasks Errored(#)',
  ]

  // Function that converts statdata from api call into usable data by LineChart component
  const datasets = dataSetLabel.map((label, index) => {
    const { backgroundColor, borderColor } = colors[index % colors.length]
    let data

    switch (index) {
      case 0:
        data = statData.map((stat) => stat.ping_mean)
        break
      case 1:
        data = statData.map((stat) => stat.http_mean)
        break
      case 2:
        data = statData.map((stat) => stat.errored_docs_mean)
        break
      default:
        break
    }

    return {
      label,
      borderWidth: 1,
      lineTension: 0,
      pointRadius: 3,
      pointHitRadius: 3,
      backgroundColor,
      borderColor,
      data,
    }
  })

  const chartData = {
    labels,
    datasets,
  }

  return (
    <div style={style}>
      <LineChart // vizualizes ping/response/tasks errored data over time
        data={chartData}
        width={1200}
        height={300}
        options={{
          maintainAspectRatio: false,
          onClick: handleClickOpen,
        }}
      />
      <div className="classes.root">
        <Dialog // container for advanced node chart
          classes={{ paper: classes.dialogPaper }}
          open={open}
          fullWidth
          maxWidth="lg"
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <Grid container>
            <DialogTitle id="alert-dialog-title">Advanced Tools</DialogTitle>
            <Divider orientation="vertical" flexItem />
            <Tooltip title="Left-click a data point to hide from graph view" placement="bottom-end" arrow>
              <IconButton // provides info on controls of adv-node chart
                style={{ overflow: 'visible' }}
              >
                <InfoOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <DialogContent>
            <DialogContentText id="detail-line-chart">
              <AdvNodeChart // node chart with ability to remove point and filter by date
                statData={statData}
                doReset={reset}
                start={marks[value[0]]}
                end={marks[value[1]]}
              />
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <button onClick={handleReset} type="button">
              Reset
            </button>
            <Typography id="range-slider" gutterBottom>
              Range:
            </Typography>
            <Slider
              value={value}
              onChange={handleChange}
              getAriaValueText={valuetext}
              valueLabelFormat={valuetext}
              ValueLabelComponent={ValueLabelComponent}
              aria-labelledby="range-slider"
              marks={marks}
              min={0}
              max={(marks.length - 1)}
              valueLabelDisplay="on"

            />
            <button onClick={handleClose} variant="contained" type="button">
              Close
            </button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  )
}

NodeChart.propTypes = {
  statData: PropTypes.arrayOf(
    PropTypes.shape({}),
  ).isRequired,
}

ValueLabelComponent.propTypes = {
  children: PropTypes.shape({}).isRequired,
  value: PropTypes.shape({}).isRequired,
  open: PropTypes.shape({}).isRequired,
}

export default NodeChart
