import * as Cesium from "cesium";

const imageryViewModels: Cesium.ProviderViewModel[] = [];

// 天地图img_w影像服务,墨卡托投影
const tianDTimg_w_imageryProvier = new Cesium.WebMapTileServiceImageryProvider({
  url:
    "http://{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0" +
    "&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}" +
    "&style=default&format=tiles&tk=8c471ad83d563e443d9a630de25f23a0",
  layer: "img_w", // WMTS请求的层名称
  style: "default", // WMTS请求的样式名称
  format: "tiles", // MIME类型，用于从服务器检索图像
  tileMatrixSetID: "GoogleMapsCompatible", // 用于WMTS请求的TileMatrixSet的标识符
  subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"], // 天地图8个服务器
  minimumLevel: 0, // 最小层级
  maximumLevel: 18, // 最大层级
});
const tianDTimg_w_viewModel = new Cesium.ProviderViewModel({
  name: "天地图影像服务",
  iconUrl: "/Cesium/Widgets/Images/ImageryProviders/openStreetMap.png",
  tooltip: "天地图国家地理信息公共服务平台.\nhttps://www.tianditu.gov.cn/",
  creationFunction: () => tianDTimg_w_imageryProvier,
});
imageryViewModels.push(tianDTimg_w_viewModel);

// OSM地图服务
const osm_imageryProvider = new Cesium.OpenStreetMapImageryProvider({
  url: "https://a.tile.openstreetmap.org/",
});
const osg_viewModel = new Cesium.ProviderViewModel({
  name: "Open\u00adStreet\u00adMap",
  iconUrl: "/Cesium/Widgets/Images/ImageryProviders/openStreetMap.png",
  tooltip:
    "OpenStreetMap (OSM) is a collaborative project to create a free editable map of the world.\nhttp://www.openstreetmap.org",
  creationFunction: () => osm_imageryProvider,
});
imageryViewModels.push(osg_viewModel);

export default imageryViewModels;
