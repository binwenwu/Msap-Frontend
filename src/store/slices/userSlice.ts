/* eslint-disable import/no-cycle */
/* eslint-disable no-param-reassign */
/*
 * @Description: user slice（用户切片）
 * @Version: 1.0
 * @Autor: 赵卓轩
 * @Date: 2023-07-08 16:21:30
 * @LastEditors: 赵卓轩
 * @LastEditTime: 2023-07-23 00:34:51
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 初始用户状态，包含用户的基本信息，如角色、令牌、用户ID等
const userState: UserState = {
    userInfo: {
        role: null, // 用户角色，初始化为 null
        token: null, // 用户 token，初始化为 null
        uid: null, // 用户 ID，初始化为 null
        tokenHead: null, // token 前缀，初始化为 null
        refreshToken: null, // 用于刷新 token 的令牌，初始化为 null
        sno: null, // 用户学号或工号，初始化为 null
        username: null, // 用户名，初始化为 null
    },
};

// 创建用户的 slice，用于管理用户的状态和 action
export const userSlice = createSlice({
    name: "user", // 定义 slice 的名称
    initialState: userState, // 初始状态为 userState
    reducers: {
        // 设置用户信息的 reducer，接收 PayloadAction 作为参数
        setUserInfo: (state, action: PayloadAction<UserInfo>) => {
            // 将当前状态中的用户信息解构并复制到 info 对象中
            const info = {
                ...state.userInfo,
            };

            // 如果传递的 action.payload 中包含 token，更新状态并将其保存到 localStorage 中
            if (action.payload.token) {
                info.token = action.payload.token;
                localStorage.setItem("education-token", action.payload.token);
            }

            // 如果传递的 action.payload 中包含 refreshToken，更新状态并将其保存到 localStorage 中
            if (action.payload.refreshToken) {
                info.refreshToken = action.payload.refreshToken;
                localStorage.setItem(
                    "education-refreshToken",
                    action.payload.refreshToken
                );
            }

            // 如果传递的 action.payload 中包含 tokenHead，更新状态并将其保存到 localStorage 中
            if (action.payload.tokenHead) {
                info.tokenHead = action.payload.tokenHead;
                localStorage.setItem(
                    "education-tokenHead",
                    action.payload.tokenHead
                );
            }

            // 如果传递的 action.payload 中包含 uid，更新状态并将其保存到 localStorage 中
            if (action.payload.uid) {
                info.uid = action.payload.uid;
                localStorage.setItem("education-uid", action.payload.uid);
            }

            // 如果传递的 action.payload 中包含 sno，更新状态并将其保存到 localStorage 中
            if (action.payload.sno) {
                info.sno = action.payload.sno;
                localStorage.setItem("education-sno", action.payload.sno);
            }

            // 如果传递的 action.payload 中包含 username，更新状态并将其保存到 localStorage 中
            if (action.payload.username) {
                info.username = action.payload.username;
                localStorage.setItem(
                    "education-username",
                    action.payload.username
                );
            }

            // 更新用户状态为新的 info 对象
            state.userInfo = info;
        },

        // 清空用户信息的 reducer，将用户状态重置为空值，并清空 localStorage 中的相关数据
        emptyUserInfo: (state) => {
            state.userInfo = {
                role: null, // 重置用户角色为 null
                token: null, // 重置 token 为 null
                uid: null, // 重置用户 ID 为 null
                tokenHead: null, // 重置 token 前缀为 null
                refreshToken: null, // 重置刷新令牌为 null
                sno: null, // 重置学号为 null
                username: null, // 重置用户名为 null
            };
            localStorage.clear(); // 清空 localStorage
        },
    },
});

// 导出 setUserInfo 和 emptyUserInfo 方法，用于在组件中调度 action
export const { setUserInfo, emptyUserInfo } = userSlice.actions;

// 默认导出用户 slice 的 reducer，供 store 使用
export default userSlice.reducer;
