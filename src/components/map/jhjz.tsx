// components/mapContain.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  LayersControl,
  FeatureGroup,
  useMap,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import "leaflet-side-by-side";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
// 引入Ant  导航栏  表单
import {
  Menu,
  Button,
  Form,
  Input,
  Select,
  Modal,
  Drawer,
  Radio,
  Space,
  Flex,
  Table,
  type TableColumnsType,
  type TableProps,
} from "antd";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { addDrawLayers, toogleSaveOpen } from "@/store/slices/boxSlice";

import styles from "./jhjz.module.scss";
import { BASE_PATH } from "@/utils/globalVariable";
import { useSelector, useDispatch } from "react-redux";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
// 表格
type TableRowSelection<T extends object = object> =
  TableProps<T>["rowSelection"];
interface DataType {
  key: React.Key;
  // 序号
  serial: number;
  // 点位id
  ID: number;
  // 校正
  rectifyX: number;
  rectifyY: number;
  // 基准
  standardX: number;
  standardY: number;
  DEM: number;
  // 误差
  errorX: number;
  errorY: number;
  errorXY: number;
  // 点类型
  type: string;
  error: number;
}

const columns: TableColumnsType<DataType> = [
  {
    title: "序号",
    dataIndex: "serial",
    align: "center",
  },
  {
    title: "点位ID",
    dataIndex: "ID",
    align: "center",
  },
  {
    title: "待校正X",
    dataIndex: "rectifyX",
    align: "center",
  },
  {
    title: "待校正Y",
    dataIndex: "rectifyY",
    align: "center",
  },
  {
    title: "基准X",
    dataIndex: "standardX",
    align: "center",
  },
  {
    title: "基准Y",
    dataIndex: "standardY",
    align: "center",
  },
  {
    title: "DEM(M)",
    dataIndex: "DEM",
    align: "center",
  },
  {
    title: "X误差",
    dataIndex: "errorX",
    align: "center",
  },
  {
    title: "Y误差",
    dataIndex: "errorY",
    align: "center",
  },
  {
    title: "XY误差",
    dataIndex: "errorXY",
    align: "center",
  },
  {
    title: "点类型",
    dataIndex: "type",
    align: "center",
  },
  {
    title: "误差",
    dataIndex: "error",
    align: "center",
  },
];

const data: DataType[] = [];
for (let i = 1; i < 50; i++) {
  data.push({
    key: i,
    // 序号
    serial: i,
    ID: i,
    //  校正
    rectifyX: i,
    rectifyY: i,
    //  基准
    standardX: i,
    standardY: i,
    DEM: i,
    // 误差
    errorX: i,
    errorY: i,
    errorXY: i,
    // 点类型
    type: `类型${i}`,
    error: i,
  });
}
// 引入
// 矢量地图加载    定义状态类型
type HasBeenCalledProps = {
  hasBeenCalled: boolean;
  setHasBeenCalled: React.Dispatch<React.SetStateAction<boolean>>;
};
const LeftVectorMap: React.FC<HasBeenCalledProps> = ({
  hasBeenCalled,
  setHasBeenCalled,
}) => {
  const map = useMap();
  const [lat, setLat] = useState<number>(0);
  const [lng, setLng] = useState<number>(0);
  // 获取地图容器元素
  const mapContainer = map.getContainer();
  useEffect(() => {
    mapContainer.style.cursor = "crosshair"; // 更改为手型
    // 添加图层
    const leftVector = L.tileLayer(
      "http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
      {
        subdomains: ["1", "2", "3", "4"],
        maxZoom: 18,
        // attribution: "© OpenStreetMap",
      }
    ).addTo(map);
    // 自定义图标
    const myIcon = L.icon({
      iconUrl: `${BASE_PATH}/point.png`,
      // 图标在地图上的尺寸
      iconSize: [38, 38],
      // 图标左上角与标记点的偏移量
      iconAnchor: [15, 10],
      // 弹出框的锚点相对于图标的偏移量
      popupAnchor: [3, -10],
    });
    // 用于保存所有事件监听器的引用
    let leftClickHandler: L.LeafletEventHandlerFn; // 使用 Leaflet 的类型
    if (hasBeenCalled) {
      // 添加左键点击事件监听器
      leftClickHandler = (evt) => {
        L.marker(evt.latlng, { icon: myIcon })
          .addTo(map)
          .bindPopup(`坐标:${Object.values(evt.latlng)}`)
          .openPopup();
      };
      map.on("click", leftClickHandler);
    }
    // 右击事件
    map.on("contextmenu", (evt) => {
      // console.log("我是右击事件")
      setHasBeenCalled(false);
      // 可以消除左击事件
      map.off("click", leftClickHandler);
    });
    // 监听鼠标移动事件
    map.on("mousemove", (event) => {
      const latlng = Object.values(event.latlng);
      setLat(latlng[0]);
      setLng(latlng[1]);
    });
    return () => {};
  }, [hasBeenCalled]);
  return (
    <button
      style={{
        position: "absolute",
        width: 150,
        height: 50,
        background: "antiquewhite",
        top: 10, // 设置按钮距离顶部的距离
        left: 280, // 设置按钮距离左边的距离
        zIndex: 1001, // 确保按钮在其他元素之上
      }}
    >
      <p style={{ margin: 0, padding: 0 }}>{lat}</p>
      <p style={{ margin: 0, padding: 0 }}>{lng}</p>
    </button>
  );
};
const RightVectorMap = () => {
  const map = useMap();
  useEffect(() => {
    // 添加图层
    const Rightvector = L.tileLayer(
      "http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
      {
        subdomains: ["1", "2", "3", "4"],
        maxZoom: 18,
        // attribution: "© OpenStreetMap",
      }
    ).addTo(map);
    return () => {
      // 清理图层
      // map.eachLayer((layer) => {
      //   map.removeLayer(layer);
      // });
    };
  }, [map]);
  return null;
};

