/*
查天气功能
本文件提供查天气功能的实现，默认提供的是 彩云天气 API实现。
 */

// 将具体实现引用放在后面，就可以在该引用文件里使用 template.set 来修改默认的返回值
import caiyunWeather, {
  caiyunTomorrowWeather,
  dressingDict,
  skyconDict,
  toAqiDesc,
  toWindDirectionDesc,
  toWindSpeedDesc,
  ultravioletDict,
} from './caiyunapi';
import { place } from './caiyunapi';
import Interceptor from '../../Interceptor';

const weatherInterceptor = new Interceptor('weather', (context) => {
  context.template.add(
    'weather.location.unknown',
    '狗蛋不知道你说的是哪里，确认一下？',
  );
  context.template.add(
    'weather.success',
    '{address}的天气情况：\n{weather}\n温度：{temperature}',
  );
})
  .title('查天气')
  .alias('天气')
  .usage('狗蛋，xx天气如何？')
  .check((context, message) => {
    if (
      /查(.*)的?天气/.test(message.text()) ||
      /(.*)的?天气(如何|怎么?样|$)/.test(message.text())
    ) {
      const text = message.text().replace(/^狗蛋[，。,.\s]*/, '');
      const matchArg = () => {
        if (text.match(/查(.*)的?天气/)) return text.match(/查(.*)的?天气/)[1];
        else if (text.match(/(.*)的?天气(如何|怎么?样|$)/))
          return text.match(/(.*)的?天气(如何|怎么?样|$)/)[1];
        else return undefined;
      };
      const arg = matchArg();
      return { arg };
    }
  })
  .handler(
    async (context, message, checkerArgs: { arg: string | undefined }) => {
      const { arg } = checkerArgs;
      if (!arg) return context.template.use('weather.location.unknown');
      else {
        const location = await place(arg.replace('明天', ''));
        let data;
        if (arg.includes('明天')) {
          data = await caiyunTomorrowWeather(
            location.location.lng,
            location.location.lat,
          );
        } else {
          data = await caiyunWeather(
            location.location.lng,
            location.location.lat,
          );
        }
        return context.template.use('weather.success', {
          flag: arg.includes('明天') ? '明天' : '实时',
          address: `${location.name}（${location.address}）`,
          weather: skyconDict[data.result.realtime.skycon],
          temperature: data.result.realtime.temperature,
          apparent_temperature: data.result.realtime.apparent_temperature,
          aqi: `${data.result.realtime.air_quality.aqi.chn}（${data.result.realtime.air_quality.description.chn}）`,
          comfort: `${data.result.realtime.life_index.comfort.index}（${data.result.realtime.life_index.comfort.desc}）`,
          ultraviolet: `${data.result.realtime.life_index.ultraviolet.index}（${data.result.realtime.life_index.ultraviolet.desc}）`,
          speed: `${toWindSpeedDesc(data.result.realtime.wind.speed)}`,
          direction: `${toWindDirectionDesc(
            data.result.realtime.wind.direction,
          )}`,
        });
      }
    },
  );
export default weatherInterceptor;
