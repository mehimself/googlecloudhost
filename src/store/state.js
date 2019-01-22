import ColorService from '../../public/javascript/colorService'

const appColorTone = 'blue-grey'
const appColors = ColorService(appColorTone, 'dc')

const state = {
  socket: {
    isConnected: false,
    message: '',
    user: null, // todo: set upon login
    reconnectError: false
  },
  appColorTone: appColorTone,
  appColors: appColors,
  pageColor: {
    highlight: appColors.vDarkAccent().color,
    offset: '#777777',
    background: '#86939d'
  },
  user: null,
  isAuthenticated: true
}
export default state
