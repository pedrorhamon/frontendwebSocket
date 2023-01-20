// ----------------------------------------------------------------------------
// Cria referências aos elementos da interface que serão manipulados.
// ----------------------------------------------------------------------------
var loginButton = document.getElementById("login-button")
var logoutButton = document.getElementById("logout-button")
var connectButton = document.getElementById("connect-button")
var chatUsersSelect = document.getElementById("chat-users-select")
var chatMessageInput = document.getElementById("chat-message-input")
var sendButton = document.getElementById("send-button")
var sendButton = document.getElementById("send-button")
var chatMessagesDiv = document.getElementById("chat-messages-div")



// ----------------------------------------------------------------------------
// init
//
// Realiza processos iniciais pós carregamento da página, como:
// - Verificação se trata-se de um redirect da plataforma Auth0;
// - Verificação do estado da autenticação;
// - Apresenta ou omite áreas de acordo com o estado da autenticação.
// ----------------------------------------------------------------------------
function init() {
    handleRedirectCallback()
        .then(function () { return isAuthenticated() })
        .then(function (authenticated) {
            if (authenticated) window.history.replaceState({}, document.title, "/")
            setDisplay("auth-area", authenticated)
            setDisplay("non-auth-area", !authenticated)
            setDisplay("checking-auth-area", false)
            return authenticated && getUser()
        })
        .then(function (user) { if (user) setText("user-name", user.name) })
        .catch(function (error) {
            console.log("init failed:", error)
            setDisplay("auth-area", false)
            setDisplay("non-auth-area", true)
            setDisplay("checking-auth-area", false)
        })
}


// ----------------------------------------------------------------------------
// onChatUsersWereUpdated
//
// Lida com o recebimento de novos usuários, disponibilizando-os no elemento
// <select> (combo de usuários).
// ----------------------------------------------------------------------------
function onChatUsersWereUpdated(chatUsers) {
    console.log('chat users:', chatUsers)
    clearSelect(chatUsersSelect)
    forEach(chatUsers, function (user) {
        addSelectOption(chatUsersSelect, user.id, user.name)
    })
}


// ----------------------------------------------------------------------------
// onChatMessageWasCreated
//
// Lida com o recebimento de nova mensagem de chat, disponibilizando-a em
// elemento <p> na área de mensagens.
// ----------------------------------------------------------------------------
function onChatMessageWasCreated(chatMessage) {
    console.log('chat message:', chatMessage)
    getUser()
        .then(function (user) { return user.sub })
        .then(function (myUserId) {
            var isMine = chatMessage.from.id === myUserId
            var text = (isMine ? ("Para " + chatMessage.to.name) : "De " + chatMessage.from.name) + ": " + chatMessage.text
            appendParagraph(text, chatMessagesDiv)
            chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight
        })
}


// ----------------------------------------------------------------------------
// onOpen
//
// Função executada quando uma nova conexão WebSocket é realizada.
// ----------------------------------------------------------------------------
function onOpen(event) { console.log('Conexão WebSocket abriu', event) }


// ----------------------------------------------------------------------------
// onClose
//
// Função executada quando a conexão WebSocket corrente é encerrada.
// ----------------------------------------------------------------------------
function onClose(event) { console.log('Conexão WebSocket fechou', event) }



// ----------------------------------------------------------------------------
// onMessage
//
// Função executada quando uma nova mensagem é recebida através da conexão
// WebSocket corrente.
// ----------------------------------------------------------------------------
function onMessage(event) {
    console.log('Evento chegou', event)
    var eventHandlers = {
        CHAT_USERS_WERE_UPDATED: onChatUsersWereUpdated,
        CHAT_MESSAGE_WAS_CREATED: onChatMessageWasCreated
    }
    var eventData = JSON.parse(event.data)
    var eventHandler = eventHandlers[eventData.type]
    if (eventHandler) eventHandler(eventData.payload)
}


// ----------------------------------------------------------------------------
// connect
//
// Conecta via WebSocket, definindo os callbacks para os cenários:
// - Ao abrir conexão (onOpen);
// - Ao fechar conexão (onClose);
// - Ao receber nova mensagem (onMessage).
// ----------------------------------------------------------------------------
function connect() {
    connectWebSocket(onOpen, onClose, onMessage, true).catch(console.log)
}


// ----------------------------------------------------------------------------
// send
//
// Obtém usuário destino e o texto a ser enviado e solicita o envio da
// mensagem. Em seguida limpa o elemento <input>.
// ----------------------------------------------------------------------------
function send() {
    var chatUserId = chatUsersSelect.value
    var text = chatMessageInput.value
    sendEvent(chatUserId, text)
    chatMessageInput.value = ""
}


// ----------------------------------------------------------------------------
// onKeyUp
//
// Função acionada ao detectar o evento keyup do input text de criação de
// mensagens. Aciona função [send] ao detectar a tecla [Enter].
// ----------------------------------------------------------------------------
function onKeyUp(event) {
    if (event.key === "Enter") send()
}


// ----------------------------------------------------------------------------
// Associa funções previamente definidas aos eventos dos elementos.
// ----------------------------------------------------------------------------
loginButton.onclick = login
logoutButton.onclick = logout
connectButton.onclick = connect
sendButton.onclick = send
chatMessageInput.addEventListener("keyup", onKeyUp)
window.onload = init