(function() {
    var bgPage = chrome.extension.getBackgroundPage();
    var player = bgPage.player;

    /*
     * Player Options
     */

    /*
     * Export / Import
     */
    exportPlaylist();
    $('#submit-import').click(importPlaylist);
    $('#refresh-export').click(exportPlaylist);

    $('#sidebar li').click(function() {
        $('.current').removeClass('current');

        var targetId = $(this).attr('rel');
        $(this).addClass('current');
        $('#' + targetId).addClass('current');
    });

    $('#sidebar li:first').click();

    function importPlaylist() {
        var msg = $('#import-export-page .msg');
        msg.removeClass('success error');

        var json = $('#import').val();
        var result;
        try {
            result = JSON.parse(json);
        }
        catch (error) {
            msg.addClass('error')
                .text('The imported text is not a valid JSON string.');
            return;
        }

        if (!$.isArray(result)) {
            msg.addClass('error')
                .text('The imported object is not a array of video id-title pair.');
            return;
        }

        const idPattern = /^[a-zA-Z0-9\-_]{11}$/;
        var playlist = new Array();
        for (var index = 0; index < result.length; index++)
        {
            var id = result[index].id;
            var title = result[index].title;

            if (typeof id != 'string') {
                msg.addClass('error')
                    .text('The video id "' + id + '" is not a string.');
                return;
            }
            else if (!idPattern.test(id)) {
                msg.addClass('error')
                    .text('"' + id + '" is not a valid video id.');
                return;
            }
            else if (typeof title != 'string' || title.length == 0) {
                msg.addClass('error')
                    .text('The video title is not valid.');
                return;
            }

            playlist.push({
                id: result[index].id,
                title: result[index].title
            });
        }

        player.playlist = playlist;
        msg.addClass('success').text('Import successful.');
    }

    function exportPlaylist() {
        var json = JSON.stringify(player.playlist);
        $('#export').val(json);
    }
})();
