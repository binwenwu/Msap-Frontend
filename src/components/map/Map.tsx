// components/Map.js
import React, { useEffect } from "react";
import { MapContainer, LayersControl, useMap, TileLayer } from "react-leaflet";
import L from "leaflet";
import { eventEmitter } from "@/utils/events";
import styles from "./Map.module.scss";
import Position from "./tools/position";
import Pickup from "./tools/pickup";
import Swiper from "./tools/swiper";
import Grid from "./tools/grid";
import RightKeyMenu from "./tools/menu";
import "leaflet-side-by-side";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-mouse-position/src/L.Control.MousePosition.css";
import "leaflet-mouse-position/src/L.Control.MousePosition";
import { saveOperatorResult } from "@/request/operators";
import { message } from "antd";

if (!window.layerMap) {
    window.layerMap = {};
}
if (!window.previewLayerMap) {
    window.previewLayerMap = {};
}
if (!window.resultLayerMap) {
    window.resultLayerMap = {};
}

// 引入
const { BaseLayer, Overlay } = LayersControl;
const gaodeUrl =
    "http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}";
const tiandituKey = "8c471ad83d563e443d9a630de25f23a0";
const tiandituVecUrl =
    "http://t{s}.tianditu.gov.cn/vec_w/wmts?" +
    "tk=" +
    tiandituKey +
    "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec" +
    "&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}";
const tiandituVecBjUrl =
    "http://t{s}.tianditu.gov.cn/cva_w/wmts?" +
    "tk=" +
    tiandituKey +
    "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva" +
    "&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}";
const tiandituImgUrl =
    "http://t{s}.tianditu.gov.cn/img_w/wmts?" +
    "tk=" +
    tiandituKey +
    "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img" +
    "&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}";

const tiandituImgBjUrl =
    "http://t{s}.tianditu.gov.cn/cia_w/wmts?" +
    "tk=" +
    tiandituKey +
    "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia" +
    "&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}";

