/*
 * @Author: xin
 * @Description: 全局Layout
 * @Date: 2024-07-03 15:45:40
 * @Last Modified by: xin
 * @Last Modified time: 2024-07-03 15:46:06
 */

// 从 React 中导入类型和函数，`ReactElement` 表示一个合法的 React 元素，`FC` 是声明函数组件的类型
import { type ReactElement, type FC } from "react";

// 定义一个名为 AppLayout 的函数组件，使用了 React 的 `FC` 类型
// `FC` 自动推断了 `props`，并且在这里明确指定 `children` 是 `ReactElement`
const AppLayout: FC<{ children: ReactElement }> = ({ children }) => {
    // 返回 JSX 片段，将 `children` 渲染出来
    // 片段 `<></>` 不会生成多余的 DOM 元素，它只是一个空的包装器
    return <>{children}</>;
};

// 导出 `AppLayout` 组件，使其能够在其他文件中导入和使用
export default AppLayout;
