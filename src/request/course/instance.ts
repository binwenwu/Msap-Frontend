import { emptyUserInfo } from "@/store/slices/userSlice"; // 从 userSlice 中引入清空用户信息的操作
import { store } from "@/store/store"; // 引入全局 store，用于 dispatch 操作
import { eventEmitter } from "@/utils/events"; // 引入事件管理器，用于触发登出事件
import { BASE_PATH } from "@/utils/globalVariable"; // 引入全局变量 BASE_PATH
import axios from "axios"; // 引入 axios 库，用于发起 HTTP 请求

// 创建一个 axios 实例，定义基础的请求配置
export const request = axios.create({
    baseURL: `${BASE_PATH}/api`, // 设置基础 URL，拼接全局变量 BASE_PATH
    timeout: 60000, // 设置请求超时时间为 60 秒
    headers: {
        "Content-Type": "application/json", // 设置请求头为 JSON 格式
    },
});

// 请求拦截器，处理请求前的操作
request.interceptors.request.use((config) => {
    const token = localStorage.getItem("education-token"); // 从 localStorage 中获取 token
    const head = localStorage.getItem("education-tokenHead"); // 从 localStorage 中获取 tokenHead
    if (token && head) {
        config.headers.Authorization = head + "" + token; // 将 token 和 tokenHead 拼接后赋值到请求头
    }
    return config; // 返回修改后的配置
});

// 响应拦截器，处理响应后的操作
request.interceptors.response.use(
    (response) => {
        const { dispatch } = store; // 从 store 中获取 dispatch 方法
        if (response.status === 200) {
            const data = response.data as BaseResponse<any>; // 将响应数据类型断言为 BaseResponse 类型
            switch (data.code) {
                case 20000:
                    return data.data; // 如果返回的 code 为 20000，则返回数据
                case 20001:
                    return {
                        total: 0,
                        records: [], // 返回空的列表和记录数
                    };
                case 40003:
                    dispatch(emptyUserInfo()); // 如果 code 为 40003，清空用户信息
                    eventEmitter.emit("logout"); // 触发登出事件
                    break;
                default:
                    return Promise.reject(data.msg); // 如果 code 为其他情况，返回错误消息
            }
        } else {
            return Promise.reject("请求失败"); // 如果 HTTP 状态码不是 200，返回失败提示
        }
    },
    (error) => {
        console.log(error); // 输出错误信息到控制台
        // TODO: 错误提示处理
        return Promise.reject(error.message); // 返回错误信息
    }
);
