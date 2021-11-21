/**
 * 天气查询 彩云实现
 */

import {getAPIKey} from "../../../lib/APIs/CaiyunAPI";
import Axios, {AxiosResponse} from "axios";
import {template} from "../../../bot";
const axios = Axios.create()
interface CaiyunError {
    status: "failed"
    error: string
    api_version: string
}
// https://open.caiyunapp.com/%E5%AE%9E%E5%86%B5%E5%A4%A9%E6%B0%94%E6%8E%A5%E5%8F%A3/v2.5
export interface RealtimeWeather {
    status: string
    api_version: string
    api_status: string
    lang: string
    unit: string
    location: [number, number]
    server_time: number
    tzshift: number
    result: {
        realtime: {
            status: string
            temperature: number
            apparent_temperature: number
            pressure: number
            humidity: number
            wind: {
                direction: number
                speed: number
            }
            precipitation: {
                nearest: {
                    status: string
                    distance: number
                    intensity: number
                }
                local: {
                    status: string
                    intensity: number
                    datasource: string
                }
            }
            cloudrate: number
            dswrf: number
            visibility: number
            skycon: string
            life_index: {
                comfort: {
                    index: number
                    desc: string
                }
                ultraviolet: {
                    index: number
                    desc: string
                }
            }
            air_quality: {
                pm25: number
                pm10: number
                o3: number
                no2: number
                so2: number
                co: number
                aqi: {
                    chn: number
                    usa: number
                }
                description: {
                    usa: string
                    chn: string
                }
            }
        }
    }
}
export const skyconDict = {
    CLEAR_DAY: "晴（白天）",
    CLEAR_NIGHT: "晴（夜间）",
    PARTLY_CLOUDY_DAY: "多云（白天）",
    PARTLY_CLOUDY_NIGHT: "多云（夜间）",
    CLOUDY: "阴",
    LIGHT_HAZE: "轻度雾霾",
    MODERATE_HAZE: "中度雾霾",
    HEAVY_HAZE: "重度雾霾",
    LIGHT_RAIN: "小雨",
    MODERATE_RAIN: "中雨",
    HEAVY_RAIN: "大雨",
    STORM_RAIN: "暴雨",
    FOG: "雾",
    LIGHT_SNOW: "小雪",
    MODERATE_SNOW: "中雪",
    HEAVY_SNOW: "大雪",
    STORM_SNOW: "暴雪",
    DUST: "浮尘",
    SAND: "沙尘",
    WIND: "大风"
}

export const ultravioletDict = ["无", "很弱", "很弱", "弱", "弱", "中等", "中等", "强", "强", "很强", "很强", "极强"]
export const dressingDict = ["极热", "极热", "很热", "热", "温暖", "凉爽", "冷", "寒冷", "极冷"]
export const coldRiskDict = [null, "少发", "较易发", "易发", "极易发"]
export const toAqiDesc = (aqi: number): string => {
    if (aqi <= 50) return "优"
    else if (aqi <= 100) return "良"
    else if (aqi <= 200) return "轻度污染"
    else if (aqi <= 300) return "中度污染"
    else return "重度污染"
}
export const toWindSpeedDesc = (speed: number): string => {
    if (speed < 1) return "无风（0级）"
    else if (speed <= 5) return "微风徐徐（1级）"
    else if (speed <= 11) return "清风（2级）"
    else if (speed <= 19) return "树叶摇摆（3级）"
    else if (speed <= 28) return "树枝摇动（4级）"
    else if (speed <= 38) return "风力强劲（5级）"
    else if (speed <= 49) return "风力强劲（6级）"
    else if (speed <= 61) return "风力超强（7级）"
    else if (speed <= 74) return "狂风大作（8级）"
    else if (speed <= 88) return "狂风呼啸（9级）"
    else if (speed <= 102) return "暴风毁树（10级）"
    else if (speed <= 117) return "暴风毁树（11级）"
    else if (speed <= 133) return "飓风（12级）"
    else if (speed <= 149) return "台风（13级）"
    else if (speed <= 166) return "强台风（14级）"
    else if (speed <= 183) return "强台风（15级）"
    else if (speed <= 201) return "超强台风（16级）"
    else if (speed <= 220) return "超强台风（17级）"
    else return ""
}
export const toWindDirectionDesc = (angle: number): string => {
    if (angle <= 11.25 || angle >= 348.76) return "北"
    else if (angle <= 33.75) return "北东北"
    else if (angle <= 56.25) return "东北"
    else if (angle <= 78.75) return "东东北"
    else if (angle <= 101.25) return "东"
    else if (angle <= 123.75) return "东东南"
    else if (angle <= 146.25) return "东南"
    else if (angle <= 168.75) return "南东南"
    else if (angle <= 191.25) return "南"
    else if (angle <= 213.75) return "南西南"
    else if (angle <= 236.25) return "西南"
    else if (angle <= 258.75) return "西西南"
    else if (angle <= 281.25) return "西"
    else if (angle <= 303.75) return "西西北"
    else if (angle <= 326.25) return "西北"
    else if (angle <= 348.75) return "北西北"
    else return ""
}

template.set("weather.success", "{address}的{flag}天气情况：\n{weather}\n温度：{temperature}℃\n体感温度：{apparent_temperature}℃\n空气质量：{aqi}\n舒适指数：{comfort}\n紫外线指数：{ultraviolet}\n风力：{speed}\n风向：{direction}\n以上数据来源于彩云天气")

export default function caiyunWeather(lng: number, lat: number): Promise<RealtimeWeather> {
    const apiKey = getAPIKey("weather")
    return new Promise<RealtimeWeather>((resolve, reject) => {
        axios({
            method: "GET",
            url: `https://api.caiyunapp.com/v2.5/${apiKey}/${lng},${lat}/realtime.json`,
            params: {
                unit: "metric"
            }
        }).then((value: AxiosResponse) => {
            const data = value.data
            if (data.status === "ok") resolve(data as RealtimeWeather)
            else reject((data as CaiyunError).error)
        }).catch(reject)
    })
}

export function caiyunTomorrowWeather(lng: number, lat: number): Promise<RealtimeWeather> {
    const apiKey = getAPIKey("weather")
    return new Promise<RealtimeWeather>((resolve, reject) => {
        axios({
            method: "GET",
            url: `https://api.caiyunapp.com/v2.5/${apiKey}/${lng},${lat}/daily.json`,
            params: {
                unit: "metric"
            }
        }).then((value: AxiosResponse) => {
            const data = value.data
            if (data.status === "ok") {
                const result: any = {
                    result: {
                        realtime: {
                            skycon: data.result.daily.skycon[1].value,
                            temperature: data.result.daily.temperature[1].avg,
                            apparent_temperature: '',
                            air_quality: {
                                aqi: {
                                    chn: data.result.daily.air_quality.aqi[1].avg.chn
                                },
                                description: {
                                    chn: '无'
                                }
                            },
                            life_index: {
                                comfort: {
                                    index: data.result.daily.life_index.comfort[1].index,
                                    desc: data.result.daily.life_index.comfort[1].index,
                                },
                                ultraviolet: {
                                    index: data.result.daily.life_index.ultraviolet[1].index,
                                    desc: data.result.daily.life_index.ultraviolet[1].desc,
                                }
                            },
                            wind: {
                                speed: data.result.daily.wind[1].avg.speed,
                                direction: data.result.daily.wind[1].avg.direction,
                            }
                        }
                    }
                }
                resolve(result as RealtimeWeather)
            }
            else reject((data as CaiyunError).error)
        }).catch(reject)
    })
}
