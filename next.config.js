/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('next').NextConfig} */

const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

const nextConfig = {
    i18n: {
        locales: ["zh-CN", "en-US"],
        defaultLocale: "zh-CN", // 默认语言
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    publicRuntimeConfig: {
        BASE_URL: "http://111.37.195.68/api",
        BASE_PATH: "/education",
    },
    basePath: "/education",
    async rewrites() {
        // wanda
        const BASE_URL = "http://openge.org.cn/gateway/";
        // const BASE_URL = "http://10.101.240.20/gateway/";
        // zhengzhong
        // const BASE_URL = "http://192.168.1.108:18080";

        return [{
                source: "/hub/:slug*",
                destination: `http://113.45.149.146:8000/hub/:slug*`,
            },
            {
                source: "/edit/:slug*",
                destination: `http://113.45.149.146:443/:slug*`,
            },
            {
                source: "/api/pywps/:slug*",
                destination: `http://openge.org.cn/pywps/:slug*`,
            },
            {
                source: "/api/:slug*",
                destination: `${BASE_URL}/:slug*`,
            },
            {
                source: "/jupyter/:slug*",
                destination: `https://113.45.149.146:8000/:slug*`,
            },
            // {
            //   source: "/api/oge-dag-22/:slug*",
            //   destination: `http://120.48.147.38:8085/oge-dag-22/:slug*`,
            // },
        ];
    },
    transpilePackages: ["leaflet-side-by-side"],
};

module.exports = nextConfig;