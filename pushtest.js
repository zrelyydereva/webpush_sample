const webpush = require('web-push');
const process = require('process');
//generate_keypairで生成したキーペア
const public_key = 'BAgiTcYTfsfz9-mMUgHyDP28gxpbz9g4cpl8yhHtB89yRD-1MaKjQ7O3WywoUMQNZ647hS_LPCzwP0r9JJ1fGMw';
const private_key = '5IJsdvSCbtNxJCfEdkLwUGCMcSrgLEw4yUb6ruqzC6U';


webpush.setVapidDetails(
    'mailto:example@yourdomain.org',
    public_key,
    private_key
);

const pushSubscription = {
    endpoint: process.argv[2],
    keys: {
        auth: process.argv[3],
        p256dh: process.argv[4]
    }
};

let payload = {
    icon: "",
    message: "Push Test Message",
    title: "Push Test Title",
}
webpush.sendNotification(pushSubscription, JSON.stringify(payload));