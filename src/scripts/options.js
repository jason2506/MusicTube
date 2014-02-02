(function() {
    const ID_PTN = /^[a-zA-Z0-9\-_]{11}$/;
    var bgPage          = chrome.extension.getBackgroundPage(),
        player          = bgPage.player,
        forEach         = Array.prototype.forEach,
        sidebarItems    = document.querySelectorAll('#sidebar li'),
        modeSelectors   = document.querySelectorAll('input[name="playmode"]'),
        importMsg       = document.querySelector('#import-export-page .msg'),
        importTextarea  = document.getElementById('import'),
        importButton    = document.getElementById('submit-import'),
        exportTextarea  = document.getElementById('export'),
        exportButton    = document.getElementById('refresh-export');

    function showMsg(type, msg) {
        importMsg.classList.add(type);
        importMsg.textContent = msg;
    }

    function importPlaylist() {
        var json = importTextarea.value,
            playlist,
            index,
            length,
            id,
            title;

        importMsg.classList.remove('success');
        importMsg.classList.remove('error');
        try {
            playlist = JSON.parse(json);
        }
        catch (error) {
            showMsg('error', 'Imported text is not a valid JSON string.');
            return;
        }

        if (!Array.isArray(playlist)) {
            showMsg('error', 'Imported object must be a array of (id, title) pair.');
            return;
        }

        length = playlist.length;
        for (index ; index < length; index++)
        {
            id = playlist[index].id;
            title = playlist[index].title;
            if (typeof id !== 'string') {
                showMsg('error', 'Video id "' + id + '" is not a string.');
                return;
            }
            else if (!ID_PTN.test(id)) {
                showMsg('error', '"' + id + '" is not a valid video id.');
                return;
            }
            else if (typeof title !== 'string' || title.length === 0) {
                showMsg('error', 'Video title is not valid.');
                return;
            }
        }

        player.import(playlist);
        showMsg('success', 'Import successful.');
    }

    function exportPlaylist() {
        var json = JSON.stringify(player.playlist);
        exportTextarea.value = json;
    }

    function onSidebarItemClicked() {
        var targetId = this.getAttribute('rel'),
            currentSidebarItem = document.querySelector('li.current'),
            currentPage = document.querySelector('div.current');

        if (currentSidebarItem !== null) {
            currentSidebarItem.classList.remove('current');
            currentPage.classList.remove('current');
        }

        document.getElementById(targetId).classList.add('current');
        this.classList.add('current');
    }

    function onPlayModeSelectorClicked() {
        player.playmode(this.value);
    }

    // Sidebar Control
    forEach.call(sidebarItems, function(item) {
        item.addEventListener('click', onSidebarItemClicked);
    });

    sidebarItems[0].click();

    // Player Options
    forEach.call(modeSelectors, function(selector) {
        selector.addEventListener('click', onPlayModeSelectorClicked);
        if (selector.value === player.playmode()) {
            selector.setAttribute('checked', 'true');
        }
    });

    // Export / Import
    exportPlaylist();
    importButton.addEventListener('click', importPlaylist);
    exportButton.addEventListener('click', exportPlaylist);
})();
