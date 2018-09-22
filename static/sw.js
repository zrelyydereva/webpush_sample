self.addEventListener('install', function(event) {
    //インストール時、タブが全部はけるのを待たない
    event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', function(event) {
    //アクティブ時、すぐに使ってほしいと要求
    event.waitUntil(self.clients.claim());
});

//通知クリック時
self.onnotificationclick = function(event) {
    //actionがないかOpenの時は開く。
    if (!event.action || event.action == "open") {
        //URIがなかったら、index.htmlを充てる。/でもよい
        var uri = event.notification.data.uri || "index.html";
        event.waitUntil(
            Promise.all(
                [].concat(
                    clients
                        .matchAll({
                            type: "window"
                        })
                        .then(function(clientList) {
                            //そのURIを開いているウィンドウを探してfocusする。
                            for (var i = 0; i < clientList.length; i++) {
                                var client = clientList[i];
                                if (client.url.indexOf(uri) >= 0 && "focus" in client) {
                                    return client.focus();
                                }
                            }
                            //なかったら新しいウィンドウを開く
                            if (clients.openWindow) return clients.openWindow(uri);
                        }),
                    event.notification.close()
                )
            )
        );
    } else {
        //それ以外は通知を閉じるだけ
        event.waitUntil(event.notification.close());
    }
    console.log("On notification click: ", event.notification);
};

function showNotification(body, title, icon, uri, tag, vibrate, requireInteraction) {
    //ポップアップの表示
    return self.registration.showNotification(title, {
        icon: icon,
        body: body,
        vibrate: vibrate,
        requireInteraction: requireInteraction,
        renotify: true,
        data: {
            uri: uri
        },
        tag: tag ? tag : Date.now() / 1000,
        actions: [
            {
                action: "open",
                title: "Open"
            },
            {
                action: "dismiss",
                title: "Later"
            }
        ]
    });
}

//pushイベント時
function receivePush(evt) {
    var data = {};
    if (evt.data) {
        data = evt.data.json();
    }
    if (!data.icon) data.icon = "/icon.png";
    if (!data.message) data.message = "通知がありました";
    if (!data.title) data.title = "タイトル";
    if (!data.uri) data.uri = "/";
    if (!data.tag) data.tag = null;
    if (!data.vibrate) data.vibrate = [300, 100, 300, 100, 300];
    data.requireInteraction = true;//クリックするまで閉じない

    if ("showNotification" in self.registration) {
        evt.waitUntil(
            Promise.all([
                showNotification(data.message, data.title, data.icon, data.uri, data.tag, data.vibrate, data.requireInteraction)
            ])
        );
    }
}

self.addEventListener("push", receivePush, false);