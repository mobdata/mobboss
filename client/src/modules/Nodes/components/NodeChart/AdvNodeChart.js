import React, { Component } from 'react' // react rendering
import PropTypes from 'prop-types' // prop typechecking
import moment from 'moment' // used to manage time property
import { Line as LineChart } from 'react-chartjs-2' // used to graw graph

/*
  Note: you can proably eliminate a lot of this code by
  reconfiguring this to lean on more redux functions,
  but it functions fine as is, so I dind't really touch it
*/

// colors used for graph points/lines/background
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

const dataSetLabel = [
  'Average Ping Response',
  'Average HTTP Response',
  'Average Tasks Errored',
]

class AdvNodeChart extends Component {
  chartRef = React.createRef();

  constructor(props) {
    super(props)
    this.state = {
      exclude: [...this.props.statData], // array of all nodes that should not be filtered
      outOfRange: [], // array of nodes that were filtered using range
    }
  }

  /*  component should update if:
        1. prop data changes
        2. prop.reset changes
        3. filtered data list changes size
        4. list of data points "out of range" changes size
  */
  shouldComponentUpdate(nextProps, nextState) {
    // component should update if
    /* reset === true */
    if (nextProps.doReset !== this.props.doReset) {
      this.resetGraph();
      return true;
    }
    // NOT if exclude is undefined
    if (nextState.exclude === undefined) {
      return false;
    }
    /* if lower end of range decreased */
    if (moment(nextProps.start.time).isAfter(this.props.start.time)) {
      this.decreaseRange(0);
      return true;
    }
    /* if upper end of range decreased */
    if (moment(nextProps.end.time).isBefore(this.props.end.time)) {
      this.decreaseRange(1);
      return true;
    }
    /* lower end of range range will be increased */
    if (moment(nextProps.start.time).isBefore(this.props.start.time)) {
      this.increaseRange(0);
      return true;
    }
    /* upper end of range increased */
    if (moment(nextProps.end.time).isAfter(this.props.end.time)) {
      this.increaseRange(1);
      return true;
    }

    /* if exclude  array is to change length */

    return ((nextState.exclude).length !== (this.state.exclude).length
    || (nextState.outOfRange).length !== (this.state.outOfRange).length);

    /* OPTIMIZE test this without teturns for decrease and increase range,
    as both of these functions will change the length of exclude and thus trigger a re-render */
  }

  // if index of element is equal to index of element to be filtered out, then filter it out
  includeElement = (index, thisIndex) => {
    if (index === thisIndex) {
      return false;
    }
    return true;
  }

  /* iterate list of all data points "out of range"
     push to exclude IFF it is included in the new range specs */
  increaseRange = (op) => {
    this.setState((prevState) => {
      const { exclude } = prevState;
      const outOfRange = prevState.outOfRange.filter((stat) => {
        if (!moment(stat.time).isBefore(this.props.start.time)
            && !moment(stat.time).isAfter(this.props.end.time)) {
          if (op === 1) {
            exclude.push(stat);
          } else {
            exclude.unshift(stat);
          }

          return false;
        }
        return true;
      })
      return {
        exclude,
        outOfRange,
      };
    })
  }

  /* iterate list of all previously filtered data points
       remove from data  IFF it is BEFORE start date or AFTER end date
       THEN push that point to outOfRange */
  decreaseRange = (op) => {
    this.setState((prevState) => {
      let exclude;
      const { outOfRange } = prevState;
      if (op !== 1) {
        const result = prevState.exclude.filter((stat) => {
          if (moment(stat.time).isBefore(this.props.start.time)
            || moment(stat.time).isAfter(this.props.end.time)) {
            outOfRange.unshift(stat);

            return false;
          }
          return true;
        })
        exclude = result;
      } else {
        const result = prevState.exclude.reverse().filter((stat) => {
          if (moment(stat.time).isBefore(this.props.start.time)
            || moment(stat.time).isAfter(this.props.end.time)) {
            outOfRange.unshift(stat);

            return false;
          }
          return true;
        })
        exclude = result.reverse();
      }
      return {
        exclude,
        outOfRange,
      };
    })
  }

  /*
      set array keeping out of range values to empty and reset exclude to prop data
    */
  resetGraph = () => {
    this.setState(() => {
      const exclude = [...this.props.statData]
      const outOfRange = []
      return {
        exclude,
        outOfRange,
      };
    })
  }

  render() {
    const labels = this.state.exclude.map((stat) => moment(stat.time).format('MMMM Do YYYY'))

    /*
        find index of element clicked on and filter it out of "exclude"
    */
    const excludePush = (elems) => {
      if (elems.length !== 0) { // if user is not manipulating datasets displayeds
        /* eslint no-underscore-dangle: ["error", { "allow": ["_index"] }] */
        const thisIndex = elems[0]._index;
        this.setState((prevstate) => {
          const exclude = prevstate.exclude.filter((stat, index) => index !== thisIndex);
          return {
            exclude,
          };
        })
        const lineChart = this.chartRef.chartInstance;
        lineChart.update();
      }
    }

    /*
        parse prop data in to array of data points that LineChart uses to build graph
    */
    const datasets = dataSetLabel.map((label, index) => {
      const { backgroundColor, borderColor } = colors[index % colors.length]
      let data;
      switch (index) {
        case 0:
          data = this.state.exclude.map((stat) => stat.ping_mean)
          break
        case 1:
          data = this.state.exclude.map((stat) => stat.http_mean)
          break
        case 2:
          data = this.state.exclude.map((stat) => stat.errored_docs_mean)
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
      <LineChart
        data={chartData}
        width={1200}
        height={360}
        getElementAtEvent={(elems) => { excludePush(elems); }}
        ref={(reference) => { this.chartRef = reference }}
        options={{
          maintainAspectRatio: false,
        }}
      />
    )
  }
}

AdvNodeChart.propTypes = {
  statData: PropTypes.arrayOf(
    PropTypes.shape({}),
  ).isRequired,
  doReset: PropTypes.bool.isRequired,
  start: PropTypes.arrayOf(PropTypes.shape({
    time: PropTypes.moment,
  })),
  end: PropTypes.arrayOf(PropTypes.shape({
    time: PropTypes.moment,
  })),
}

AdvNodeChart.defaultProps = {
  start: null,
  end: null,
}

export default AdvNodeChart
