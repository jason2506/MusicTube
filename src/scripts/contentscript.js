(function() {
    var id = window.location.search.split('v=')[1].split('&')[0];
    var added = false;

    $(document).ready(function() {
        var button = $('<button>')
            .append($('<span>Add to MusicTube</span>')
            .addClass('yt-uix-button-content'))
            .click(add)
            .attr({
                'id': 'playlist-add-button',
                'class': 'yt-uix-tooltip-reverse yt-uix-button yt-uix-button-default yt-uix-tooltip',
                'data-tooltip': 'Add to MusicTube Playlist',
                'data-tooltip-text': 'Add to MusicTube Playlist'
            });

        chrome.extension.sendRequest({id: id}, function() {
            added = true;
            appendAddedStyle(button);
        });

        $('#watch-share').after(button);
    });

    function appendAddedStyle(button) {
        var bgUrl = 'http://s.ytimg.com/yt/imgbin/www-refresh-vflj8-2O7.png';
        var successImg = $('<img>')
            .addClass('yt-uix-button-icon yt-uix-button-icon-subscribe')
            .attr('src', 'http://s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif')
            .css({
                background: 'no-repeat url("' + bgUrl + '") -109px 0',
                height: '16px',
                width: '16px'
            });
        button.prepend(successImg);
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

