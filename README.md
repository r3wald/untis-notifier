untis-notifier
==============

Consume data from [untis-feed](https://github.com/r3wald/untis-feed) and send notifications via Telegram.

## Installation

    git checkout ...
    cd untis-notifier
    vi .env
    npm ci
    pm2 start --name untis-notifier npm -- start
