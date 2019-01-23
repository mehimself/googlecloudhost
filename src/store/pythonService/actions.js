import {
  GET_SCRIPTS,
  RUN_SCRIPT,
  SET_ISRUNNING,
  SET_ISERROR,
  SET_RESULTS
} from '@/store/pythonService/mutation-types'
import axios from 'axios'

const actions = {
  [GET_SCRIPTS]: function (context) {
    axios.get('/api/python/')
      .then(response => {
        context.commit(GET_SCRIPTS, response.data)
      })
      .catch(err => {
        console.warn('get python scripts error:', err)
        context.commit(SET_RESULTS, '')
        context.commit(SET_ISERROR, true)
      })
  },
  [RUN_SCRIPT]: function (context, name) {
    context.commit(SET_ISRUNNING, true)
    context.commit(SET_ISERROR, false)
    context.commit(SET_RESULTS, '')
    axios.get('/api/python/' + name)
      .then(response => {
        context.commit(SET_RESULTS, response.data.log)
        context.commit(SET_ISERROR, response.data.errorOccurred)
        context.commit(SET_ISRUNNING, false)
      })
      .catch(err => {
        console.warn('get python script request error:', err)
        context.commit(SET_RESULTS, '')
        context.commit(SET_ISRUNNING, false)
        context.commit(SET_ISERROR, true)
      })
  }
}

export default actions
