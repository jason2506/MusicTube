var player = new (function(player) {
    var currentPlaying = -1;

    if (typeof localStorage.playlist === 'undefined' ||
        localStorage.playlist === null)
        localStorage.playlist = '[]';
    this.playlist = JSON.parse(localStorage.playlist);

    var playedNumber = 0;
    var isPlayed = new Array(this.playlist.length);
    resetPlayedRecord();

    player.on('readyToPlay', function(event) {
        this.play();
    });

    player.on('ended', this, function(event) {
        var that = event.data;
        var mode = that.playmode();
        var next = nextIndex(mode, that.playlist.length);
        if (next >= 0)
            that.play(next);
        else
            player.attr('src', '');
    });

    this.play = function(index) {
        if (typeof index === 'undefined' || isNaN(index)) {
            if (player.attr('src').length > 0)
                player.trigger('readyToPlay');
            else if (this.playlist.length > 0)
                player.trigger('ended');
        }
        else {
            if (!isPlayed[index]) {
                isPlayed[index] = true;
                playedNumber++;
            }

            currentPlaying = index;
            var videoId = this.playlist[index].id;
            $.ajax({
                url: 'http://www.youtube.com/watch?v=' + videoId,
                success: function(data) {
                    var url = fetchVideoUrl(data);
                    player.attr('src', url);
                    player.trigger('readyToPlay');
                }
            });
        }
    };

    this.paused = function() {
        return player[0].paused;
    };

    this.pause = function() {
        player[0].pause();
    };

    this.toggle = function() {
        if (player[0].paused)
            this.play();
        else
            this.pause();
    };

    this.seek = function(percent) {
        player[0].currentTime = player[0].duration * percent;
    };

    this.duration = function() {
        if (player.attr('src').length === 0)
            return 0;
        return player[0].duration;
    };

    this.bufferedTime = function() {
        if (player.attr('src').length === 0 && player[0].buffered.length === 0)
            return 0;
        return player[0].buffered.end(0);
    };

    this.currentTime = function(seconds) {
        if (player.attr('src').length === 0)
            return 0;
        else if (typeof seconds === 'undefined' || isNaN(seconds))
            return player[0].currentTime;
        else
            player[0].currentTime = seconds;
    };

    this.volume = function(volume) {
        if (typeof volume === 'undefined' || isNaN(volume))
            return player[0].volume;
        else
            player[0].volume = volume;
    };

    this.toggleMute = function() {
        player[0].muted = !player[0].muted;
    };

    this.muted = function(mute) {
        if (typeof mute === 'undefined' || isNaN(mute))
            return player[0].muted;
        else
            player[0].muted = mute;
    };

    this.playmode = function(mode) {
        if (typeof mode === 'undefined' || mode === null)
            return localStorage.playmode || 'repeat';
        else {
            localStorage.playmode = mode;
            if (mode === 'shuffle')
                resetPlayedRecord();
        }
    };

    this.import = function(playlist) {
        this.playlist = playlist;
        localStorage.playlist = JSON.stringify(this.playlist);
    };

    this.add = function(id, title) {
        isPlayed.push(false);

        this.playlist.push({id: id, title: title});
        localStorage.playlist = JSON.stringify(this.playlist);
    };

    this.remove = function(index) {
        index = parseInt(index, 10);
        isPlayed.splice(index, 1);

        this.playlist.splice(index, 1);
        localStorage.playlist = JSON.stringify(this.playlist);

        if (currentPlaying > index) {
            currentPlaying--;
        }
        else if (currentPlaying === index) {
            currentPlaying = -1;
            player.attr('src', '');

            if (!player[0].paused) {
                player[0].pause();
                player.trigger('ended');
            }
        }
    };

    this.contains = function(id) {
        id = parseInt(id, 10);
        for (index = 0; index < this.playlist.length; index++)
            if (this.playlist[index].id === id)
                return true;

        return false;
    };

    this.move = function(from, to) {
        from = parseInt(from, 10);
        to = parseInt(to, 10);

        if (from === currentPlaying)
            currentPlaying = to;
        else if (from < currentPlaying && currentPlaying <= to)
            currentPlaying--;
        else if (to <= currentPlaying && currentPlaying < from)
            currentPlaying++;

        var isTargetPlayed = isPlayed[from];
        isPlayed.splice(from, 1);
        isPlayed.splice(to, 0, isTargetPlayed);

        var target = this.playlist[from];
        this.playlist.splice(from, 1);
        this.playlist.splice(to, 0, target);
        localStorage.playlist = JSON.stringify(this.playlist);
    };

    this.changeTitle = function(index, title) {
        if (typeof title === 'string' && title.length === 0) return;

        this.playlist[index].title = title;
        localStorage.playlist = JSON.stringify(this.playlist);
    };

    this.currentIndex = function() {
        return currentPlaying;
    };

    function resetPlayedRecord() {
        playedNumber = 0;
        for (var index = 0; index < isPlayed.length; index++) {
            isPlayed[index] = false;
        }
    }

    function nextIndex(mode, length) {
        if (length === 0) return -1;

        switch (mode) {
            case 'repeat':
                return (currentPlaying + 1) % length;

            case 'repeat-one':
                return currentPlaying;

            case 'shuffle':
                if (playedNumber === length)
                    resetPlayedRecord();

                var selected;
                do {
                    selected = Math.floor(Math.random() * length);
                } while(isPlayed[selected]);

                return selected;

            default:
                return -1;
        }
    }

    function fetchVideoUrl(content) {
        const fmtStreamMapPattern = /"url_encoded_fmt_stream_map": "([^"]+)"/;
        const fmtUrlParrern = /url=([^&]+)[^,]+&itag=43/;
        var streamMapMatch = fmtStreamMapPattern.exec(content);
        var streamMap = streamMapMatch[1].replace(/\\u0026/g, '&');
        return unescape(fmtUrlParrern.exec(streamMap)[1]);
    }
})($('#player'));

