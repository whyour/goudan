import Axios, { AxiosResponse } from "axios";
import { exec } from 'child_process';

import { getAPIKey } from "../../../lib/APIs/TelegramAPI";

const axios = Axios.create();

export async function getGroupIds() {
  const groupIds = getAPIKey("groupIds");
  return groupIds.split(',');
}

export async function sendBotMessage(content: string) {
  const telegramBotProxy = getAPIKey("telegramBotProxy");
  const telegramBotToken = getAPIKey("telegramBotToken");
  const telegramBotUserId = getAPIKey("telegramBotUserId");

  try {
    exec(`curl -s -x ${telegramBotProxy} -X POST https://api.telegram.org/bot${telegramBotToken}/sendMessage -F chat_id=${telegramBotUserId} -F text=${content}`, (err, stdout, stderr) => {
      if (err || stderr) {
        console.log(`转发tg消息失败：${err || stderr}`)
      }
    })
  } catch (error) {
    console.log(error)
  }
}
