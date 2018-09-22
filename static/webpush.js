
function decodeBase64URL(str) {
    let dec = atob(str.replace(/\-/g, "+").replace(/_/g, "/"));
    let buffer = new Uint8Array(dec.length);
    for (let i = 0; i < dec.length; i++) buffer[i] = dec.charCodeAt(i);
    return buffer;
}

let subscription = null;
//generate_keypair.jsで生成したpublickey
let serverKey = decodeBase64URL("BAgiTcYTfsfz9-mMUgHyDP28gxpbz9g4cpl8yhHtB89yRD-1MaKjQ7O3WywoUMQNZ647hS_LPCzwP0r9JJ1fGMw");

function getRandom() {
    var l = 8;
    var c = "abcdefghjkprstwxyz012345689";
    var cl = c.length;
    var r = "";
    for (var i = 0; i < l; i++) {
        r += c[Math.floor(Math.random() * cl)];
    }
    return r;
}

//サーバに登録するときに二重登録しないように一意なIDを決める
function getTermID() {
    var tid = localStorage.getItem("termid");
    if (tid) return tid;
    tid = getRandom();
    localStorage.setItem("termid", tid);
    return tid;
}


function encodeBase64URL(buffer) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

async function disablePushRequest() {
    /* こんな感じでサーバから消してます。
    var xret = await (await fetch("/push/client/" + getTermID(), {
        credentials: "include",
        method: "DELETE",
        body: "",
        headers: {
            "Content-Type": "application/json"
        }
    })).json();
    console.dir(xret);
    */
}

function requestPushUnsubcription() {
    if (subscription) {
        subscription.unsubscribe();
        subscription = null;
        disablePushRequest();
    }
}

async function registSubscription(sub) {
    if (sub) {
        subscription = sub;
        var ret = {
            endpoint: "",
            p256dh: "",
            auth: "",
            name: getTermID(),
            last_update: Date.now() / 1
        };
        ret.endpoint = sub.endpoint;
        if ("getKey" in sub) {
            try {
                ret.p256dh = encodeBase64URL(sub.getKey("p256dh"));
                ret.auth = encodeBase64URL(sub.getKey("auth"));
            } catch (e) { }
        }
        /*
        こんな感じでサーバに送ります。
        try {
            var xret = await (await fetch("/push/client/" + getTermID(), {
                credentials: "include",
                method: "POST",
                body: JSON.stringify(ret),
                headers: {
                    "Content-Type": "application/json"
                }
            })).json();
            console.dir(xret);
        } catch (ex) {
            console.dir("could not save push info to server");
            console.dir(ex);
        }
        */
        //今回は画面表示
        document.getElementById("endpoint").innerText = ret.endpoint;
        document.getElementById("auth").innerText = ret.auth;
        document.getElementById("p256dh").innerText = ret.p256dh;
        document.getElementById("command").innerText = "node pushtest.js " + ret.endpoint + " " + ret.auth + " " + ret.p256dh;
    } else {
        disablePushRequest();
    }
}

async function requestPushPermission() {
    let registration = null;
    if (navigator.permissions) {
        //permissionsが使えるならPermissionを取得する
        let evt = await navigator.permissions.query({
            name: "push",
            userVisibleOnly: true
        });
        let state = evt.state || evt.status;
        if (state !== "denied") {
            //拒否されなかったら。
            registration = await navigator.serviceWorker.ready;
        }
    } else if (Notification.permission !== "denied") {
        registration = await navigator.serviceWorker.ready;
    }
    //拒否されなかったらnull以外が入ってるはず。
    if (registration != null) {
        let opt = {
            userVisibleOnly: true,
            applicationServerKey: serverKey
        };
        try {
            let sub = await registration.pushManager.subscribe(opt);
            await registSubscription(sub);
        } catch (ex) {
            console.dir(ex);
        }
    }
}

async function serviceWorkerReady(registration) {
    if (registration.pushManager) {
        let sub = await registration.pushManager.getSubscription();
        if (sub == null) {
            Notification.requestPermission(function (permission) {
                if (permission !== "denied") {
                    requestPushPermission();
                }
            });
        } else {
            registSubscription(sub);
        }
    }
}


function init() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js", { scope: "/" });
        navigator.serviceWorker.ready.then(serviceWorkerReady);
    }
}

window.addEventListener("load", init, false);

var $$ = $$ || {};
$$.sw = $$.sw || {};
$$.sw.update = function () {
    navigator.serviceWorker
        .getRegistration()
        .then(function (registration) {
            registration.addEventListener("updatefound", function () {
                console.log("Update Found");
            });
            return registration.update();
        })
        .then(function () {
            console.log("serviceworker update check successed");
        })
        .catch(function (e) {
            console.log("serviceworker update check errored");
        });
};
$$.sw.update();