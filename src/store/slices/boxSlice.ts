/*
 * @Author: xin
 * @Date: 2024-05-15 16:32:52
 * @Last Modified by: xin
 * @Last Modified time: 2024-09-04 18:07:11
 * @Description 工具箱
 */

import { toFeatureCollection } from "@/utils/common";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 描述绘图层的操作类型和参数
interface DrawLayerPayload {
    type: "add" | "del" | "status" | "update" | "empty";
    layerObj: Record<string, any>; // 描述层对象的结构
}

// 描述结果层的操作类型和参数
interface ResultLayerPayload {
    type: "adds" | "add" | "del" | "status" | "empty";
    layerObj: ResultLayerObj | any; // 描述结果层对象的结构
}

// 描述资源层的基本信息
export interface ResourceLayer {
    format: string;
    id: number;
    name: string;
    filePath: string;
    status?: boolean;
}

// 描述资源层操作的类型和参数
interface ResourceLayerPayload {
    type: "add" | "del" | "status" | "empty";
    layers?: ResourceLayer[]; // 用于批量操作
    layer?: ResourceLayer; // 单层操作
}

// 描述工具箱的初始状态
const boxState: BoxState = {
    saveOpen: false, // 保存对话框是否打开
    vectorOpen: false, // 矢量图层是否打开
    currentLayer: {}, // 当前图层
    resourceLayers: [], // 资源层列表
    drawLayers: [], // 绘图层列表
    resultLayers: [], // 结果层列表
};

// 创建 Redux 切片
const boxSlice = createSlice({
    name: "box",
    initialState: boxState, // 初始状态
    reducers: {
        // 设置当前图层
        setCurrentLayer: (
            state,
            action: PayloadAction<Record<string, any>>
        ) => {
            state.currentLayer = action.payload;
        },
        // 添加或删除资源层
        addResourceLayers: (
            state,
            action: PayloadAction<ResourceLayerPayload>
        ) => {
            switch (action.payload.type) {
                case "add":
                    state.resourceLayers = state.resourceLayers.concat(
                        action.payload.layers!
                    );
                    break;
                case "del":
                    state.resourceLayers = action.payload.layers!;
                    break;
                case "status":
                    {
                        const layer = action.payload.layer!;
                        state.resourceLayers.forEach((l: ResourceLayer) => {
                            if (l.id === layer.id) {
                                l.status = !l.status;
                            }
                        });
                    }
                    break;
                case "empty":
                    state.resourceLayers.length = 0;
                    break;
                default:
            }
        },
        // 添加或删除绘图层
        addDrawLayers: (state, action: PayloadAction<DrawLayerPayload>) => {
            switch (action.payload.type) {
                case "add":
                    {
                        const { oldLayerName, layerName, layerId, geojson } =
                            action.payload.layerObj;
                        if (oldLayerName) {
                            const drawLayerObj = state.drawLayers.find(
                                (layer) => layer.layerName === oldLayerName
                            );
                            if (drawLayerObj) {
                                drawLayerObj.layerIds.push(layerId);
                                drawLayerObj.geojson = toFeatureCollection(
                                    drawLayerObj,
                                    true
                                );
                            }
                        } else {
                            state.drawLayers.push({
                                layerName: layerName,
                                layerIds: [layerId],
                                status: true,
                                geojson: geojson,
                            });
                        }
                    }
                    break;
                case "del":
                    {
                        const { layerName } = action.payload.layerObj;
                        state.drawLayers = state.drawLayers.filter(
                            (layerObj) => layerObj.layerName !== layerName
                        );
                    }
                    break;
                case "update":
                    {
                        const { layerName, geojson } = action.payload.layerObj;
                        state.drawLayers.forEach((layer) => {
                            if (layerName === layer.layerName) {
                                layer.geojson = geojson;
                            }
                        });
                    }
                    break;
                case "status":
                    {
                        const { layerName } = action.payload.layerObj;
                        state.drawLayers.forEach((layerObj) => {
                            if (layerObj.layerName === layerName) {
                                layerObj.status = !layerObj.status;
                            }
                        });
                    }
                    break;
                case "empty":
                    state.drawLayers.length = 0;
                    break;
                default:
            }
        },
        // 添加或删除结果层
        addResultLayers: (state, action: PayloadAction<ResultLayerPayload>) => {
            switch (action.payload.type) {
                case "adds":
                    state.resultLayers = action.payload.layerObj;
                    break;
                case "add":
                    state.resultLayers.push(action.payload.layerObj);
                    break;
                case "del":
                    {
                        const { jobId } = action.payload.layerObj;
                        state.resultLayers = state.resultLayers.filter(
                            (layer) => layer.jobId !== jobId
                        );
                    }
                    break;
                case "status":
                    {
                        const { layerName } = action.payload.layerObj;
                        state.resultLayers.forEach((layer) => {
                            if (layer.layerName === layerName) {
                                layer.status = !layer.status;
                            }
                        });
                    }
                    break;
                case "empty":
                    state.resultLayers.length = 0;
                    break;
                default:
            }
        },
        // 切换保存对话框的打开状态
        toogleSaveOpen: (state, action: PayloadAction<boolean>) => {
            state.saveOpen = action.payload;
        },
        // 切换矢量图层的打开状态
        toogleVectorOpen: (state, action: PayloadAction<boolean>) => {
            state.vectorOpen = action.payload;
        },
    },
});

// 导出操作创建函数
export const {
    setCurrentLayer,
    toogleSaveOpen,
    addDrawLayers,
    addResourceLayers,
    addResultLayers,
    toogleVectorOpen,
} = boxSlice.actions;

// 导出切片的 reducer
export default boxSlice.reducer;
