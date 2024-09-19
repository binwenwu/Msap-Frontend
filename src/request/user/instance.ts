import axios from "axios"; // 引入 axios 进行 HTTP 请求
import { store } from "@/store/store"; // 从全局状态中引入 store
import { emptyUserInfo, setUserInfo } from "@/store/slices/userSlice"; // 引入用于更新用户信息的 action
import { BASE_PATH } from "@/utils/globalVariable"; // 引入全局变量 BASE_PATH
import { eventEmitter } from "@/utils/events"; // 引入事件管理器，用于触发全局事件

// 创建 axios 实例，设置基础 URL 和默认超时时间
export const request = axios.create({
    baseURL: `${BASE_PATH}/api`, // 基础请求路径
    timeout: 60000, // 请求超时时间设置为 60 秒
    headers: {
        "Content-Type": "application/json", // 设置请求头为 JSON 格式
    },
});

// 请求拦截器：在请求发送前执行
request.interceptors.request.use((config) => {
    // 从 localStorage 获取 token 和 tokenHead
    const token = localStorage.getItem("education-token");
    const head = localStorage.getItem("education-tokenHead");

    // 如果 token 和 head 存在，则在请求头中设置 Authorization 字段
    if (token && head) {
        config.headers.Authorization = head + "" + token; // 拼接 head 和 token 作为 Authorization
    }
    return config; // 返回配置，继续发送请求
});

// 响应拦截器：在接收到响应后执行
request.interceptors.response.use(
    (response) => {
        const { dispatch } = store; // 从 store 中获取 dispatch 方法
        if (response.status === 200) {
            // 如果响应状态码为 200
            const data = response.data as BaseResponse<any>; // 将响应数据类型断言为 BaseResponse

            if (data.code === 20000) {
                // 如果响应业务代码为 20000，则表示请求成功
                return data.data; // 返回实际的数据
            } else if (
                response.data.code === 40000 ||
                response.data.code === 401
            ) {
                // 如果业务代码为 40000 或 401，表示认证失败，清除 localStorage
                localStorage.clear();

                // 触发 Redux action，清空用户信息
                store.dispatch(
                    setUserInfo({
                        token: null,
                        refreshToken: null,
                    })
                );

                // 返回一个拒绝的 Promise，附带错误信息
                return Promise.reject(data.msg);
            } else if (data.code === 40003) {
                // 如果业务代码为 40003，表示需要强制登出
                dispatch(emptyUserInfo()); // 清空用户信息
                eventEmitter.emit("logout"); // 触发登出事件
            } else {
                // 对于其他业务错误代码，返回一个拒绝的 Promise，附带错误信息
                return Promise.reject(data.msg);
            }
        } else {
            // 如果响应状态码不是 200，返回一个拒绝的 Promise，附带请求失败信息
            return Promise.reject("请求失败");
        }
    },
    (error) => {
        console.log(error); // 输出错误信息

        // TODO: 错误提示
        return Promise.reject(error.message); // 返回错误的 Promise，附带错误消息
    }
);
