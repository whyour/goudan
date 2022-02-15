import path from "path";

import "./better-console"

import { Wechaty, Message, Contact, WechatyBuilder, ScanStatus } from "wechaty"
import qrcodeTerminal from "qrcode-terminal";

import { mkdirSync } from "./lib/Util";
export const __data_dir = path.join(__dirname, "../data")
export const __interceptor_dir = path.join(__dirname, "./interceptor")
export const __build_dir = __dirname
export const __src_dir = path.join(__dirname, "../src")
mkdirSync(__data_dir)

import { loadBotConfig } from "./lib/BotConfig";
const botConfig = loadBotConfig();

import SqliteTemplate from "./lib/SqliteTemplate";
const sqliteTemplate = new SqliteTemplate(path.join(__data_dir, "./database.db"))
export { sqliteTemplate }

import CallLimiter from "./lib/CallLimiter";
const callLimiter = new CallLimiter(sqliteTemplate)
export { callLimiter }

import Template from "./lib/Template";
const template = new Template()
export { template }

// 给公共模板设置默认值
import "./template"

// 启动http服务器
import server from "./server"
server(botConfig.server.port)

// 引入拦截器
import { mp } from "./interceptor";
import { initCron } from "./lib/Cron";
import { PuppetXp } from "wechaty-puppet-xp";

const wechaty = WechatyBuilder.build({
    name: "Goudan",
    puppet: new PuppetXp(),
})
wechaty.on("scan", (qrcode: string, status: ScanStatus) => {
    if (qrcode) {
        const qrcodeImageUrl = [
            'https://wechaty.js.org/qrcode/',
            encodeURIComponent(qrcode),
        ].join('')
        console.info('StarterBot', 'onScan: %s(%s) - %s', status, qrcodeImageUrl)

        qrcodeTerminal.generate(qrcode, { small: true })  // show qrcode on console
        console.info(`[${status}] ${qrcode}\nScan QR Code above to log in: `)
    } else {
        console.info(`[${status}]`)
    }
})
wechaty.on("login", (user: Contact) => {
    console.log(template.use("on.login", {
        name: `\x1B[43m${user.name()}\x1b[0m`
    }))
    initCron(wechaty);
})
wechaty.on("logout", (user: Contact) => {
    console.log(template.use("on.logout", {
        name: `\x1B[43m${user.name()}\x1b[0m`
    }))
})
wechaty.on("message", async (message: Message) => {
    if (message.self()) return
    await mp.process(message)
})
wechaty.on("error", async (error) => {
    console.error(template.use("on.error"))
    console.error(error)
})
wechaty.start().then(() => {
    console.log(template.use("on.start"))
})
export { wechaty }

const startAt = new Date()
export { startAt }
