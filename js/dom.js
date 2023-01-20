// ----------------------------------------------------------------------------
// forEach
//
// Aplica a função [handler] para cada elemento de [array].
// ----------------------------------------------------------------------------
function forEach(array, handler) {
    for (var i = 0; i < array.length; i++) handler(array[i])
}


// ----------------------------------------------------------------------------
// modify
//
// Aplica a função [modifier] para cada elemento da classe [className].
// ----------------------------------------------------------------------------
function modify(className, modifier) {
    var elements = document.getElementsByClassName(className)
    forEach(elements, modifier)
}


// ----------------------------------------------------------------------------
// setDisplay
//
// Torna cada elemento de [className] visível ou invisível [show true/false].
// ----------------------------------------------------------------------------
function setDisplay(className, show) {
    modify(className, function (element) { element.style.display = show ? "block" : "none" })
}


// ----------------------------------------------------------------------------
// setText
//
// Altera o texto de cada elemento de [className] para [text].
// ----------------------------------------------------------------------------
function setText(className, text) {
    modify(className, function (element) { element.innerText = text })
}


// ----------------------------------------------------------------------------
// clearSelect
//
// Remove todos elemento <option> do elemento [select].
// ----------------------------------------------------------------------------
function clearSelect(select) {
    while (select.options.length > 0) {
        select.remove(0)
    }
}


// ----------------------------------------------------------------------------
// addSelectOption
//
// Adiciona um elemento <option> com value [key] e conteúdo [value] ao elemento
// [select].
// ----------------------------------------------------------------------------
function addSelectOption(select, key, value) {
    var option = document.createElement("option");
    option.value = key;
    option.text = value;
    select.options.add(option)
}


// ----------------------------------------------------------------------------
// appendParagraph
//
// Adiciona um elemento <p> ao elemento [container].
// ----------------------------------------------------------------------------
function appendParagraph(text, container) {
    var p = document.createElement("p")
    p.appendChild(document.createTextNode(text))
    container.appendChild(p)
}