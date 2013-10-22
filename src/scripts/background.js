chrome.extension.onRequest.addListener(function(request, sender, callback) {
    if (typeof request.title !== 'undefined')
        player.add(request.id, request.title);
    else if (player.contains(request.id))
        callback();
});
