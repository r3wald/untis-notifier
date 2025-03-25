const nodemailer = require('nodemailer');
const TelegramBot = require("node-telegram-bot-api");
const Storage = require('./storage');
const moment = require('moment');

module.exports = class UntisNotifier {

    constructor(storage, feedClient) {
        this.storage = storage;
        this.client = feedClient;
        moment.locale('de-de');
    }

    async go() {
        const storage = new Storage(__dirname + '/../storage');

        let since = storage.read('lastRun');

        const changes = (await this.client.fetchItems(since))
                .filter(item => item.typeOfChange === 'U')
                .map(item => {
                    item.readableDate = moment(item.readableDate);
                    item.message = item.message.replace(/<[^>]*>?/gm, '');
                    return item;
                })
                .sort((a, b) => a.readableDate.valueOf() - b.readableDate.valueOf())
                .map(item => {
                    const link = "http://zentrale.fritz.box:3001/feed/" + item.id;
                    console.log(`${link} "${item.message}"`);
                    return item;
                })
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
        const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
            polling: false,
            request: {
                agentOptions: {
                    keepAlive: true,
                    family: 4
                }
            }
        });
        const chatIds = process.env.TELEGRAM_CHAT_IDS.split(',');
        await messages.forEach(async message => {
            await chatIds.forEach(async chatId => {
                await bot.sendMessage(chatId, message, {parse_mode: "HTML"});
            }
        });
        return await new Promise(resolve => setTimeout(resolve, 1000));
    }

    async notifyViaMail(messages) {
        // nodemailer.createTransport({)
    }

    buildMessages(changes) {
        return changes
            .map(change => {
                moment.locale('de');
                console.log(moment.locale());
                console.log(moment.locale('de'));
                console.log(moment.locale());
                const subject = change.resource.su[0].longname;
                let result = 'Änderung im Stundenplan:\n';
                result += '<b>' + change.readableDate.format('L') + ' ' + change.readableDate.format('LT') + ' ' + subject + '</b>\n';
                result += '<b>' + change.message + '</b>\n';
                return result;
            });
    }
}

