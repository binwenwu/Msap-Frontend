/*
 * @Author: xin
 * @Date: 2024-05-15 16:00:01
 * @Last Modified by: xin
 * @Last Modified time: 2024-08-21 09:06:48
 * @Description: 通用URL
 */

import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();

export const BASE_URL = publicRuntimeConfig?.BASE_URL || "";

export const BASE_PATH = publicRuntimeConfig?.BASE_PATH || "";

export const OUTPUT_PATH = "/home/storage/msap/on-the-fly";
