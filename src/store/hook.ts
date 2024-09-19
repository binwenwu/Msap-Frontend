import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

/* useAppDispatch 和 useAppSelector 是对 react-redux 中 useDispatch 和 useSelector 的类型安全封装。
这样做的主要目的是为了在 TypeScript 中获得更好的类型推断，尤其是在 Redux 中使用时，确保操作符合你定义的状态和分发类型 */
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
