import Axios, { AxiosResponse } from "axios";
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';
import { getAPIKey } from "../../../lib/APIs/TelegramAPI";

const axios = Axios.create();

export async function getGroupIds() {
  const groupIds = getAPIKey("groupIds");
  return groupIds.split(',');
}

export async function getContactIds() {
  const groupIds = getAPIKey("contactIds");
  return groupIds.split(',');
}

export async function sendBotMessage(content: string) {
  const telegramBotApiHost = getAPIKey("telegramBotApiHost");
  const telegramBotProxyAuth = getAPIKey("telegramBotProxyAuth");
  const telegramBotProxyHost = getAPIKey("telegramBotProxyHost");
  const telegramBotProxyPort = getAPIKey("telegramBotProxyPort");
  const telegramBotToken = getAPIKey("telegramBotToken");
  const telegramBotUserId = getAPIKey("telegramBotUserId");

  const authStr = telegramBotProxyAuth ? `${telegramBotProxyAuth}@` : '';
  const url = `https://${telegramBotApiHost ? telegramBotApiHost : 'api.telegram.org'
    }/bot${telegramBotToken}/sendMessage`;
  let agent = {};
  if (telegramBotProxyHost && telegramBotProxyPort) {
    const options: any = {
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 256,
      maxFreeSockets: 256,
      proxy: `http://${authStr}${telegramBotProxyHost}:${telegramBotProxyPort}`,
    };
    const httpAgent = new HttpProxyAgent(options);
    const httpsAgent = new HttpsProxyAgent(options);
    agent = {
      httpAgent: httpAgent,
      httpsAgent: httpsAgent,
    };
  }
  
  try {
    const res: any = await axios
      .post(url, {
        chat_id: telegramBotUserId,
        text: content,
        disable_web_page_preview: true,
      }, {
        timeout: 10000,
        ...agent,
      });
    return !!res.data.ok;
  } catch (error) {
    console.log(error)
  }
}
