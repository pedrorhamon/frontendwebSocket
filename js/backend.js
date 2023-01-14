var BACKEND_CONFIG = {
    baseUrl: "http://localhost:8080"
}


function getTicket(token) {
    const options = {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token }
    }
    return fetch(BACKEND_CONFIG.baseUrl + '/v1/ticket', options)
        .then(response => response.json())
        .then(response => response.ticket)
}