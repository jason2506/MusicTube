(function() {
    var bgPage = chrome.extension.getBackgroundPage();
    var player = bgPage.player;
    var components = {
        progress:   $('#progress'),
        mute:       $('#mute'),
        volume:     $('#volume-range'),
        time:       $('#time'),
        toggle:     $('#toggle'),
        playlist:   $('#playlist')
    };

    displayPlaylist();
    startListenEvent();
    startUpdate();

    function displayPlaylist () {
        var playlist = player.playlist;
        for (var index = 0; index < playlist.length; index++) {
            appendPlaylistItem(index + 1, playlist[index].title);
        }
    }

    function appendPlaylistItem(index, title) {
        var item = $('<li>')
            .attr('index', index)
            .dblclick(function() {
                var index = $(this).attr('index') - 1;
                player.play(index);
            });

        var itemTitle = $('<span>').addClass('title').text(title);
        item.append(itemTitle);

        var deleteButton = $('<img>')
            .attr('src', 'icons/remove.png')
            .addClass('remove')
            .click(function() {
                var index = $(this).parent().attr('index') - 1;
                player.remove(index);
                removePlaylistItem(index);
            });
        item.append(deleteButton);

        components.playlist.append(item);
    }

    function removePlaylistItem(index) {
        var items = components.playlist.children();
        $(items[index]).remove();
        for ( ; index <= player.playlist.length; index++) {
            $(items[index]).attr('index', index);
        }
    }

    function startListenEvent() {
        components.progress.click(function(event) {
            var percent = (event.pageX - $(this).offset().left) / $(this).width();
            player.seek(percent);
        });

        components.toggle.click(function(event) {
            player.toggle();
        });

        components.mute.click(function(event) {
            player.toggleMute();
            updateVolume();
            updateMute();
        });

        components.volume.change(function(event) {
            var volume = $(this).val();
            player.volume(volume);
            if (volume > 0)
                player.muted(false);
            updateMute();
        });
    }

    function startUpdate() {
        function update() {
            updateProgress();
            updateToggleButton();
            updateTime();
            updatePlaylist();
        }

        updateVolume();
        updateMute();
        update();
        setInterval(update, 500);
    }

    function updateVolume() {
        var volume = player.muted() ? 0 : player.volume();
        components.volume.val(volume);
    }

    function updateMute() {
        var muted = player.muted() || (player.volume() == 0);
        var url = 'icons/' + (muted ? 'mute' : 'volume') + '.png';
        components.mute.attr('src', url);
    }

    function updateProgress() {
        var width = 300;
        var height = components.progress.height() * 50;

        var currentTime = player.currentTime();
        var bufferedTime = player.bufferedTime();
        var duration = player.duration();

        var ctx = components.progress[0].getContext("2d");
        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = "#999";
        ctx.fillRect(0, 0, width * bufferedTime / duration, height);
        ctx.fillStyle = "#49F";
        ctx.fillRect(0, 0, width * currentTime / duration, height);
    }

    function updateToggleButton() {
        var url = 'icons/' + (player.paused() ? 'play' : 'pause') + '.png';
        components.toggle.attr('src', url);
    }

    function updateTime() {
        var currentTime = player.currentTime();
        var duration = player.duration() || 0;
        var text = timeToText(currentTime) + ' / ' + timeToText(duration);
        components.time.text(text);
    }

    function timeToText(seconds) {
        var minutes;
        minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);

        var text = '';
        if (minutes < 10) { text += '0'; }
        text += minutes + ':';
        if (seconds < 10) { text += '0'; }
        text += seconds;
        return text;
    }

    function updatePlaylist() {
        var items = components.playlist.children();
        var currentIndex = player.currentIndex();
        for (var index = 0; index < items.length; index++)
        {
            if (index == currentIndex)
                $(items[index]).addClass('current');
            else
                $(items[index]).removeClass('current');
        }
    }
})();

