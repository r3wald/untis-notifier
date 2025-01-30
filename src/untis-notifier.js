const nodemailer = require('nodemailer');
const TelegramBot = require("node-telegram-bot-api");
const Storage = require('./storage');

module.exports = class UntisNotifier {

    constructor(storage, feedClient) {
        this.storage = storage;
        this.client = feedClient;
        this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
            polling: false,
            request: {
                agentOptions: {
                    keepAlive: true,
                    family: 4
                }
            }
        });
    }

    async go() {
        const storage = new Storage(__dirname + '/../storage');

        let since = storage.read('lastRun');

        const changes =
                (await this.client.fetchItems(since))
                .filter(item => item.typeOfChange === 'U')
                /*.filter((item, index, items) => {
                    return items.findIndex(item2 => item2.resource_id === item.resource_id) === index;
                })*/;
        const messages = this.buildMessages(changes);
        await this.notifyViaTelegram(messages);
        await this.notifyViaMail(messages);

        storage.write('lastRun', new Date());
        console.log(`since=${since} messages=${messages.length}`);
    }

    async notifyViaTelegram(messages) {
        const chatId = process.env.TELEGRAM_CHAT_ID;
        await messages.forEach(async message => {
            await this.bot.sendMessage(chatId, message);
        });
        return await new Promise(resolve => setTimeout(resolve, 1000));
    }

    async notifyViaMail(messages) {
        // nodemailer.createTransport({)
    }

    buildMessages(changes) {
        return changes
            .sort((a, b) => a.readableDate - b.readableDate)
            .map(change => {
                let result = 'Änderung im Stundenplan:\n';
                result += `Datum: ${change.readableDate}\n`;
                result += `Fach: ${change.resource.su[0].name}\n`;
                result += `${change.message}\n`;
                result += '\n';
                return result;
            });
    }
}

