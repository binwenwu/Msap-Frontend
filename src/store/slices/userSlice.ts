/* eslint-disable import/no-cycle */
/* eslint-disable no-param-reassign */
/*
 * @Description: user slice
 * @Version: 1.0
 * @Autor: 赵卓轩
 * @Date: 2023-07-08 16:21:30
 * @LastEditors: 赵卓轩
 * @LastEditTime: 2023-07-23 00:34:51
 */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const userState: UserState = {
  userInfo: {
    role: null,
    token: null,
    uid: null,
    tokenHead: null,
    refreshToken: null,
    sno: null,
    username: null,
  },
};

export const userSlice = createSlice({
  name: "user",
  initialState: userState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserInfo>) => {
      const info = {
        ...state.userInfo,
      };
      if (action.payload.token) {
        info.token = action.payload.token;
        localStorage.setItem("education-token", action.payload.token);
      }
      if (action.payload.refreshToken) {
        info.refreshToken = action.payload.refreshToken;
        localStorage.setItem(
          "education-refreshToken",
          action.payload.refreshToken
        );
      }
      if (action.payload.tokenHead) {
        info.tokenHead = action.payload.tokenHead;
        localStorage.setItem("education-tokenHead", action.payload.tokenHead);
      }
      if (action.payload.uid) {
        info.uid = action.payload.uid;
        localStorage.setItem("education-uid", action.payload.uid);
      }
      if (action.payload.sno) {
        info.sno = action.payload.sno;
        localStorage.setItem("education-sno", action.payload.sno);
      }
      if (action.payload.username) {
        info.username = action.payload.username;
        localStorage.setItem("education-username", action.payload.username);
      }
      state.userInfo = info;
    },
    emptyUserInfo: (state) => {
      state.userInfo = {
        role: null,
        token: null,
        uid: null,
        tokenHead: null,
        refreshToken: null,
        sno: null,
        username: null,
      };
      localStorage.clear();
    },
  },
});

export const { setUserInfo, emptyUserInfo } = userSlice.actions;

export default userSlice.reducer;
