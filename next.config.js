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
    // 将请求路径映射到不同的目标路径
    async rewrites() {
        return [
            {
                source: "/api/pywps/:slug*",
                destination: `http://111.37.195.68/pywps/:slug*`,
            },
            {
                source: "/api/:slug*",
                destination: `http://111.37.195.68/gateway/:slug*`,
            },
        ];
    },
    transpilePackages: ["leaflet-side-by-side"],
};

module.exports = nextConfig;
