const state = {
  socket: {
    isConnected: false,
    message: '',
    user: null, // todo: set upon login
    reconnectError: false
  },
  user: null,
  saveEnergy: true,
  isAuthenticated: true
}
export default state
