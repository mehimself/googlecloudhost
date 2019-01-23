import {
  GET_SCRIPTS,
  RUN_SCRIPT,
  SET_ISRUNNING,
  SET_RESULTS,
  SET_ISERROR
} from '@/store/pythonService/mutation-types'

const mutations = {
  [GET_SCRIPTS]: function (state, scriptNames) {
    state.scripts = scriptNames
  },
  [RUN_SCRIPT]: function (state, results) {
    state.results = results
  },
  [SET_RESULTS]: function (state, results) {
    state.results = results
  },
  [SET_ISRUNNING]: function (state, value) {
    state.isRunning = value
  },
  [SET_ISERROR]: function (state, value) {
    console.log('error:', value)
    state.isError = value
  }
}

export default mutations
