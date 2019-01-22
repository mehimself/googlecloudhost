import { GET_SCRIPTS, RUN_SCRIPT } from '@/store/pythonService/mutation-types'
import axios from 'axios'

const actions = {
  [GET_SCRIPTS]: function (context) {
    axios.get('/api/python/')
      .then(response => {
        context.commit(GET_SCRIPTS, response.data)
      })
      .catch(err => {
        console.warn(GET_SCRIPTS, ' ERROR:', err)
      })
  },
  [RUN_SCRIPT]: function (context, name) {
    context.state.isRunning = true
    context.results = ''
    axios.get('/api/python/' + name)
      .then(response => {
        context.commit(RUN_SCRIPT, response.data)
        context.state.isRunning = false
      })
      .catch(err => {
        context.commit(RUN_SCRIPT, err)
        context.state.isRunning = false
      })
  }
}

export default actions