const JHJZ = () => {
  // 表格
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  // 选择框
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    // console.log('selectedRowKeys changed: ', ...newSelectedRowKey);
    setSelectedRowKeys(newSelectedRowKeys);
    // console.log(data)
  };
  const rowsToDisplay = 6; // 想要显示的行数
  const rowHeight = 40; // 每行的高度
  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys,
    onChange: onSelectChange,
    // selections: [
    //   Table.SELECTION_ALL,
    //   Table.SELECTION_INVERT,
    //   Table.SELECTION_NONE,
    //   {
    //     key: 'odd',
    //     text: 'Select Odd Row',
    //     onSelect: (changeableRowKeys) => {
    //       let newSelectedRowKeys = [];
    //       newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
    //         if (index % 2 !== 0) {
    //           return false;
    //         }
    //         return true;
    //       });
    //       setSelectedRowKeys(newSelectedRowKeys);
    //     },
    //   },
    //   {
    //     key: 'even',
    //     text: 'Select Even Row',
    //     onSelect: (changeableRowKeys) => {
    //       let newSelectedRowKeys = [];
    //       newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
    //         if (index % 2 !== 0) {
    //           return true;
    //         }
    //         return false;
    //       });
    //       setSelectedRowKeys(newSelectedRowKeys);
    //     },
    //   },
    // ],
  };

  // 增加点
  const [hasBeenCalled, setHasBeenCalled] = useState<boolean>(false);
  const handleClick = () => {
    if (!hasBeenCalled) {
      console.log("增加点按钮被点击了！");
      setHasBeenCalled(true);
      // 在这里执行你需要的操作
    }
  };

  return (
    <>
      <div className={styles.polynomial}>
        <div className={styles.header}>
          <div className={styles.map}>
            <div className={styles.leftMap}>
              <p className={styles.standardP}>基准文件</p>
              <div className={styles.leftMapContainer}>
                <MapContainer
                  center={[30.5, 114.3]}
                  zoom={13}
                  className={styles.mapRoot}
                  id="mapRo"
                >
                  {/* 首字母必须大写 */}
                  <LeftVectorMap
                    hasBeenCalled={hasBeenCalled}
                    setHasBeenCalled={setHasBeenCalled}
                  />
                </MapContainer>
              </div>
            </div>

            <div className={styles.rightMap}>
              <p className={styles.rectifyP}>待校正文件</p>
              <div className={styles.rightMapContainer}>
                <MapContainer
                  center={[30.5, 114.3]}
                  zoom={13}
                  className={styles.mapRoot}
                  id="mapR"
                >
                  <RightVectorMap />
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.centre}>
          <Button onClick={handleClick} style={{ margin: "0 20px 0 10%" }}>
            增加点
          </Button>
          <Button>删除点</Button>
          <Button style={{ margin: "0 20px 0 20px" }}>预测点</Button>
          <Button>删除超标点</Button>
          <Button style={{ margin: "0 20px 0 60px" }}>匹配</Button>
          <Button>校正</Button>
        </div>

        <Table
          //   用于处理行选择状态变化时的事件
          rowSelection={rowSelection}
          //   这是一个数组，包含了Table的所有列的定义
          columns={columns}
          //  这是一个数组，包含了Table的数据源。每个数组元素代表一个数据行
          dataSource={data}
          //  滚动调条
          scroll={{ y: rowsToDisplay * rowHeight }}
          // 去掉分页符
          pagination={false}
          // bordered={true}
          size="small"
          // 使用 fixed layout
          tableLayout="fixed"
        />
      </div>
    </>
  );
};
export default JHJZ;
