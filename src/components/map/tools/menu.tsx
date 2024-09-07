import { Button, Form, Input, Menu, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import L from "leaflet";
import { FeatureGroup, useMap } from "react-leaflet";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { addDrawLayers, toogleSaveOpen } from "@/store/slices/boxSlice";
import styles from "../Map.module.scss";
import { EditControl } from "react-leaflet-draw";

interface MenuProps {}

// 弹窗数据
const items = [
  {
    key: "save",
    label: "保存",
  },
  {
    key: "del",
    label: "删除",
  },
];

const RightKeyMenu: React.FC<MenuProps> = () => {
  const boxSlice = useAppSelector((slice) => slice.box);
  const layerOptions = boxSlice.drawLayers.map((layer) => ({
    label: layer.layerName,
    value: layer.layerName,
  }));
  const [saveForm] = Form.useForm();
  const dispatch = useAppDispatch();
  const [visible, setVisible] = useState(false);
  const [isLayerNameVisible, setIsLayerNameVisible] = useState(true); // 控制输入框的可见性
  const [currentLayer, setCurrentLayer] = useState<any>();
  const [point, setPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    document.body.onclick = () => {
      setVisible(false);
    };
    document.getElementById("mapRoot")!.oncontextmenu = (event) => {
      event.preventDefault();
    };
  }, []);

  // 弹窗点击事件
  const onClick = (info: any) => {
    if (info.key === "save") {
      dispatch(toogleSaveOpen(true));
    }
  };

  const onSave = (values: Record<string, any>) => {
    // 确认后弹窗消失
    setVisible(false);
    //  挂载到全局
    window.layerMap[currentLayer._leaflet_id] = currentLayer;
    dispatch(
      addDrawLayers({
        type: "add",
        layerObj: {
          oldLayerName: values.oldLayerName,
          layerName: values.layerName,
          layerId: currentLayer._leaflet_id,
          geojson: (currentLayer as L.Polygon).toGeoJSON(),
        },
      })
    );
    setIsLayerNameVisible(true);
    dispatch(toogleSaveOpen(false));
  };

  const onDrawCreated = (e: L.DrawEvents.Created) => {
    const { layer } = e;
    // 获取鼠标的位置信息
    layer.on("contextmenu", (evt) => {
      setCurrentLayer(layer);
      setPoint(evt.containerPoint);
      setVisible(true);
    });
    // 获取范围信息
    if (layer instanceof L.Circle) {
      const center = layer.getLatLng();
      const radius = layer.getRadius();
    } else if (layer instanceof L.Rectangle || layer instanceof L.Polygon) {
      const bounds = layer.getBounds();
      const geojson = layer.toGeoJSON();
    } else if (layer instanceof L.Polyline) {
      const latlngs = layer.getLatLngs();
      console.log("Polyline Coordinates:", latlngs);
    } else if (layer instanceof L.Marker) {
      const latlng = layer.getLatLng();
      console.log("Marker Coordinates:", latlng);
    }
  };

  useEffect(() => {
    const control = document.querySelector(
      ".leaflet-draw.leaflet-control"
    ) as HTMLDivElement;
    const section = document.createElement("div");
    control.style.cursor = "pointer";
    section.classList.add("leaflet-draw-section");
    const toolbar = document.createElement("div");
    toolbar.classList.add("leaflet-draw-toolbar");
    toolbar.classList.add("leaflet-bar");
    section.appendChild(toolbar);
    toolbar.id = "toolbar";
    control?.appendChild(section);
  }, []);

  return (
    <>
      <FeatureGroup>
        <EditControl
          position="topright"
          onCreated={onDrawCreated}
          draw={{
            rectangle: true,
            polyline: true,
            circle: true,
            polygon: true,
            marker: true,
          }}
        />
      </FeatureGroup>
      {visible ? (
        <div
          className={styles.mouseMenu}
          style={{
            position: "absolute",
            zIndex: 999,
            top: point.y,
            left: point.x,
          }}
        >
          <Menu
            onClick={onClick}
            style={{
              width: 150,
            }}
            mode="vertical"
            items={items}
          />
        </div>
      ) : null}
      <Modal
        title="保存"
        width={300}
        open={boxSlice.saveOpen}
        footer={null}
        destroyOnClose
        onCancel={() => {
          setIsLayerNameVisible(true);
          dispatch(toogleSaveOpen(false));
        }}
      >
        <Form
          form={saveForm}
          preserve={false}
          labelCol={{ span: 8 }}
          onFinish={onSave}
        >
          <Form.Item label="选择图层" name="oldLayerName">
            <Select
              options={layerOptions}
              onChange={(value) => setIsLayerNameVisible(!value)} // 当选择时切换输入框的可见性
            />
          </Form.Item>
          {isLayerNameVisible && (
            <Form.Item
              label="图层名"
              name="layerName"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          )}
          <div className={styles.btns}>
            <Button onClick={() => dispatch(toogleSaveOpen(false))}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              确认
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default RightKeyMenu;
