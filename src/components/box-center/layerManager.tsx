import { useRef, useCallback, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { Dropdown, Tooltip, Spin, message } from "antd";
import {
    CloseOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    DashOutlined,
} from "@ant-design/icons";
import { BASE_PATH, OUTPUT_PATH } from "@/utils/globalVariable";
import {
    ResourceLayer,
    addDrawLayers,
    addResourceLayers,
    addResultLayers,
    setCurrentLayer,
    toogleVectorOpen,
} from "@/store/slices/boxSlice";
import { eventEmitter } from "@/utils/events";
import {
    deleteOperatorResult,
    executeTmsServer,
    getExtentAndZoom,
    getPath,
} from "@/request/operators";
import { useRouter } from "next/router";
import { parseJSON } from "@/utils/common";
import { getTaskDetail } from "@/request/student";
import { queryResultDetail } from "@/request/course";
import styles from "./layerManager.module.scss";
import Image from "next/image";

// LayerManagerProps 接口定义了 LayerManager 组件所需的属性类型。
interface LayerManagerProps {
    onLayerChange: (layer: Record<string, any>) => void;
}

// LayerManager 组件使用该接口来确保传入的属性符合预期，并通过解构赋值获取 onLayerChange 属性。
const LayerManager: React.FC<LayerManagerProps> = ({ onLayerChange }) => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const resourceLayers = useAppSelector((slice) => slice.box.resourceLayers);
    const drawLayers = useAppSelector((slice) => slice.box.drawLayers);
    const resultLayers = useAppSelector((slice) => slice.box.resultLayers);

    const [loading, setLoading] = useState(false);

    const leftContainerRef = useRef<HTMLDivElement>(null);
    const leftArrowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        eventEmitter.on(
            "operator:refreshLayer",
            (resultLayer: ResultLayerObj) => {
                dispatch(
                    addResultLayers({
                        type: "add",
                        layerObj: resultLayer,
                    })
                );
            }
        );
    }, []);

    // 加载成果影像数据
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const sno = localStorage.getItem("education-sno")!;
        queryResultDetail({
            taskId: params.get("taskInstanceId")!,
            practiceInstanceId: params.get("practiceInstanceId")!,
            sno,
        })
            .then((resp) => {
                const results = resp.practiceTaskResults as Record<
                    string,
                    any
                >[];
                const layers = results.map((result) => {
                    const path = parseJSON(result.path)?.[0];
                    return {
                        layerName: path.name,
                        jobId: path.jobId,
                        minZoom: path.minZoom,
                        maxZoom: path.maxZoom,
                        lnglatStr: path.lnglatStr,
                        status: false,
                        id: result.id,
                    };
                }) as any;
                dispatch(
                    addResultLayers({
                        type: "adds",
                        layerObj: layers,
                    })
                );
            })
            .catch((err) => {
                message.error("获取资源数据失败！");
                console.error(err);
            });
    }, []);
    // 加载资源数据
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        getTaskDetail(params.get("taskInstanceId")!)
            .then((resp) => {
                const providedDataIds = parseJSON(resp.providedDataIds);
                const layers = providedDataIds.map((dataId: string) =>
                    parseJSON(dataId)
                ) as ResourceLayer[];
                dispatch(
                    addResourceLayers({
                        type: "add",
                        layers: layers.map((layer) => ({
                            ...layer,
                            status: false,
                        })),
                    })
                );
            })
            .catch((err) => {
                message.error("获取资源数据失败！");
                console.error(err);
            });
    }, []);

    const handleLeftArrow = useCallback(() => {
        const isCollapse = leftContainerRef.current?.classList.contains(
            styles.leftHidden
        );
        if (!isCollapse) {
            leftContainerRef.current?.classList.add(styles.leftHidden);
            leftArrowRef.current?.classList.add(styles.leftArrowHidden);
        } else {
            leftContainerRef.current?.classList.remove(styles.leftHidden);
            leftArrowRef.current?.classList.remove(styles.leftArrowHidden);
        }
    }, []);

    const handleResourceLayerChange = useCallback(
        async (layer: ResourceLayer) => {
            if (layer.status) {
                // 隐藏
                eventEmitter.emit("resource:unPreview", layer);
            } else {
                // 显示
                setLoading(true);
                if (window.previewLayerMap[layer.id]) {
                    eventEmitter.emit("resource:rePreview", layer);
                    setLoading(false);
                    dispatch(
                        addResourceLayers({
                            type: "status",
                            layer: layer,
                        })
                    );
                    return;
                }
                eventEmitter.emit("resource:preview", {
                    ...layer,
                });
                setLoading(false);
            }
            dispatch(
                addResourceLayers({
                    type: "status",
                    layer: layer,
                })
            );
        },
        []
    );

    const handleChangeDrawLayer = useCallback((layer: Record<string, any>) => {
        const id = layer.layerIds;
        id.forEach((item: number) => {
            const style = {
                clickable: !layer.status,
                fillOpacity: layer.status ? 0 : 0.5,
                opacity: layer.status ? 0 : 0.5,
                stroke: !layer.status,
            };
            window.layerMap[item].setStyle(style);
        });
        dispatch(
            addDrawLayers({
                type: "status",
                layerObj: layer,
            })
        );
    }, []);

    const handleRemoveDrawLayer = useCallback(
        (layer: Record<string, any>, layerArr: number[]) => {
            layerArr.forEach((item: number) => {
                window.layerMap[item].remove();
            });
            dispatch(
                addDrawLayers({
                    type: "del",
                    layerObj: layer,
                })
            );
        },
        []
    );

    const handleChangeResultLayer = useCallback((layer: ResultLayerObj) => {
        if (layer.status) {
            eventEmitter.emit("result:unPreview", layer);
        } else {
            if (window.resultLayerMap[layer.jobId]) {
                eventEmitter.emit("result:rePreview", layer);
            } else {
                eventEmitter.emit("result:preview", layer);
            }
        }
        dispatch(
            addResultLayers({
                type: "status",
                layerObj: layer,
            })
        );
    }, []);

    const handleRemoveResultLayer = useCallback(
        (layer: Record<string, any>) => {
            deleteOperatorResult(layer.id)
                .then((resp) => {
                    message.success("删除成功！");
                    dispatch(
                        addResultLayers({
                            type: "del",
                            layerObj: layer,
                        })
                    );
                })
                .catch((err) => {
                    message.error("删除成果失败！");
                    console.error(err);
                });
        },
        []
    );

    const handleEdit = useCallback((layer: Record<string, any>) => {
        dispatch(setCurrentLayer(layer));
        dispatch(toogleVectorOpen(true));
    }, []);

    return (
        <>
            <div className={styles.left} ref={leftContainerRef}>
                <div
                    className={styles.arrow}
                    ref={leftArrowRef}
                    onClick={handleLeftArrow}
                />
                <div className={styles.topBar}>
                    <div className={styles.layer}>
                        <img
                            src={`${BASE_PATH}/img/box/layers.webp`}
                            alt="图层"
                            className={styles.layerIcon}
                        />
                        图层
                    </div>
                </div>
                <Spin spinning={loading} tip="图层加载中...">
                    <div className={styles.layers}>
                        {resourceLayers.length ? <div>资源数据</div> : null}
                        {resourceLayers.map((layer, index) => {
                            return (
                                <div className={styles.layer} key={index}>
                                    {layer.status ? (
                                        <EyeTwoTone
                                            twoToneColor="#3981fe"
                                            className={styles.viewIcon}
                                            onClick={() =>
                                                handleResourceLayerChange(layer)
                                            }
                                        />
                                    ) : (
                                        <EyeInvisibleOutlined
                                            className={styles.viewIcon}
                                            onClick={() =>
                                                handleResourceLayerChange(layer)
                                            }
                                        />
                                    )}
                                    <Tooltip
                                        title={layer.name}
                                        placement="topLeft"
                                    >
                                        <span
                                            className={
                                                layer.status
                                                    ? styles.active
                                                    : ""
                                            }
                                        >
                                            {layer.name}
                                        </span>
                                    </Tooltip>
                                </div>
                            );
                        })}
                        {drawLayers.length ? <div>矢量数据</div> : null}
                        {drawLayers.map((layer, index) => {
                            return (
                                <div className={styles.layer} key={index}>
                                    {layer.status ? (
                                        <EyeTwoTone
                                            twoToneColor="#3981fe"
                                            className={styles.viewIcon}
                                            onClick={() =>
                                                handleChangeDrawLayer(layer)
                                            }
                                        />
                                    ) : (
                                        <EyeInvisibleOutlined
                                            className={styles.viewIcon}
                                            onClick={() =>
                                                handleChangeDrawLayer(layer)
                                            }
                                        />
                                    )}

                                    <Tooltip
                                        title={layer.assetName}
                                        placement="topLeft"
                                    >
                                        <span
                                            className={
                                                layer.status
                                                    ? styles.active
                                                    : ""
                                            }
                                        >
                                            {layer.layerName}
                                        </span>
                                    </Tooltip>
                                    <Dropdown
                                        menu={{
                                            items: [
                                                {
                                                    key: "edit",
                                                    label: (
                                                        <span
                                                            onClick={() =>
                                                                handleEdit(
                                                                    layer
                                                                )
                                                            }
                                                        >
                                                            属性
                                                        </span>
                                                    ),
                                                },
                                                {
                                                    key: "del",
                                                    label: (
                                                        <span
                                                            onClick={() =>
                                                                handleRemoveDrawLayer(
                                                                    layer,
                                                                    layer.layerIds
                                                                )
                                                            }
                                                        >
                                                            删除
                                                        </span>
                                                    ),
                                                },
                                            ],
                                        }}
                                        placement="bottom"
                                    >
                                        <DashOutlined
                                            className={styles.closeIcon}
                                        />
                                    </Dropdown>
                                </div>
                            );
                        })}
                        {resultLayers.length ? <div>成果数据</div> : null}
                        {resultLayers.map((layer, index) => {
                            return (
                                <div className={styles.layer} key={index}>
                                    {layer.status ? (
                                        <EyeTwoTone
                                            twoToneColor="#3981fe"
                                            className={styles.viewIcon}
                                            onClick={() =>
                                                handleChangeResultLayer(layer)
                                            }
                                        />
                                    ) : (
                                        <EyeInvisibleOutlined
                                            className={styles.viewIcon}
                                            onClick={() =>
                                                handleChangeResultLayer(layer)
                                            }
                                        />
                                    )}
                                    <Tooltip
                                        title={layer.layerName}
                                        placement="topLeft"
                                    >
                                        <span
                                            className={
                                                layer.status
                                                    ? styles.active
                                                    : ""
                                            }
                                        >
                                            {layer.layerName || layer.layerName}
                                        </span>
                                    </Tooltip>
                                    <CloseOutlined
                                        className={styles.closeIcon}
                                        onClick={() =>
                                            handleRemoveResultLayer(layer)
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>
                </Spin>
            </div>
        </>
    );
};

export default LayerManager;