const DynamicMap = () => {
    const map = useMap();
    window.map = map;

    useEffect(() => {
        const vectorLayer = L.tileLayer(tiandituVecUrl, {
            subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
            maxZoom: 18,
            zIndex: -1,
        });
        const imgTileLayer = L.tileLayer(tiandituImgUrl, {
            subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
            maxZoom: 18,
            zIndex: -1,
        });
        const gaodeLayer = L.tileLayer(gaodeUrl, {
            subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
            maxZoom: 18,
            zIndex: -1,
        });
        // 创建标记图层（这里假设为影像图层）
        const labelLayer = L.tileLayer(tiandituVecBjUrl, {
            subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
            maxZoom: 18,
            zIndex: -1,
        });
        const imgLabelLayer = L.tileLayer(tiandituImgBjUrl, {
            subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
            maxZoom: 18,
            zIndex: -1,
        });
        map.addLayer(vectorLayer);
        map.addLayer(labelLayer);
        const baseLayer = {
            天地图矢量: vectorLayer,
            天地图影像: imgTileLayer,
            高德地图: gaodeLayer,
        };
        const overlay = {
            天地图矢量标记: labelLayer,
            天地图影像标记: imgLabelLayer,
        };
        L.control.layers(baseLayer, overlay).addTo(map);
    }, []);

    const getBounds = (lnglatStr: string) => {
        const latlngArr = lnglatStr.split(",").map((i) => Number(i));
        const southWest = L.latLng(latlngArr[1], latlngArr[0]);
        const northEast = L.latLng(latlngArr[3], latlngArr[2]);
        const bounds = L.latLngBounds(southWest, northEast);
        return bounds;
    };
    const getCenter = (lnglatStr: string) => {
        const latlngArr = lnglatStr.split(",").map((i) => Number(i));
        const lat = (latlngArr[1] + latlngArr[3]) / 2;
        const lng = (latlngArr[0] + latlngArr[2]) / 2;
        return {
            lng,
            lat,
        };
    };

    useEffect(() => {
        eventEmitter.on("operator:centerAt", ({ lnglatStr, maxZoom }) => {
            // const bounds = getBounds(lnglatStr);
            // map.fitBounds(bounds);
            const center = getCenter(lnglatStr);
            map.flyTo(center, maxZoom, { duration: 1, animate: false });
            // map.setView(center, maxZoom);
        });

        eventEmitter.on(
            "operator:draw",
            ({
                jobId,
                maxZoom,
                minZoom,
                lnglatStr,
                identifier,
                filePath,
            }: ResultLayerObj) => {
                map.setMaxZoom(maxZoom);
                map.setMinZoom(minZoom);

                window.resultLayerMap[jobId] = L.tileLayer(
                    `http://www.openearth.org.cn/api/oge-tms-png/${jobId}/{z}/{x}/{y}.png/{z}/{x}/{y}.png`,
                    {
                        maxZoom,
                        zIndex: 9,
                    }
                ).addTo(map);
                const resultLayer = {
                    status: true,
                    jobId,
                    maxZoom,
                    minZoom,
                    lnglatStr,
                    layerName: `${identifier}-${jobId}`,
                };
                const params = new URLSearchParams(location.search);
                saveOperatorResult({
                    practiceInstanceId: params.get("practiceInstanceId")!,
                    practiceTaskId: params.get("taskInstanceId")!,
                    jobId,
                    resultPath: filePath,
                    maxZoom,
                    minZoom,
                    lnglatStr,
                    resultName: `${identifier}-${jobId}`,
                })
                    .then((resp) => {
                        if (resp.code === 20000) {
                            eventEmitter.emit(
                                "operator:refreshLayer",
                                resultLayer
                            );
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        message.error("保存计算结果失败！");
                    });
            }
        );

        // eventEmitter.on("operator:clear", () => {
        //   tempLayer && map.removeLayer(tempLayer);
        // });

        return () => {
            // 清理图层
            // map.eachLayer((layer) => {
            //   map.removeLayer(layer);
            // });
        };
    }, []);

    useEffect(() => {
        eventEmitter.on("operator:resetZoom", () => {
            map.setMaxZoom(18);
            map.setMinZoom(1);
        });
    }, []);

    // 资源预览
    useEffect(() => {
        eventEmitter.on("resource:preview", (layer) => {
            const center = getCenter(layer.lnglatStr);
            map.flyTo(center, layer.maxZoom, { duration: 1, animate: false });
            window.previewLayerMap[layer.jobId] = L.tileLayer(
                `http://www.openearth.org.cn/api/oge-tms-png/${layer.jobId}/{z}/{x}/{y}.png/{z}/{x}/{y}.png`,
                {
                    // maxZoom: layer.maxZoom - 2,
                    maxZoom: layer.maxZoom,
                    zIndex: 9,
                }
            ).addTo(map);
        });
        // 二次预览，修改opactiy
        eventEmitter.on("resource:rePreview", (layer) => {
            const center = getCenter(layer.lnglatStr);
            map.flyTo(center, layer.maxZoom, { duration: 1, animate: false });
            window.previewLayerMap[layer.jobId]?.setOpacity(1);
        });

        eventEmitter.on("resource:unPreview", (layer) => {
            window.previewLayerMap[layer.jobId]?.setOpacity(0);
        });
    }, []);

    // 计算结果预览
    useEffect(() => {
        eventEmitter.on("result:unPreview", (layer: ResultLayerObj) => {
            window.resultLayerMap[layer.jobId]?.setOpacity(0);
        });
        eventEmitter.on("result:rePreview", (layer: ResultLayerObj) => {
            eventEmitter.emit("operator:centerAt", {
                lnglatStr: layer.lnglatStr,
                maxZoom: layer.maxZoom,
            });
            window.resultLayerMap[layer.jobId]?.setOpacity(1);
        });
        eventEmitter.on("result:preview", (layer: ResultLayerObj) => {
            if (window.resultLayerMap[layer.jobId]) {
                window.resultLayerMap[layer.jobId]?.setOpacity(1);
                return;
            }
            const center = getCenter(layer.lnglatStr);
            window.resultLayerMap[layer.jobId] = L.tileLayer(
                `http://www.openearth.org.cn/api/oge-tms-png/${layer.jobId}/{z}/{x}/{y}.png/{z}/{x}/{y}.png`,
                {
                    maxZoom: layer.maxZoom,
                    zIndex: 9,
                }
            ).addTo(map);
            map.flyTo(center, layer.maxZoom, { duration: 1, animate: false });
        });
    }, []);

    return null;
};

const SlotComponet = () => {
    const map = useMap();
    useEffect(() => {
        L.control.mousePosition().addTo(map);
        L.control
            .scale({
                position: "bottomleft", // 比例尺的位置
                imperial: false, // 是否显示英制单位（英里），默认为true
                metric: true, // 是否显示公制单位（米/千米），默认为true
                maxWidth: 100, // 比例尺的最大宽度，单位为像素
            })
            .addTo(map);
    }, []);
    return null;
};

const Map = () => {
    useEffect(() => {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl:
                "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
            iconUrl:
                "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
            shadowUrl:
                "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        });
    }, []);

    return (
        <>
            <MapContainer
                center={[30.55, 114.3]}
                zoom={11}
                className={styles.mapRoot}
                zoomControl={false}
                id="mapRoot"
            >
                {/* <LayersControl position="topright">
          <BaseLayer name="天地图矢量" checked>
            <TileLayer
              url={tiandituVecUrl}
              subdomains={["0", "1", "2", "3", "4", "5", "6", "7"]}
              attribution='&copy; <a href="http://www.tianditu.gov.cn/">天地图</a>'
              zIndex={1}
            />
          </BaseLayer>
          <BaseLayer name="天地图影像">
            <TileLayer
              url={tiandituImgUrl}
              subdomains={["0", "1", "2", "3", "4", "5", "6", "7"]}
              attribution='&copy; <a href="http://www.tianditu.gov.cn/">天地图影像</a>'
              zIndex={1}
            />
          </BaseLayer>
          <BaseLayer name="高德地图">
            <TileLayer
              url="http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
              subdomains={["0", "1", "2", "3", "4", "5", "6", "7"]}
              maxZoom={18}
              zIndex={1}
            />
          </BaseLayer>
          <Overlay name="天地图矢量注记" checked>
            <TileLayer
              url={tiandituVecBjUrl}
              subdomains={["0", "1", "2", "3", "4", "5", "6", "7"]}
            />
          </Overlay>
          <Overlay name="天地图影像注记">
            <TileLayer
              url={tiandituImgBjUrl}
              subdomains={["0", "1", "2", "3", "4", "5", "6", "7"]}
            />
          </Overlay>
        </LayersControl> */}
                <DynamicMap />
                <SlotComponet />
                <RightKeyMenu />
                <Swiper />
                <Position />
                <Pickup />
                <Grid />
            </MapContainer>
        </>
    );
};

export default Map;
