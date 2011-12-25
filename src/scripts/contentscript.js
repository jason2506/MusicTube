(function() {
    $(document).ready(function() {
        var button = $('<button>')
            .append($('<span>Add to MusicTube</span>')
            .addClass('yt-uix-button-content'))
            .click(add)
            .attr({
                'id': 'playlist-add-button',
                'class': 'yt-uix-tooltip-reverse yt-uix-button yt-uix-tooltip',
                'data-tooltip': 'Add to MusicTube Playlist',
                'data-tooltip-text': 'Add to MusicTube Playlist'
            });
        $('#watch-share').after(button);
    });

    var added = false;
    function add(event) {
        var id = window.location.search.split('v=')[1].split('&')[0];
        var title = $('meta[name="title"]').attr('content');
        chrome.extension.sendRequest({id: id, title: title});

        if (!added) {
            added = true;
            var bgUrl = 'http://s.ytimg.com/yt/imgbin/www-refresh-vflj8-2O7.png';
            var successImg = $('<img>')
                .addClass('yt-uix-button-icon yt-uix-button-icon-subscribe')
                .attr('src', 'http://s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif')
                .css({
                    background: 'no-repeat url("' + bgUrl + '") -109px 0',
                    height: '16px',
                    width: '16px'
                });
            $(this).prepend(successImg);
        }
    }
})();

