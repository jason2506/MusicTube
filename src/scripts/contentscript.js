(function() {

const pageUrlPattern = /^http(s?):\/\/www\.youtube\.com\/watch/;

function main() {
    if (!pageUrlPattern.test(window.location.href)) {
        return;
    }

    var added = false;
    var id = window.location.search.split('v=')[1].split('&')[0];
    var button = $('<button>')
        .click(function (event) {
            var title = $('#eow-title').attr('title');
            chrome.extension.sendRequest({id: id, title: title});

            if (!added) {
                added = true;
                appendAddedStyle($(this));
            }
        })
        .addClass('yt-uix-button')
        .addClass('yt-uix-button-subscribe-branded')
        .attr({
            'type': 'button',
            'role': 'button'
        })
        .css({
            'height': '24px',
            'padding': '0 6px'
        })
        .append($('<span>')
            .addClass('yt-uix-button-icon-wrapper'))
        .append($('<span>')
            .text('Add to MusicTube')
            .addClass('yt-uix-button-content'))
            .css({ 'padding': '0 6px' });

    chrome.extension.sendRequest({ 'id': id }, function() {
        added = true;
        appendAddedStyle(button);
    });

    $('#watch7-views-info').before($('<span>')
        .attr({ 'id': 'watch7-addmusic-container' })
        .addClass('yt-uix-button-context-light')
        .css({ 'margin-left': '10px' })
        .append(button));
}

function appendAddedStyle(button) {
    button
        .removeClass('yt-uix-button-subscribe-branded')
        .addClass('yt-uix-button-subscribed-branded');

    var bgUrl = 'http://s.ytimg.com/yts/imgbin/www-hitchhiker-vflmnaCdT.png';
    var successImg = $('<img>')
        .addClass('yt-uix-button-icon yt-uix-button-icon-subscribe')
        .attr('src', 'http://s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif');
    button.find('.yt-uix-button-icon-wrapper').append(successImg);
}

$(document).ready(function() {
    setInterval(function() {
        var container = document.getElementById('watch7-addmusic-container');
        var containerBefore = document.getElementById('watch7-views-info');
        if (containerBefore !== null && container === null) {
            main();
        }
    }, 500);

    main();
});

})();

