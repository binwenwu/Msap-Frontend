// 导入Cesium库，Cesium是用于3D地球和地图可视化的开源库
import * as Cesium from "cesium";

// 创建一个用于存储影像服务视图模型的空数组，Cesium.ProviderViewModel 用于管理地图图层
const imageryViewModels: Cesium.ProviderViewModel[] = [];

// 天地图影像服务（img_w图层，墨卡托投影）
// 使用 WebMapTileServiceImageryProvider 加载天地图的影像服务图层
const tianDTimg_w_imageryProvier = new Cesium.WebMapTileServiceImageryProvider({
    // 请求天地图服务的URL，包含WMTS服务的参数
    url:
        "http://{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0" +
        "&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}" +
        "&style=default&format=tiles&tk=8c471ad83d563e443d9a630de25f23a0",
    layer: "img_w", // 天地图影像图层的名称（img_w为全球影像图层）
    style: "default", // 请求的样式，使用默认样式
    format: "tiles", // 图像格式，使用瓦片格式
    tileMatrixSetID: "GoogleMapsCompatible", // 瓦片矩阵集的标识符，兼容Google Maps投影
    subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"], // 天地图的八个子域名服务器，用于平衡负载
    minimumLevel: 0, // 支持的最小缩放级别
    maximumLevel: 18, // 支持的最大缩放级别
});

// 创建一个影像服务视图模型（ProviderViewModel）用于天地图影像图层
// 该视图模型将用于Cesium的图层切换控件中，允许用户选择天地图影像图层
const tianDTimg_w_viewModel = new Cesium.ProviderViewModel({
    name: "天地图影像服务", // 显示在图层选择控件中的名称
    iconUrl: "/Cesium/Widgets/Images/ImageryProviders/openStreetMap.png", // 图层选择控件中的图标
    tooltip: "天地图国家地理信息公共服务平台.\nhttps://www.tianditu.gov.cn/", // 鼠标悬停时显示的提示信息
    creationFunction: () => tianDTimg_w_imageryProvier, // 返回影像服务的创建函数，实际提供影像数据
});

// 将天地图影像服务视图模型添加到 imageryViewModels 数组中
imageryViewModels.push(tianDTimg_w_viewModel);

// OpenStreetMap (OSM) 地图服务
// 使用 OpenStreetMapImageryProvider 加载OSM地图服务
const osm_imageryProvider = new Cesium.OpenStreetMapImageryProvider({
    url: "https://a.tile.openstreetmap.org/", // OSM瓦片的基础URL
});

// 创建一个影像服务视图模型用于OSM地图图层
const osg_viewModel = new Cesium.ProviderViewModel({
    name: "Open\u00adStreet\u00adMap", // OSM图层的名称，使用 Unicode 字符表示非断空格
    iconUrl: "/Cesium/Widgets/Images/ImageryProviders/openStreetMap.png", // OSM图层的图标
    tooltip:
        "OpenStreetMap (OSM) is a collaborative project to create a free editable map of the world.\nhttp://www.openstreetmap.org", // 鼠标悬停时的提示信息，介绍OSM
    creationFunction: () => osm_imageryProvider, // 返回影像服务的创建函数，实际提供OSM地图数据
});

// 将OSM地图服务视图模型添加到 imageryViewModels 数组中
imageryViewModels.push(osg_viewModel);

// 导出包含所有影像服务视图模型的数组
export default imageryViewModels;
