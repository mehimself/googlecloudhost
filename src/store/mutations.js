const mutations = {
  UPDATE_USER: function (state, user) {
    state.user = user
  },
  // websocket mutations
  SOCKET_ONOPEN(state, event) {
    state.socket.isConnected = true
  },
  SOCKET_ONCLOSE(state, event) {
    state.socket.isConnected = false
  },
  SOCKET_ONERROR(state, event) {
    console.error(state, event)
  },
  SOCKET_ONMESSAGE(state, message) {
    state.message = message
  },
  SOCKET_RECONNECT(state, count) {
    console.info(state, count)
  },
  SOCKET_RECONNECT_ERROR(state) {
    state.socket.reconnectError = true
  },
  isAuthenticated(state, payload) { // WS
    console.log(payload)
    state.isAuthenticated = payload.isAuthenticated
    console.log(state.isAuthenticated)
  }
}

export default mutations
