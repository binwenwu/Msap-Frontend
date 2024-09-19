// 导入 createSlice 函数，用于创建 Redux slice
import { createSlice } from "@reduxjs/toolkit";

// 定义 PolynomialState 接口，包含一个 boolean 类型的属性 polynomial
interface PolynomialState {
    polynomial: boolean;
}

// 定义 slice 的初始状态，polynomial 默认为 false
const initialState: PolynomialState = {
    polynomial: false,
};

// 创建一个 slice，用于处理 polynomial 状态的更新
const polynomialSlice = createSlice({
    name: "polynomial", // slice 名称
    initialState: initialState, // 初始状态
    reducers: {
        // 定义一个 reducer，用于更新 polynomial 状态
        setPolynomial: (state, action) => {
            // 根据传入的 action.payload 更新 polynomial 的值
            state.polynomial = action.payload;
        },
    },
});

// 导出 setPolynomial action，用于触发 polynomial 状态的修改
export const { setPolynomial } = polynomialSlice.actions;

// 导出 reducer，用于将该 slice 的 reducer 注册到 Redux store 中
export default polynomialSlice.reducer;
