// ----------------------------------------------------------------------------
// BACKEND_CONFIG
//
// Determina configurações para acesso ao backend.
// ----------------------------------------------------------------------------
var BACKEND_CONFIG = {
    restHost: "https://curso-chat-ws.buscadev.com",
    wsHost: "wss://curso-chat-ws.buscadev.com",

    pingInterval: 3000,
    pongTolerance: 9000
}


// ----------------------------------------------------------------------------
// ws
//
// Objeto que representa a conexão WebSocket. É inicialmente criado nulo.
// Recebe um objeto WebSocket após a conexão. Nele são definidos os callbacks
// para lidar com os eventos WebSocket, além de disponibilizar método para
// envio de mensagens ao backend.
// ----------------------------------------------------------------------------
var ws = null


// ----------------------------------------------------------------------------
// getTicket
//
// Recebe token JWT e realiza requisição ao backend para geração do ticket que
// permitira realizar uma conexão WebSocket autenticada.
// ----------------------------------------------------------------------------
function getTicket(token) {
    const options = {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token }
    }
    return fetch(BACKEND_CONFIG.restHost + '/v1/ticket', options)
        .then(response => response.json())
        .then(response => response.ticket)
}


// ----------------------------------------------------------------------------
// connectWebSocket
//
// Conecta-se ao backend através de WebSocket.
// Para isto, obtém o token JWT do usuário logado, utiliza-o para obter um
// ticket no backend e então utiliza o ticket para compor a url de conexão.
// ----------------------------------------------------------------------------
function connectWebSocket(onOpen, onClose, onMessage, autoReconnect) {
    var isOpen = ws && [WebSocket.CONNECTING, WebSocket.OPEN].includes(ws.readyState)
    if (isOpen) return Promise.resolve()

    var reconnect = function () {
        console.log("reconnecting in 3 seconds...")
        setTimeout(function () {
            connectWebSocket(onOpen, onClose, onMessage, autoReconnect).catch(reconnect)
        }, 3000)
    }

    return getJwt()
        .then(function (jwt) { return getTicket(jwt) })
        .then(function (ticket) {
            var pingInterval = null
            var lastPong = null

            ws = new WebSocket(BACKEND_CONFIG.wsHost + "/chat?ticket=" + ticket)

            ws.onopen = function (event) {
                pingInterval = setInterval(function () {
                    if (lastPong && (Date.now() - lastPong > BACKEND_CONFIG.pongTolerance)) {
                        clearInterval(pingInterval)
                        ws.close()
                    } else {
                        ws.send("ping")
                    }
                }, BACKEND_CONFIG.pingInterval)
                onOpen(event)
            }

            ws.onclose = function (event) {
                clearInterval(pingInterval)
                onClose(event)
                if (autoReconnect) reconnect()
            }

            ws.onmessage = function (event) {
                if (event.data === "pong") {
                    lastPong = Date.now()
                } else {
                    onMessage(event)
                }
            }
        })
        .catch(reconnect)
}


// ----------------------------------------------------------------------------
// sendEvent
//
// Cria estrutura de mensagem de chat, serializa em JSON e envia através
// da conexão WebSocket corrente.
// ----------------------------------------------------------------------------
function sendEvent(chatUserId, text) {
    var messagePayload = { to: chatUserId, text: text }
    ws.send(JSON.stringify(messagePayload))
}