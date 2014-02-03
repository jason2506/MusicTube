var createPlayer = function(playerElem) {
    const FMT_STREAM_MAP_PTN = /"url_encoded_fmt_stream_map": "([^"]+)"/;
    const INFO_PTN = /[^,]*itag=43[^,]*/;
    const URL_PTN = /url=([^&,]+)/;
    const ENCODED_SIG_PTN = /s=([^&,]+)/;
    const SIG_PTN = /sig=([^&,]+)/;

    var player = {},
        currentPlaying = -1,
        playedCount = 0,
        playedList;

    function resetPlayedRecord() {
        var index = 0,
            length = playedList.length;

        playedCount = 0;
        for ( ; index < length; index++) {
            playedList[index] = false;
        }
    }

    function trigger(target, eventName) {
        var event = new CustomEvent(eventName);
        target.dispatchEvent(event);
    }

    function nextIndex(mode, length) {
        var selected;
        if (length === 0) { return -1; }

        switch (mode) {
            case 'repeat':
                return (currentPlaying + 1) % length;

            case 'repeat-one':
                return currentPlaying;

            case 'shuffle':
                if (playedCount === length) {
                    resetPlayedRecord();
                }

                do {
                    selected = Math.floor(Math.random() * length);
                } while(playedList[selected]);

                return selected;

            default:
                return -1;
        }
    }

    function decodeSig(s) {
        s = s[22] + s.slice(4, 22) + s[3] + s.slice(23, 38) + s[0] +
            s.slice(39, 65) + s[83] + s.slice(66, 83) + s[65];
        return s.split('').reverse().join('');
    }

    function fetchVideoUrl(content) {
        var streamMapMatch = FMT_STREAM_MAP_PTN.exec(content),
            streamMap = streamMapMatch[1].replace(/\\u0026/g, '&'),
            info = INFO_PTN.exec(streamMap)[0],
            url = URL_PTN.exec(info)[1],
            sigMatch;

        url = decodeURIComponent(url);
        if ((sigMatch = SIG_PTN.exec(info)) !== null) {
            url += '&signature=' + sigMatch[1];
        }
        else if ((sigMatch = ENCODED_SIG_PTN.exec(info)) !== null) {
            url += '&signature=' + decodeSig(sigMatch[1]);
        }

        return url;
    }

    player.play = function(index) {
        var videoSrc,
            videoId,
            request;
        if (typeof index === 'undefined' || isNaN(index)) {
            videoSrc = playerElem.getAttribute('src');
            if (videoSrc.length) {
                trigger(playerElem, 'readyToPlay');
            }
            else if (player.playlist.length) {
                trigger(playerElem, 'ended');
            }
        }
        else {
            if (!playedList[index]) {
                playedList[index] = true;
                playedCount++;
            }

            currentPlaying = index;
            videoId = player.playlist[index].id;

            request = new XMLHttpRequest();
            request.onload = function() {
                var url = fetchVideoUrl(this.response);
                playerElem.setAttribute('src', url);
                trigger(playerElem, 'readyToPlay');
            };

            request.open('GET', 'https://www.youtube.com/watch?v=' + videoId, true);
            request.send();
        }
    };

    player.paused = function() {
        return playerElem.paused;
    };

    player.pause = function() {
        playerElem.pause();
    };

    player.toggle = function() {
        if (playerElem.paused)  { player.play(); }
        else                    { player.pause(); }
    };

    player.seek = function(percent) {
        playerElem.currentTime = playerElem.duration * percent;
    };

    player.duration = function() {
        var src = playerElem.getAttribute('src');
        if (!src.length) {
            return 0;
        }

        return playerElem.duration;
    };

    player.bufferedTime = function() {
        var src = playerElem.getAttribute('src');
        if (!src.length || !playerElem.buffered.length) {
            return 0;
        }

        return playerElem.buffered.end(0);
    };

    player.currentTime = function(seconds) {
        var src = playerElem.getAttribute('src');
        if (src.length === 0) {
            return 0;
        }
        else if (typeof seconds === 'undefined' || isNaN(seconds)) {
            return playerElem.currentTime;
        }
        else {
            playerElem.currentTime = seconds;
        }
    };

    player.volume = function(volume) {
        if (typeof volume === 'undefined' || isNaN(volume)) {
            return playerElem.volume;
        }
        else {
            playerElem.volume = volume;
        }
    };

    player.toggleMute = function() {
        playerElem.muted = !playerElem.muted;
    };

    player.muted = function(mute) {
        if (typeof mute === 'undefined' || isNaN(mute)) {
            return playerElem.muted;
        }
        else {
            playerElem.muted = mute;
        }
    };

    player.playmode = function(mode) {
        if (typeof mode === 'undefined' || mode === null) {
            return localStorage.playmode || 'repeat';
        }
        else {
            localStorage.playmode = mode;
            if (mode === 'shuffle') {
                resetPlayedRecord();
            }
        }
    };

    player.import = function(playlist) {
        player.playlist = playlist;
        localStorage.playlist = JSON.stringify(player.playlist);
    };

    player.add = function(id, title) {
        if (player.contains(id)) { return; }

        playedList.push(false);
        player.playlist.push({id: id, title: title});
        localStorage.playlist = JSON.stringify(player.playlist);
    };

    player.remove = function(index) {
        index = parseInt(index, 10);
        playedList.splice(index, 1);

        player.playlist.splice(index, 1);
        localStorage.playlist = JSON.stringify(player.playlist);

        if (currentPlaying > index) {
            currentPlaying--;
        }
        else if (currentPlaying === index) {
            currentPlaying = -1;
            playerElem.setAttribute('src', '');
            if (!playerElem.paused) {
                playerElem.pause();
                trigger(playerElem, 'ended');
            }
        }
    };

    player.contains = function(id) {
        var index = 0,
            length = player.playlist.length;
        for ( ; index < length; index++) {
            if (player.playlist[index].id === id) {
                return true;
            }
        }

        return false;
    };

    player.move = function(from, to) {
        var isTargetPlayed = playedList[from],
            target = player.playlist[from];

        from = parseInt(from, 10);
        to = parseInt(to, 10);

        if (from === currentPlaying) {
            currentPlaying = to;
        }
        else if (from < currentPlaying && currentPlaying <= to) {
            currentPlaying--;
        }
        else if (to <= currentPlaying && currentPlaying < from) {
            currentPlaying++;
        }

        playedList.splice(from, 1);
        playedList.splice(to, 0, isTargetPlayed);

        player.playlist.splice(from, 1);
        player.playlist.splice(to, 0, target);
        localStorage.playlist = JSON.stringify(player.playlist);
    };

    player.changeTitle = function(index, title) {
        if (typeof title === 'string' && title.length === 0) { return; }

        player.playlist[index].title = title;
        localStorage.playlist = JSON.stringify(player.playlist);
    };

    player.currentIndex = function() {
        return currentPlaying;
    };

    playerElem.addEventListener('readyToPlay', function() {
        this.play();
    });

    playerElem.addEventListener('ended', function() {
        var mode = player.playmode(),
            next = nextIndex(mode, player.playlist.length);
        if (next >= 0)  { player.play(next); }
        else            { playerElem.setAttribute('src', ''); }
    });

    if (typeof localStorage.playlist === 'undefined' ||
        localStorage.playlist === null) {
        localStorage.playlist = '[]';
    }

    player.playlist = JSON.parse(localStorage.playlist);
    playedList = new Array(player.playlist.length);
    resetPlayedRecord();

    return player;
};
