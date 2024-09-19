import type { AppProps } from "next/app";
import "@/styles/globals.scss";
import "@/styles/fonts.scss";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import AppLayout from "@/components/layouts/app-layout/appLayout";
import { ConfigProvider, message } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { eventEmitter } from "@/utils/events";
import { debounce } from "lodash";

export default function App({ Component, pageProps }: AppProps) {
    // 获取路由对象
    const router = useRouter();

    // 处理页面缩放
    useEffect(() => {
        const onResize = debounce(() => {
            // 如果是工具箱页面，不进行缩放
            if (router.pathname.includes("/boxCenter")) return;
            // 计算缩放比例
            const widthScale = window.innerWidth / 1920;
            // 设置缩放比例
            const zoom = widthScale < 0.7 ? 0.7 : widthScale;
            // 缩放
            document.body.style.zoom = String(zoom);
            console.log("current screen zoom: ", zoom);
        }, 200); // 防抖，200ms 内只执行一次

        onResize(); // 初始化执行一次
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, [router.pathname]); // 只在 pathname 变化时重新执行

    const onLogout = useCallback(() => {
        router.push("./");
        message.warning("账号异 常，请重新登录！");
    }, [router]);

    // 监听登出事件
    useEffect(() => {
        eventEmitter.on("logout", onLogout);
        return () => {
            eventEmitter.off("logout", onLogout);
        };
    }, [onLogout]);

    return (
        <ConfigProvider locale={zhCN}>
            <Provider store={store}>
                <>
                    <Head>
                        <title>多源模型在线分析平台</title>
                        <meta name="title" content="多源模型在线分析平台" />
                        <meta name="keyWords" content="多源模型在线分析平台" />
                        <meta
                            name="description"
                            content="多源模型在线分析平台"
                        />
                    </Head>
                    <AppLayout>
                        <Component {...pageProps} />
                    </AppLayout>
                </>
            </Provider>
        </ConfigProvider>
    );
}
