// 引入 Redux Toolkit 中的核心工具：AnyAction、Dispatch、Middleware 以及 configureStore
import {
    AnyAction,
    Dispatch,
    Middleware,
    configureStore,
} from "@reduxjs/toolkit";
// 引入各个 slice 的 reducer，用于管理不同的状态切片
import userReducer from "./slices/userSlice";
import templateReducer from "./slices/templateSlice";
import boxSlice from "./slices/boxSlice";
import polynomialSlice from "./slices/polynomialSlice";
// 引入自定义的中间件配置，包括 redux-logger
import { middleware } from "./middleware";

// 创建并返回 Redux store 的函数
// 在函数中配置 reducer 和 middleware
export function makeStore() {
    return configureStore({
        // 组合多个 reducer，每个 slice 都管理各自的状态
        reducer: {
            user: userReducer, // 管理用户相关的状态
            template: templateReducer, // 管理模板相关的状态
            box: boxSlice, // 管理 box 状态
            polynomial: polynomialSlice, // 管理 polynomial 状态
        },
        // 配置中间件
        middleware: (getDefaultMiddleware) => {
            // 使用默认中间件并添加自定义中间件（redux-logger）
            return getDefaultMiddleware().concat(
                middleware as Array<Middleware<{}, any, Dispatch<AnyAction>>> // 类型断言，确保中间件类型安全
            );
        },
    });
}

// 创建 Redux store 实例，并导出供应用程序使用
export const store = makeStore();

// 获取 store 的状态类型，导出 RootState 供类型推断使用
export type RootState = ReturnType<typeof store.getState>;

// 获取 store 的 dispatch 函数类型，导出 AppDispatch 供类型安全的 dispatch 操作使用
export type AppDispatch = typeof store.dispatch;
