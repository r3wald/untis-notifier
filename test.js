#!/usr/bin/env node

const UntisNotifier = require('./src/untis-notifier');
const UnitisFeedClient = require('./src/untis-feed-client');
const Storage = require('./src/storage');

const dotenv = require("dotenv-safe");
var cron = require('node-cron');

dotenv.config();

const storage = new Storage(__dirname + '/storage');
const client = new UnitisFeedClient(process.env.UNTIS_FEED_URL);
const notifier = new UntisNotifier(storage, client);

cron.schedule('* * * * *', () => {
    notifier.go()
        .then(() => {
            // do nothing
        })
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
});

