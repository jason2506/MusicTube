var player = createPlayer(document.getElementById('player'));
chrome.extension.onMessage.addListener(function(message, sender, callback) {
    if (typeof message.title !== 'undefined') {
        player.add(message.id, message.title);
    }
    else if (player.contains(message.id)) {
        callback();
    }
});
