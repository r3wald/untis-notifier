#!/usr/bin/env node

const UntisNotifier = require('./src/untis-notifier');
const UnitisFeedClient = require('./src/untis-feed-client');
const Storage = require('./src/storage');

const dotenv = require("dotenv-safe");

dotenv.config();

const storage = new Storage(__dirname + '/storage');
const client = new UnitisFeedClient(process.env.UNTIS_FEED_URL);
const notifier = new UntisNotifier(storage, client);

notifier.go()
    .then(() => {
        console.log('done');
        process.exit(0);
    })
    .catch(error => {
        console.error(error);
        process.exit(0);
    });
