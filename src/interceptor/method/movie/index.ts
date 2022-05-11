/**
 * 随机电影图片功能
 */

import Interceptor from "../../Interceptor";
import { FileBox } from 'wechaty';

const movieInterceptor = new Interceptor("movie", context => {
    context.template.add("movie.success", [
        "{content}",
    ])
    context.template.add("movie.failed", "哎呀，狗蛋没找到合适的电影图片。等会再来试试？")
})
    .title("电影")
    .usage("电影图片")
    .check((context, message) => /^(狗蛋.*)?(电影)/.test(message.text()))
    .handler(async (context, message) => {
        const random = Math.floor(Math.random() * (400 - 1)) + 1;
        const fileBox = FileBox.fromUrl(`https://static.game.kd19.com/fknaolidarenImages/caidianyingmingImages/A0${random}.jpg`)
        await message.say(fileBox)
        return '';
    })

export default movieInterceptor
