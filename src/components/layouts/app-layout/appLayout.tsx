/*
 * @Author: xin
 * @Description: 全局Layout
 * @Date: 2024-07-03 15:45:40
 * @Last Modified by: xin
 * @Last Modified time: 2024-07-03 15:46:06
 */

import { type ReactElement, type FC } from "react";
const AppLayout: FC<{ children: ReactElement }> = ({ children }) => {
  return <>{children}</>;
};

export default AppLayout;
