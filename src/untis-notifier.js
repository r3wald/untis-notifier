const nodemailer = require('nodemailer');
const TelegramBot = require("node-telegram-bot-api");
const Storage = require('./storage');

module.exports = class UntisNotifier {

    constructor(storage, feedClient) {
        this.storage = storage;
        this.client = feedClient;
    }

    async go() {
        const storage = new Storage(__dirname + '/../storage');
        let since = storage.read('lastRun');
        const items = await this.client.fetchItems(since);
        console.log(items.length + ' items fetched');
        const changes = items.filter(item => item.typeOfChange === 'U');
        console.log(changes.length + ' changes fetched');
        await this.notifyViaTelegram(changes);
        storage.write('lastRun', new Date());
    }

    async notifyViaTelegram(changes) {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const bot = new TelegramBot(token, {polling: false});
        const chatId = process.env.TELEGRAM_CHAT_ID;
        const message = this.buildMessage(changes)
        await bot.sendMessage(chatId, message);
    }

    async notifyViaMail(changes) {
        // nodemailer.createTransport({)
    }

    filterDuplicates(changes) {
        const result = [];
        return changes.filter(change => {
            if (result.includes(change.resource_id)) {
                return false;
            }
            result.push(change.resource_id);
            return true;
        });
    }

    buildMessage(changes) {
        let result = 'Es gibt folgende Änderungen im Stundenplan:\n';
        changes
            .sort((a, b) => a.readableDate - b.readableDate)
            .forEach(change => {
            result += `Datum: ${change.readableDate}\n`;
            result += `Fach: ${change.resource.su[0].name}\n`;
            result += `Art der Änderung: ${change.message}\n`;
            result += '\n';
        });
        return result;
    }
}

