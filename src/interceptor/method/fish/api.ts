import dayjs from "dayjs";
import axios from "axios";

const thumbnails = [
  'https://s2.loli.net/2021/12/20/8yJiTKYwdt6ro7z.png',
  'https://s2.loli.net/2021/12/20/FJO2SxrNEAyDsVp.png',
  'https://s2.loli.net/2021/12/20/Jc1lG2aNgkrTy3x.png',
  'https://s2.loli.net/2021/12/20/Hq97ZtnCb4UFWv1.png',
  'https://s2.loli.net/2021/12/20/viP8rwypmBUqHTc.png',
  'https://s2.loli.net/2021/12/20/dEVPwhD4Y2HrCWi.png',
  'https://s2.loli.net/2021/12/20/WJHz16wRTEaO7f4.png',
  'https://s2.loli.net/2021/12/20/ubAgsc4kNPnriCa.png'
]

const festivals = [
  ['元旦', 1, 1],
  ['春节', 2, 1],
  ['元宵节', 2, 15],
  ['清明节', 4, 4],
  ['劳动节', 5, 1],
  ['国庆节', 10, 1],
  ['【春节法定假期放假】', 1, 20]
];


function get_midday(hour) {
  // Get AM/PM/Night
  // 6  - 9  AM 早上
  // 10 - 11 AM 上午
  // 12 - 15 PM 中午
  // 16 - 17 PM 下午
  // 18 - 5  AM 晚上
  if (6 <= hour && hour <= 9) {
    return '早上';
  } else if (10 <= hour && hour <= 11) {
    return '上午';
  } else if (12 <= hour && hour <= 15) {
    return '中午';
  } else if (16 <= hour && hour <= 17) {
    return '下午';
  } else if (hour >= 18 || hour <= 5) {
    return '晚上';
  }
}

export function genText() {
  // Main function of generating text
  const now = dayjs();
  const now_month = now.month() + 1;
  const now_day = now.date();
  const weekday = now.day();
  const yearDays = dayjs().month(1).daysInMonth() === 28 ? 365 : 366;
  let result = [`【摸鱼办】提醒您：${now_month} 月 ${now_day} 日，${get_midday(now.hour())}好，摸鱼人！`,
    '工作再累，一定不要忘记摸鱼哦！',
  choice(['有事没事起身去茶水间去厕所去廊道走走', '别老在工位上坐着，钱是老板的，但命是自己的']),
    '',
  // Weekend
  0 <= weekday && weekday < 6 && `距离周末还有${6 - weekday}天` || `好好享受周末吧\n`];

  // Festival
  for (let item of festivals) {
    const [fest_name, fest_month, fest_day] = item;
    if (fest_month == now_month && fest_day == now_day) {
      result.push(`\n今天就是${fest_name}节，好好享受！\n`);
    } else {
      const fest_date = dayjs().month(fest_month as number - 1).date(fest_day as number);
      let time_left = fest_date.diff(now, 'd');
      if (time_left < 0) {
        time_left += yearDays;
      }
      time_left < 60 && result.push(`距离${fest_name}还有${time_left}天`);
    }
  }
  result = result.concat([
    '',
    '为了放假加油吧！',
    '上班是帮老板赚钱，摸鱼是赚老板的钱！',
    '最后，祝愿天下所有摸鱼人，都能愉快的渡过每一天！'
  ]);
  return result.join('\n');
}

export function choice(array) {
  var rand = Math.random() * array.length | 0;
  var rValue = array[rand];
  return rValue;
}

export function getImage() {
  const image = choice(thumbnails);
  return image;
}

export async function getMoyuImage() {
  const url = "https://api.j4u.ink/v1/store/other/proxy/remote/moyu.json";
  const { data } = await axios.get(
    url,
  );
  if (data.code === 200) {
    return data.moyu_url;
  }
  return '';
}
