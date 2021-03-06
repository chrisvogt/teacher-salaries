import React, { Component } from 'react'
import PropTypes from 'prop-types'

import ReactHighcharts from 'react-highcharts'
import initHighcharts from '../Visualization/initHighcharts'
import SalariesHelper from '../../helpers/SalariesHelper'
import StateHelper from '../../helpers/StateHelper'
import chartOptions from '../../data/chartOptions'
import Controls from './Controls/'
import Notice from './Notice'

import '../../styles/Report.css'

class Report extends Component {
  constructor() {
    super(...arguments)

    this.Salaries = new SalariesHelper(require('../../data/salaries.json'))
    this.States = new StateHelper(require('../../data/states.json'))

    this.state = {
      states: ['NY', 'CA', 'AZ'],
      config: {}
    }

    this.handleControlChange = this.handleControlChange.bind(this)
    this.handleDeleteState = this.handleDeleteState.bind(this)

    initHighcharts()
  }

  componentWillMount () {
    this.setState((prevState) => {
      return {
        config: this.getConfig(prevState.states),
        states: prevState.states
      }
    })
  }

  buildSeries (states) {
    const selected = (states.length > 0) ? states : this.state.states
    let series = []

    selected.forEach((stateId) => {
      series.push({
        data: this.Salaries.getSeries(stateId),
        name: this.States.getName(stateId)
      })
    })

    return series
  }

  getConfig (states = []) {
    return {
      ...chartOptions,
      series: this.buildSeries(states)
    }
  }

  handleControlChange (v) {
    this.setState((prevState) => {
      if (prevState.states.indexOf(v.newState) === -1) {
        prevState.states.push(v.newState)
      }

      return {
        states: prevState.states,
        config: this.getConfig(prevState.states)
      }
    })

    this.context.mixpanel.track('Add State', {
      State: this.States.states[v.newState]
    })
  }

  handleDeleteState (key) {
    this.setState((prevState) => {
      if (prevState.states.indexOf(key) > -1) {
        prevState.states = prevState.states.filter(function(state) {
          return state !== key
        })
      }

      return {
        states: prevState.states,
        config: this.getConfig(prevState.states)
      }
    })

    this.context.mixpanel.track('Remove State', {
      State: this.States.states[key]
    })
  }

  render() {
    const selectedStates = this.States.getByKeys(this.state.states)
    const stateNamesToTrack = selectedStates.map(state => state.label)

    this.context.mixpanel.track('Salary Comparison', {
      States: stateNamesToTrack
    })

    return (
      <div className="Report">
        {this.state.states.length > 0 &&
          <ReactHighcharts config={this.state.config} />
        }
        {this.state.states.length === 0 &&
          <Notice />
        }
        <Controls
          onControlChange={this.handleControlChange}
          onDeleteState={this.handleDeleteState}
          selectedStates={selectedStates}
        />
      </div>
    )
  }
}

Report.contextTypes = {
  mixpanel: PropTypes.shape({
    track: PropTypes.func.isRequired
  }).isRequired
}

export default Report
