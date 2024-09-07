/*
 * @Author: xin
 * @Date: 2024-05-15 16:32:52
 * @Last Modified by: xin
 * @Last Modified time: 2024-09-04 18:07:11
 * @Description 工具箱
 */
import { toFeatureCollection } from "@/utils/common";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DrawLayerPayload {
  type: "add" | "del" | "status" | "update" | "empty";
  layerObj: Record<string, any>;
}

interface ResultLayerPayload {
  type: "adds" | "add" | "del" | "status" | "empty";
  layerObj: ResultLayerObj | any;
}

export interface ResourceLayer {
  format: string;
  id: number;
  name: string;
  filePath: string;
  status?: boolean;
}

interface ResourceLayerPayload {
  type: "add" | "del" | "status" | "empty";
  layers?: ResourceLayer[];
  layer?: ResourceLayer;
}
const boxState: BoxState = {
  saveOpen: false,
  vectorOpen: false,
  currentLayer: {},
  resourceLayers: [],
  drawLayers: [],
  resultLayers: [],
};
const boxSlice = createSlice({
  name: "box",
  initialState: boxState,
  reducers: {
    setCurrentLayer: (state, action: PayloadAction<Record<string, any>>) => {
      state.currentLayer = action.payload;
    },
    addResourceLayers: (state, action: PayloadAction<ResourceLayerPayload>) => {
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
            state.resourceLayers.forEach((l) => {
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
    addDrawLayers: (state, action: PayloadAction<DrawLayerPayload>) => {
      // {type: 'add | del | update', layers: []}
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
                drawLayerObj.geojson = toFeatureCollection(drawLayerObj, true);
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
            const layerName = action.payload.layerObj.layerName;
            const geojson = action.payload.layerObj.geojson;
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
            const jobId = action.payload.layerObj.jobId;
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
    toogleSaveOpen: (state, action: PayloadAction<boolean>) => {
      state.saveOpen = action.payload;
    },
    toogleVectorOpen: (state, action: PayloadAction<boolean>) => {
      state.vectorOpen = action.payload;
    },
  },
});

export const {
  setCurrentLayer,
  toogleSaveOpen,
  addDrawLayers,
  addResourceLayers,
  addResultLayers,
  toogleVectorOpen,
} = boxSlice.actions;

export default boxSlice.reducer;
