var player = new (function(player) {
    var currentPlaying = -1;
    var currentPlayingRemoved = false;

    if (localStorage.playlist == undefined)
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
        if (index == undefined) {
            if (player.attr('src').length > 0)
                player.trigger('readyToPlay');
            else if (this.playlist.length > 0)
                this.play(0);
        }
        else {
            if (!isPlayed[index]) {
                isPlayed[index] = true;
                playedNumber++;
            }

            currentPlaying = index;
            currentPlayingRemoved = false;
            var videoId = this.playlist[index].id;
            $.ajax({
                url: 'http://www.youtube.com/watch?v=' + videoId,
                success: function(data) {
                    var url = fetchVideoUrl(data);
                    player.attr('src', url)
                    player.trigger('readyToPlay');
                }
            });
        }
    }

    this.paused = function() {
        return player[0].paused;
    }

    this.pause = function() {
        player[0].pause();
    }

    this.toggle = function() {
        if (player[0].paused)
            this.play();
        else
            this.pause();
    }

    this.seek = function(percent) {
        player[0].currentTime = player[0].duration * percent;
    }

    this.duration = function() {
        return player[0].duration;
    }

    this.bufferedTime = function() {
        if (player[0].buffered.length == 0)
            return 0;
        return player[0].buffered.end(0);
    }

    this.currentTime = function(seconds) {
        if (seconds == undefined)
            return player[0].currentTime;
        else
            player[0].currentTime = seconds;
    }

    this.volume = function(volume) {
        if (volume == undefined)
            return player[0].volume;
        else
            player[0].volume = volume
    }

    this.toggleMute = function() {
        player[0].muted = !player[0].muted;
    }

    this.muted = function(mute) {
        if (mute == undefined)
            return player[0].muted;
        else
            player[0].muted = mute;
    }

    this.playmode = function(mode) {
        if (mode == undefined)
            return localStorage.playmode || 'repeat';
        else {
            localStorage.playmode = mode;
            if (mode == 'shuffle')
                resetPlayedRecord();
        }
    }

    this.import = function(playlist) {
        this.playlist = playlist;
        localStorage.playlist = JSON.stringify(this.playlist);
    }

    this.add = function(id, title) {
        isPlayed.push(false);

        this.playlist.push({id: id, title: title});
        localStorage.playlist = JSON.stringify(this.playlist);
    }

    this.remove = function(index) {
        isPlayed.splice(index, 1);

        this.playlist.splice(index, 1);
        localStorage.playlist = JSON.stringify(this.playlist);

        currentPlayingRemoved = index == currentPlaying;
        if (currentPlaying >= index)
            currentPlaying--;
    }

    this.move = function(from, to) {
        if (from == currentPlaying)
            currentPlaying = to;
        else if (from < currentPlaying && currentPlaying <= to)
            currentPlaying--;
        else if (to <= currentPlaying && currentPlaying < from)
            currentPlaying++;

        var isTargetPlayed = isPlayed[index];
        isPlayed.splice(from, 1);
        isPlayed.splice(to, 0, isTargetPlayed);

        var target = this.playlist[from];
        this.playlist.splice(from, 1);
        this.playlist.splice(to, 0, target);
        localStorage.playlist = JSON.stringify(this.playlist);
    }

    this.changeTitle = function(index, title) {
        if (title.length == 0) return;

        this.playlist[index].title = title;
        localStorage.playlist = JSON.stringify(this.playlist);
    }

    this.currentIndex = function() {
        return currentPlayingRemoved ? -1 : currentPlaying;
    }

    function resetPlayedRecord() {
        playedNumber = 0;
        for (var index = 0; index < isPlayed.length; index++) {
            isPlayed[index] = false;
        }
    }

    function nextIndex(mode, length) {
        if (length == 0) return -1;

        switch (mode) {
            case 'repeat':
                return (currentPlaying + 1) % length;

            case 'repeat-one':
                return currentPlaying;

            case 'shuffle':
                if (playedNumber == length)
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

