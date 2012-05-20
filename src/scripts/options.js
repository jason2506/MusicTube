(function() {
    var bgPage = chrome.extension.getBackgroundPage();
    var player = bgPage.player;
    var componments = {
        sidebarItems:       $('#sidebar li'),

        playmodeSelectors:  $('input[name=playmode]:radio'),

        importResultMsg:    $('#import-export-page .msg'),
        importTextarea:     $('#import'),
        importButton:       $('#submit-import'),
        exportTextarea:     $('#export'),
        exportButton:       $('#refresh-export')
    };

    /*
     * Sidebar Control
     */
    componments.sidebarItems.click(function() {
        $('.current').removeClass('current');

        var targetId = $(this).attr('rel');
        $(this).addClass('current');
        $('#' + targetId).addClass('current');
    });

    $(componments.sidebarItems[0]).click();

    /*
     * Player Options
     */
    componments.playmodeSelectors.each(function() {
        var mode = player.playmode();
        if ($(this).val() === mode)
            $(this).attr('checked', 'true');
    });

    componments.playmodeSelectors.click(function() {
        var mode = $(this).val();
        player.playmode(mode);
    });

    /*
     * Export / Import
     */
    exportPlaylist();
    componments.importButton.click(importPlaylist);
    componments.exportButton.click(exportPlaylist);

    function importPlaylist() {
        var msg = componments.importResultMsg;
        msg.removeClass('success error');

        var json = componments.importTextarea.val();
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
        var playlist = [];
        for (var index = 0; index < result.length; index++)
        {
            var id = result[index].id;
            var title = result[index].title;

            if (typeof id !== 'string') {
                msg.addClass('error')
                    .text('The video id "' + id + '" is not a string.');
                return;
            }
            else if (!idPattern.test(id)) {
                msg.addClass('error')
                    .text('"' + id + '" is not a valid video id.');
                return;
            }
            else if (typeof title !== 'string' || title.length === 0) {
                msg.addClass('error')
                    .text('The video title is not valid.');
                return;
            }

            playlist.push({
                id: result[index].id,
                title: result[index].title
            });
        }

        player.import(playlist);
        msg.addClass('success').text('Import successful.');
    }

    function exportPlaylist() {
        var json = JSON.stringify(player.playlist);
        componments.exportTextarea.val(json);
    }
})();
