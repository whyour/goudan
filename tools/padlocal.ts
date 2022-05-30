// @ts-nocheck
import puppeteer from 'puppeteer';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import http from 'http';

async function getToken() {
  return new Promise((resolve, reject) => {
    const url = `http://www.yhc2021.com:81/login?username=${process.env.PADUSER}&password=${process.env.PADPWD}`;
    axios.get(url).then(res => {
      console.log('token', res.data);
      if (res.data.code === '0') {
        resolve(res.data.token);
      }
    }).finally(() => {
      resolve('');
    })
  });
}

async function getPhone(token) {
  return new Promise((resolve, reject) => {
    const url = `http://www.yhc2021.com:81/getphone?token=${token}&id=24017`;
    axios.get(url).then(res => {
      console.log('手机号', res.data);
      if (res.data.code === '0') {
        resolve(res.data.phone);
      }
    }).finally(() => {
      resolve('');
    })
  });
}

async function getMessage(token, phone) {
  return new Promise((resolve, reject) => {
    const url = `http://www.yhc2021.com:81/getmessage?token=${token}&phone=${phone}&id=24017`;
    axios.get(url).then(async (res) => {
      console.log('手机号信息', res.data);
      if (res.data.code === '0') {
        const phoneCode = res.data.msg.replace(/.*登录验证码：(\d{4})，.*/, '$1');
        resolve(phoneCode);
      } else if (res.data.code === '1') {
        await sleep(10);
        getMessage(token, phone);
      }
    });
  });
}

async function release(token, phone) {
  return new Promise((resolve, reject) => {
    const url = `http://www.yhc2021.com:81/release?token=${token}&phone=${phone}&id=24017`;
    axios.get(url).then(res => {
      console.log('释放手机号', res.data);
      if (res.data.code === '0') {
        resolve(res.data.msg);
      }
    }).finally(() => {
      resolve('');
    })
  });
}

async function addblack(token, phone) {
  return new Promise((resolve, reject) => {
    const url = `http://www.yhc2021.com:81/addblack?token=${token}&phone=${phone}&id=24017`;
    axios.get(url).then(res => {
      console.log('拉黑手机号', res.data);
      if (res.data.code === '0') {
        resolve(res.data.msg);
      }
    }).finally(() => {
      resolve('');
    })
  });
}

async function notify(title, content) {
  return new Promise((resolve, reject) => {
    const url = `${process.env.BARKKEY}/${encodeURIComponent(
      title,
    )}/${encodeURIComponent(
      content,
    )}`;
    axios
      .get(url, {
        timeout: 30000,
      }).then(res => {
        console.log('通知', res.data);
        resolve();
      }).finally(() => {
        resolve();
      })
  });
}

async function sleep(seconds) {
  return new Promise((resolve, reject) => { setTimeout(resolve, seconds * 1000) });
}

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage(); //新建一个页面.
  await page.goto('http://pad-local.com');

  const token = await getToken();
  console.log('获取到token:', token);
  const phone = await getPhone(token);
  console.log('获取到手机号:', phone);

  //输入手机号
  const phoneElement = await page.$('#input-33');
  await phoneElement.type(phone, { delay: 300 });
  await sleep(1);
  //点击获取验证码
  const getCodeElement = await page.$('#inspire > div > main > div > div > div > div > div > div > div > div > div.v-card__actions > button');
  getCodeElement.click();
  await sleep(15);

  const phoneCode = await getMessage(token, phone);
  console.log('获取到验证码:', phoneCode);

  //获取验证码
  const passwordElement = await page.$('#input-47', { delay: 20 });
  await passwordElement.type(phoneCode);
  await sleep(3);

  //点击确定按钮进行登录
  let loginElement = await page.$('#inspire > div > main > div > div > div > div > div > div > div > div.v-window-item.v-window-item--active > div.v-card__actions > button:last-child');
  loginElement.click();
  await sleep(5);

  //输入昵称
  const nickElement = await page.$('#input-53', { delay: 20 });
  if (nickElement) {
    await nickElement.type(Math.random().toString(36).substring(10, 15));
    let saveElement = await page.$('#inspire > div > main > div > div > div > div > div > div > div > div.v-window-item.v-window-item--active > div.v-card__actions > button:last-child');
    saveElement.click();
    await sleep(5);
    let getTokenElement = await page.$('#inspire > div > main > div > div > div.d-flex.flex-row.flex-wrap.overflow-y-auto > div.d-flex.justify-center.align-center.my-3 > div > div');
    getTokenElement.click();
    await sleep(5);
  }

  let padToken = await page.$eval('#inspire > div > main > div > div > div.d-flex.flex-row.flex-wrap.overflow-y-auto > div.elevation-0.ma-3.v-card.v-sheet.theme--light.rounded-lg > div.v-card__title > div', el => el.innerText);
  console.log('token 获取成功', padToken);
  if (padToken) {
    await notify('PadLocal获取成功', `token 获取成功, token: ${padToken}`);
    await addblack(token, phone);
    await release(token, phone);

    const envPath = path.join(__dirname, '../.env');
    const env = fs.readFileSync(envPath).toString();
    const data = env.replace(/PADLOCAL_TOKEN=.*/, `PADLOCAL_TOKEN=${padToken}`);
    fs.writeFileSync(envPath, data);
    dotenv.config({ override: true });
    if (process.env.PADLOCAL_TOKEN === padToken) {
      await notify('PadLocal写入环境变量成功', `token: ${padToken}`);
    } else {
      await notify('PadLocal写入环境变量失败', `token: ${padToken}`);
    }
  } else {
    await notify('PadLocal获取失败', ``);
  }
  await page.close();
  await browser.close();
}

http.createServer(function (request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Hello World\n');
}).listen(4321, () => {
  dotenv.config();
  run().then(x => {
    console.log('执行结束');
  }).catch(err => {
    notify('PadLocal获取失败', `${JSON.stringify(err)}`);
  })
});
