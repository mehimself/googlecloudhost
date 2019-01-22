const websocket = require('nodejs-websocket')

function WebSocketManager() {
  function confirmConnection() {
    console.log('webSocket connection established')
  }

  function handleClosing(code, reason) {
    console.log('webSocket connection closed', code, reason)
    const codeAbnormalClosing = code === 1005 || code === 1006
    if (codeAbnormalClosing) {
      console.log('abnormal disconnection')
    }
    try {
      wss.close()
    } catch (e) {
      console.log('failed closing web socket server')
    }
    startWSServerIfNotRunning()
  }

  function handleError(error) {
    console.warn('Caught web socket error: ')
    console.warn(error.stack)
  }

  function startWSServerIfNotRunning() {
    function isPortTaken(port, next) {
      const net = require('net')
      const tester = net.createServer()
      tester
        .once('error', function (err) {
          if (err.code !== 'EADDRINUSE') {
            return next(err)
          }
          next(null, true)
        })
        .once('listening', function () {
          tester
            .once('close', function () { next(null, false) })
            .close()
        })
        .listen(port)
    }

    function startServer(err, portTaken) {
      function onConnection(conn) {
        ws = conn
        ws.on('text', function (str) {
          const isOpenConnectionRequest = str === 'open websocket connection'
          if (isOpenConnectionRequest) {
            confirmConnection()
          } else {
            console.log('unhandled WS message', str)
            ws.sendText('what do you mean by \'' + str + '\'?')
          }
        })
        ws.on('error', handleError)
        ws.on('close', handleClosing)
      }
      if (err) {
        console.error('websocket error', err)
      }

      if (!portTaken) {
        console.log('starting websocket server on port', wsPort)
        wss = websocket.createServer(onConnection).listen(wsPort)
        console.log('websocket started')
      } else {
        console.log('starting server, but port taken\nws', ws, '\n\nwss', wss)
      }
    }

    isPortTaken(wsPort, startServer)
  }

  const wsPort = 3001
  let wss
  let ws
  startWSServerIfNotRunning()
  return {
    send: function (text) {
      if (!ws) {
        startWSServerIfNotRunning()
      }
      try {
        console.info('websocket sending', text)
        ws.sendText(text)
      } catch (e) {
        console.error(e)
      }
    }
  }
}

module.exports = WebSocketManager
