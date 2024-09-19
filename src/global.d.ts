import * as Cesium from "cesium";
export {};

declare global {
    // 扩展部分全局属性
    interface Window {
        layerMap: Record<
            number,
            Circle | CircleMarker | Marker | Polygon | Polyline | Rectangle
        >;
        previewLayerMap: Record<number, L.TileLayer>;
        resultLayerMap: Record<string, L.TileLayer>;
        map: L.Map;
    }
    interface CSSStyleDeclaration {
        zoom?: string;
    }
    type ProgressStatuses = readonly [
        "normal",
        "exception",
        "active",
        "success"
    ];
}
