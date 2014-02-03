(function() {
    var forEach     = Array.prototype.forEach,
        bgPage      = chrome.extension.getBackgroundPage(),
        player      = bgPage.player,
        progress    = document.getElementById('progress'),
        mute        = document.getElementById('mute'),
        volume      = document.getElementById('volume-range'),
        time        = document.getElementById('time'),
        toggle      = document.getElementById('toggle'),
        playlist    = document.getElementById('playlist');

    function addEventListener(targets, eventName, callback) {
        forEach.call(targets, function(target) {
            target.addEventListener(eventName, callback);
        });
    }

    function displayPlaylist() {
        var indexOf = Array.prototype.indexOf,
            length = player.playlist.length,
            index = 0;
        for ( ; index < length; index++) {
            appendPlaylistItem(index + 1, player.playlist[index].title);
        }

        new Sortable(playlist, {
            onUpdate: function(event) {
                var items = playlist.childNodes,
                    from = event.item.getAttribute('index') - 1,
                    to = indexOf.call(items, event.item),
                    step = from > to ? -1 : 1,
                    index = from;
                for ( ; index !== to; index += step) {
                    items[index].setAttribute('index', index + 1);
                }

                event.item.setAttribute('index', to + 1);
                player.move(from, to);
            }
        });
    }

    function appendPlaylistItem(index, title) {
        var item = document.createElement('li');
        item.setAttribute('index', index);
        item.innerHTML = '<span class="title">' + title + '</span>' +
            '<img src="icons/remove.png" class="remove">';

        playlist.appendChild(item);
    }

    function removePlaylistItem(index) {
        var items = playlist.childNodes,
            length = player.playlist.length;
        items[index].parentNode.removeChild(items[index]);
        for ( ; index <= length; index++) {
            items[index - 1].setAttribute('index', index);
        }
    }

    function startListenEvent() {
        var items = playlist.getElementsByTagName('li'),
            titles = playlist.getElementsByClassName('title'),
            removes = playlist.getElementsByClassName('remove');

        progress.addEventListener('click', function(event) {
            var percent = (event.pageX - this.offsetLeft) / this.offsetWidth;
            player.seek(percent);
        });

        toggle.addEventListener('click', player.toggle);

        mute.addEventListener('click', function() {
            player.toggleMute();
            updateVolume();
            updateMute();
        });

        volume.addEventListener('change', function() {
            var volume = this.value;
            player.volume(volume);
            if (volume > 0) {
                player.muted(false);
            }

            updateMute();
        });

        addEventListener(items, 'dblclick', function() {
            console.log('hello');
            var index = this.getAttribute('index') - 1;
            player.play(index);
        });

        addEventListener(titles, 'dblclick', function(event) {
            event.stopPropagation();
        });

        addEventListener(titles, 'mousedown', function() {
            this.classList.add('edit');
            this.setAttribute('contentEditable', 'true');
        });

        addEventListener(titles, 'keypress', function(event) {
            if (event.keyCode === 13) {
                this.blur();
            }
        });

        addEventListener(titles, 'blur', function() {
            var index = this.parentNode.getAttribute('index') - 1,
                title = this.textContent;

            this.classList.remove('edit');
            this.setAttribute('contentEditable', 'false');
            this.scrollLeft = 0;

            player.changeTitle(index, title);
            this.textContent = player.playlist[index].title;
        });

        addEventListener(removes, 'click', function() {
            var index = this.parentNode.getAttribute('index') - 1;
            player.remove(index);
            removePlaylistItem(index);
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
        volume.value = volume;
    }

    function updateMute() {
        var muted = player.muted() || (player.volume() === 0),
            url = 'icons/' + (muted ? 'mute' : 'volume') + '.png';
        mute.setAttribute('src', url);
    }

    function updateProgress() {
        var width = 300,
            height = progress.offsetHeight * 50,
            currentTime = player.currentTime(),
            bufferedTime = player.bufferedTime(),
            duration = player.duration(),
            ctx = progress.getContext('2d');

        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = '#999';
        ctx.fillRect(0, 0, width * bufferedTime / duration, height);
        ctx.fillStyle = '#49F';
        ctx.fillRect(0, 0, width * currentTime / duration, height);
    }

    function updateToggleButton() {
        var url = 'icons/' + (player.paused() ? 'play' : 'pause') + '.png';
        toggle.setAttribute('src', url);
    }

    function updateTime() {
        var currentTime = player.currentTime(),
            duration = player.duration() || 0,
            text = timeToText(currentTime) + ' / ' + timeToText(duration);
        time.textContent = text;
    }

    function timeToText(seconds) {
        var minutes, text = '';
        minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        if (minutes < 10) { text += '0'; }
        text += minutes + ':';
        if (seconds < 10) { text += '0'; }
        text += seconds;
        return text;
    }

    function updatePlaylist() {
        var currentIndex = player.currentIndex() + 1;
        forEach.call(playlist.childNodes, function(item) {
            if (parseInt(item.getAttribute('index'), 10) === currentIndex) {
                item.classList.add('current');
            }
            else {
                item.classList.remove('current');
            }
        });
    }

    displayPlaylist();
    startListenEvent();
    startUpdate();
})();
