var player = new (function(player) {
    var currentPlaying = -1;
    var currentPlayingRemoved = false;

    // Loads playlist from localStorage
    if (localStorage.playlist == undefined)
        localStorage.playlist = '[]';
    this.playlist = JSON.parse(localStorage.playlist);

    player.on('readyToPlay', function(event) {
        this.play();
    });

    player.on('ended', this, function(event) {
        var that = event.data;
        if (that.playlist.length > 0) {
            that.play((currentPlaying + 1) % that.playlist.length);
        }
        else {
            player.attr('src', '');
        }
    });

    // Stores playlist to localStorage when close this page
    $(window).unload(this, function(event) {
        var that = event.data;
        localStorage.playlist = JSON.stringify(that.playlist);
    });

    this.play = function(index) {
        if (index == undefined) {
            if (player.attr('src').length > 0)
                player.trigger('readyToPlay');
            else if (this.playlist.length > 0)
                this.play(0);
        }
        else {
            currentPlaying = index;
            currentPlayingRemoved = false;
            var videoId = this.playlist[index].id;
            $.ajax({
                url: 'http://www.youtube.com/watch?v=' + videoId,
                success: function(data) {
                    var url = fetchVideoId(data);
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

    this.add = function(id, title) {
        this.playlist.push({id: id, title: title});
    }

    this.remove = function(index) {
        this.playlist.splice(index, 1);
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

        var target = this.playlist[from];
        this.playlist.splice(from, 1);
        this.playlist.splice(to, 0, target);
    }

    this.currentIndex = function() {
        return currentPlayingRemoved ? -1 : currentPlaying;
    }

    function fetchVideoId(content) {
        const fmtStreamMapPattern = /"url_encoded_fmt_stream_map": "([^"]+)"/;
        const fmtUrlParrern = /url=([^&]+)[^,]+&itag=43/;
        var streamMapMatch = fmtStreamMapPattern.exec(content);
        var streamMap = streamMapMatch[1].replace(/\\u0026/g, '&');
        return unescape(fmtUrlParrern.exec(streamMap)[1]);
    }
})($('#player'));

