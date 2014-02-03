const PAGE_URL_PTN = /^http(s?):\/\/www\.youtube\.com\/watch/;

var added = false;

function appendAddedStyle(button) {
    var successImg = document.createElement('img'),
        successImgUrl = 'http://s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif';

    successImg.classList.add('yt-uix-button-icon');
    successImg.classList.add('yt-uix-button-icon-subscribe');
    successImg.setAttribute('src', successImgUrl);

    button.classList.remove('yt-uix-button-subscribe-branded');
    button.classList.add('yt-uix-button-subscribed-branded');
    button.querySelector('.yt-uix-button-icon-wrapper').appendChild(successImg);

    added = true;
}

function createButton() {
    var button = document.createElement('button'),
        container = document.createElement('span');

    button.classList.add('yt-uix-button');
    button.classList.add('yt-uix-button-subscribe-branded');
    button.setAttribute('type', 'button');
    button.setAttribute('rule', 'button');
    button.setAttribute('style', 'height: 24px; padding: 0 6px');
    button.addEventListener('click', function() {
        var id = window.location.search.split('v=')[1].split('&')[0],
            title = document.getElementById('eow-title').getAttribute('title');
        chrome.extension.sendRequest({ id: id, title: title });
        if (!added) { appendAddedStyle(this); }
    });

    button.innerHTML =
        '<span class="yt-uix-button-icon-wrapper"></span>' +
        '<span class="yt-uix-button-content">Add to MusicTube</span>';

    container.id = 'watch7-addmusic-container';
    container.classList.add('yt-uix-button-context-light');
    container.setAttribute('style', 'margin-left: 10px');
    container.appendChild(button);
    return container;
}

function ready() {
    if (!PAGE_URL_PTN.test(window.location.href)) {
        return;
    }

    var id = window.location.search.split('v=')[1].split('&')[0],
        button = createButton(),
        buttonBefore = document.getElementById('watch7-views-info');

    added = false;
    chrome.extension.sendRequest({ id: id }, function() {
        appendAddedStyle(button.childNodes[0]);
    });

    buttonBefore.parentNode.insertBefore(button, buttonBefore);
}

setInterval(function() {
    var container = document.getElementById('watch7-addmusic-container'),
        containerBefore = document.getElementById('watch7-views-info');
    if (containerBefore !== null && container === null) {
        ready();
    }
}, 500);

ready();
