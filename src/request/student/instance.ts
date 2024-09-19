import { emptyUserInfo } from "@/store/slices/userSlice"; // 导入清空用户信息的 action
import { store } from "@/store/store"; // 导入 Redux store
import { eventEmitter } from "@/utils/events"; // 导入事件触发器，用于登出事件
import { BASE_PATH } from "@/utils/globalVariable"; // 导入 API 基础路径
import axios from "axios"; // 导入 axios 库

// 创建 axios 实例，并设置基础配置
export const request = axios.create({
    baseURL: `${BASE_PATH}/api/internship`, // 设置 API 的基础路径
    timeout: 60000, // 请求超时时间设置为 60 秒
    headers: {
        "Content-Type": "application/json", // 默认的请求内容类型为 JSON
    },
});

// 请求拦截器：在每个请求发出之前进行处理
request.interceptors.request.use((config) => {
    // 从 localStorage 中获取 token 和 token 头部信息
    const token = localStorage.getItem("education-token");
    const head = localStorage.getItem("education-tokenHead");

    // 如果 token 和 token 头部信息都存在，则将它们拼接后作为 Authorization 头部信息加入请求
    if (token && head) {
        config.headers.Authorization = head + " " + token;
    }

    // 返回处理后的 config 对象，继续发出请求
    return config;
});

// 响应拦截器：在每个响应返回后进行处理
request.interceptors.response.use(
    (response) => {
        const { dispatch } = store; // 从 store 中获取 dispatch 方法

        // 如果响应状态码为 200，表示请求成功
        if (response.status === 200) {
            const data = response.data as BaseResponse<any>; // 解析响应数据

            // 根据后端返回的 code 进行处理
            if (data.code === 20000) {
                return data.data; // 成功返回业务数据
            } else if (data.code === 20001) {
                return { records: [], total: 0 }; // 处理无数据时返回的情况
            } else if (data.code === 40003) {
                // 如果 code 为 40003，表示用户认证失效，需要退出登录
                dispatch(emptyUserInfo()); // 清空用户信息
                eventEmitter.emit("logout"); // 触发登出事件
            } else {
                return Promise.reject(data.msg); // 其他错误情况返回错误消息
            }
        } else {
            return Promise.reject("请求失败"); // 如果状态码不是 200，直接返回请求失败的错误
        }
    },
    (error) => {
        console.log(error); // 打印错误信息
        // TODO: 这里可以添加错误提示逻辑
        return Promise.reject(error.message); // 返回错误的消息
    }
);
