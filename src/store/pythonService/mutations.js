import { GET_SCRIPTS, RUN_SCRIPT } from '@/store/pythonService/mutation-types'

const mutations = {
  [GET_SCRIPTS]: function (state, scriptNames) {
    state.scripts = scriptNames
  },
  [RUN_SCRIPT]: function (state, results) {
    state.results = results
  }
}

export default mutations
