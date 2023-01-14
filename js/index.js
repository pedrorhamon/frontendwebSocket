function modify(className, modifier) {
    var elements = document.getElementsByClassName(className)
    for (var i = 0; i < elements.length; i++) {
        modifier(elements[i])
    }
}

function setDisplay(className, show) {
    modify(className, function (element) { element.style.display = show ? "block" : "none" })
}

function setText(className, text) {
    modify(className, function (element) { element.innerText = text })
}

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

function logJwt() {
    getJwt().then(console.log)
}

function logTicket() {
    getJwt()
        .then(getTicket)
        .then(console.log)
}

function connectWithoutTicket() {
    var ws = new WebSocket("ws://localhost:8080/chat")
    ws.onopen = function () { console.log('Conexão WebSocket abriu') }
    ws.onclose = function () { console.log('Conexão WebSocket fechou') }
}

function connectWithTicket() {
    getJwt()
        .then(getTicket)
        .then(function (ticket) {
            var ws = new WebSocket("ws://localhost:8080/chat?ticket=" + ticket)
            ws.onopen = function () { console.log('Conexão WebSocket abriu') }
            ws.onclose = function () { console.log('Conexão WebSocket fechou') }
        })
}

var loginButton = document.getElementById("login-button")
var logoutButton = document.getElementById("logout-button")
var getJwtButton = document.getElementById("get-jwt-button")
var getTicketButton = document.getElementById("get-ticket-button")
var connectWithoutTicketButton = document.getElementById("connect-without-ticket-button")
var connectWithTicketButton = document.getElementById("connect-with-ticket-button")

loginButton.onclick = login
logoutButton.onclick = logout
getJwtButton.onclick = logJwt
getTicketButton.onclick = logTicket
connectWithoutTicketButton.onclick = connectWithoutTicket
connectWithTicketButton.onclick = connectWithTicket

window.onload = init