# webpush sample 

## 設定
```
$ node generate_keypair.js
```
とすると、キーペアが生成されます。
```
{ publicKey:
   'BAgiTcYTfsfz9-mMUgHyDP28gxpbz9g4cpl8yhHtB89yRD-1MaKjQ7O3WywoUMQNZ647hS_LPCzwP0r9JJ1fGMw',
  privateKey: '5IJsdvSCbtNxJCfEdkLwUGCMcSrgLEw4yUb6ruqzC6U' }
```
これらを、pushtest.jsと、static/webpush.jsにそれぞれコピペしてください。

## 起動
コピペしたら、
```
http-server static
```
などでhttp serverを起動します。

## ブラウザで表示
ブラウザで表示すると、Push通知を行うかの確認が表示さます。

許可を行うと、Endpoint,Auth,P256dhそれぞれが表示され、「↓コマンドプロンプト、ターミナルにコピペ↓」の下に、ターミナルにコピペするための行が表示されます。

ターミナルにコピペすると、たぶんあなたのブラウザに通知が飛ぶはずです。

## 詳細
pushtest.jsにペイロードがそのまま書いてあるので、適当に変えてみてください。

ペイロードの扱いは、webpush.jsのshowNotificationにあります。

