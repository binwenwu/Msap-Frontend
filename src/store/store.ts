import {
  AnyAction,
  Dispatch,
  Middleware,
  configureStore,
} from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import templateReducer from "./slices/templateSlice";
import boxSlice from "./slices/boxSlice";
import polynomialSlice from "./slices/polynomialSlice";
import { middleware } from "./middleware";
export function makeStore() {
  return configureStore({
    reducer: {
      user: userReducer,
      template: templateReducer,
      box: boxSlice,
      polynomial: polynomialSlice,
    },
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware().concat(
        middleware as Middleware<{}, any, Dispatch<AnyAction>>[]
      );
    },
  });
}

export const store = makeStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
