/* eslint-disable */
import styles from "@/styles/boxCenter.module.scss"; // 导入样式模块
import { useAppDispatch } from "@/store/hook"; // 导入 Redux dispatch hook
import { ConfigProvider } from "antd"; // 引入 Ant Design 的配置提供组件
import zhCN from "antd/locale/zh_CN"; // 导入 Ant Design 的中文本地化配置
import LayerManager from "@/components/box-center/layerManager"; // 导入图层管理组件
import UtilsBox from "@/components/box-center/utilsBox"; // 导入工具箱组件
import { useEffect, useRef } from "react"; // 从 React 中导入 useEffect 和 useRef
import Link from "next/link"; // 导入 Next.js 的 Link 组件
import dynamic from "next/dynamic"; // 动态导入组件
import VectorEdit from "@/components/box-center/vectorEdit"; // 导入矢量编辑组件

// 动态导入地图组件，禁用服务器端渲染
const Map = dynamic(() => import("@/components/map/mapContainer"), {
    ssr: false,
});

export default function BoxCenter() {
    const dispatch = useAppDispatch(); // 获取 dispatch 函数，用于派发 Redux 操作

    // 处理图层变化的函数，参数为图层对象
    const handleLayerChange = (layer: Record<string, any>) => {
        // TODO: 实现显示图层的功能
    };

    // useEffect 用于在组件挂载时将 body 的缩放设置为 1
    useEffect(() => {
        document.body.style.zoom = "1";
    }, []);

    return (
        <>
            <ConfigProvider locale={zhCN}>
                <div className={styles.header}>
                    <div className={styles.logoBox}>
                        <svg
                            className="icon"
                            viewBox="0 0 1024 1024"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            p-id="4314"
                            width="200"
                            height="200"
                        >
                            <path
                                d="M96.512 425.564c16.53-61.654 132.308-148.058 155.432-141.872 23.092 6.188 80.186 138.904 63.654 200.588-16.53 61.656-78.966 98.5-139.464 82.28s-96.122-79.34-79.622-140.996z"
                                fill="#E6E9ED"
                                p-id="4315"
                            ></path>
                            <path
                                d="M163.884 633.778a21.24 21.24 0 0 1-5.532-0.75c-11.374-3.032-18.154-14.75-15.092-26.122l46.56-173.842c3.062-11.374 14.75-18.124 26.124-15.092 11.406 3.062 18.156 14.75 15.124 26.124l-46.592 173.838c-2.53 9.53-11.154 15.844-20.592 15.844z"
                                fill="#CCD1D9"
                                p-id="4316"
                            ></path>
                            <path
                                d="M678.808 608.906l-122.308 37.684-96.28-312.49 122.34-37.688z"
                                fill="#ED5564"
                                p-id="4317"
                            ></path>
                            <path
                                d="M684.496 265.006l-326.21 100.498 3.092-134.902 285.43-87.904z"
                                fill="#434A54"
                                p-id="4318"
                            ></path>
                            <path
                                d="M794.24 640.622l-162.056-72.652 28.906-64.468 70.03-26.656 65.372 29.312 26.656 70-28.908 64.464z m-105.65-94.122l84.184 37.75 4.218-9.438-14.094-36.968-33.124-14.844-36.966 14.062-4.218 9.438z"
                                p-id="4319"
                            ></path>
                            <path
                                d="M933.58 244.758c6.782 3.062 9.844 11.062 6.782 17.842l-118.214 263.65c-3.032 6.782-11.032 9.844-17.844 6.782l-98.462-44.156c-6.812-3.062-9.844-11.032-6.812-17.844l118.212-263.65c3.062-6.782 11.032-9.812 17.844-6.782l98.494 44.158z"
                                fill="#A0D468"
                                p-id="4320"
                            ></path>
                            <path
                                d="M765.742 508.5c-2.938 0-5.876-0.624-8.718-1.874-10.748-4.812-15.56-17.438-10.748-28.188l84.496-188.464c4.844-10.75 17.468-15.562 28.218-10.75 10.75 4.812 15.532 17.436 10.718 28.186l-84.5 188.464a21.33 21.33 0 0 1-19.466 12.626z"
                                fill="#8CC153"
                                p-id="4321"
                            ></path>
                            <path
                                d="M85.324 469.344h853.318v426.644H85.324zM106.666 213.352H917.3v42.656H106.666z"
                                fill="#F6BB42"
                                p-id="4322"
                            ></path>
                            <path
                                d="M256.006 639.996H128.01c-11.812 0-21.344-9.532-21.344-21.312 0-11.778 9.532-21.34 21.344-21.34h127.996c11.75 0 21.312 9.562 21.312 21.34 0 11.78-9.562 21.312-21.312 21.312zM895.988 597.344h-85.342c-11.782 0-21.344-9.532-21.344-21.344 0-11.782 9.562-21.312 21.344-21.312h85.342A21.3 21.3 0 0 1 917.3 576c0 11.812-9.53 21.344-21.312 21.344zM170.666 810.68H128.01c-11.812 0-21.344-9.562-21.344-21.344s9.532-21.344 21.344-21.344h42.654c11.782 0 21.342 9.562 21.342 21.344s-9.56 21.344-21.34 21.344zM895.988 789.336h-149.338c-54.374 0-81.686 29.282-95.03 53.812-13.532 24.934-15 49.214-15.124 51.902v0.938h42.718c0.406-4.062 2.376-19.156 10.5-33.562 11.594-20.464 30.218-30.434 56.936-30.434h149.338c11.782 0 21.312-9.532 21.312-21.312s-9.53-21.344-21.312-21.344z"
                                fill="#DBA037"
                                p-id="4323"
                            ></path>
                            <path
                                d="M0.014 128.01h127.998v767.978H0.014zM895.988 128.01h127.998v767.978h-127.998z"
                                fill="#FFCE54"
                                p-id="4324"
                            ></path>
                        </svg>
                        工具箱模式
                    </div>
                    <Link href="./home" className={styles.returnBtn}>
                        <svg
                            style={{ height: 46 }}
                            className="icon"
                            viewBox="0 0 1024 1024"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            p-id="19576"
                            width="200"
                            height="200"
                        >
                            <path
                                d="M795.91835938 490.13457031c-49.66523437-60.0609375-111.53320313-102.77578125-179.10878907-123.73857422a439.74755859 439.74755859 0 0 0-102.54902344-19.37988281V162.25859375a30.79335937 30.79335937 0 0 0-11.46972656-27.40429688c-7.91015625-5.47910156-17.74160156-4.12382812-24.40898437 3.27832032L139.31914062 448.32324219a35.08769531 35.08769531 0 0 0-8.92792968 23.33496093c0 9.4359375 3.84257812 18.24960937 10.28320312 23.39121094l340.41972657 312.50742188a17.96748047 17.96748047 0 0 0 23.10820312 3.27832031 32.60039063 32.60039063 0 0 0 11.41347656-27.34804688v-174.3046875c128.03203125 4.63183594 213.74472656 49.77773437 273.80390625 130.0078125 28.81582031 36.66972656 49.94824219 81.36210937 61.47421875 130.29257813 2.71142578 13.78652344 12.825 23.50371094 24.40898438 23.39121094h2.48554687c12.20449219-1.29902344 21.58242187-13.73027344 21.75292969-28.75957032 1.35527344-159.33339844-33.22265625-284.65136719-103.62304688-374.26289062v0.22675781z"
                                p-id="19577"
                                fill="#ffffff"
                            ></path>
                        </svg>
                        返回
                    </Link>
                </div>
                <div className={styles.root}>
                    <div className={styles.main}>
                        <LayerManager onLayerChange={handleLayerChange} />
                        <div className={styles.center}>
                            <Map />
                        </div>
                        <UtilsBox />
                    </div>
                </div>
                <VectorEdit />
            </ConfigProvider>
        </>
    );
}
