(function() {
    var id = window.location.search.split('v=')[1].split('&')[0];
    var added = false;

    $(document).ready(function() {
        var button = $('<button>')
            .click(add)
            .addClass('yt-uix-button')
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
            .addClass('yt-uix-button-context-light')
            .css({ 'margin-left': '10px' })
            .append(button));
    });

    function appendAddedStyle(button) {
        var bgUrl = 'http://s.ytimg.com/yts/imgbin/www-hitchhiker-vflmnaCdT.png';
        var successImg = $('<img>')
            .addClass('yt-uix-button-icon yt-uix-button-icon-subscribe')
            .attr('src', 'http://s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif')
            .css({
                'background': 'no-repeat url("' + bgUrl + '") -237px -148px',
                'height': '11px',
                'width': '9px'
            });
        button.find('.yt-uix-button-icon-wrapper').append(successImg);
    }

    function add(event) {
        var title = $('meta[name="title"]').attr('content');
        chrome.extension.sendRequest({id: id, title: title});

        if (!added) {
            added = true;
            appendAddedStyle($(this));
        }
    }
})();

