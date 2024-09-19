import { message } from "antd";
import L from "leaflet";
import { useCallback, useEffect, useState } from "react";
import { useMap } from "react-leaflet";

export default () => {
    const [messageApi, contextHolder] = message.useMessage();
    const map = useMap();
    const mapContainer = map.getContainer();
    const [lat, setLat] = useState<number>(0);
    const [lng, setLng] = useState<number>(0);

    useEffect(() => {
        const toolbar = document.getElementById("toolbar");
        const tool = document.createElement("div");
        tool.title = "坐标拾取";
        tool.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            onMyButtonCoordinate();
        };
        tool.style.cssText = `width:30px;height:30px;background-color:#fff;display:flex;justify-content:center;align-items:center;z-index:999;border-bottom:1px solid #ccc;`;
        tool.innerHTML = `<svg
      style="
        width: 50%;
        height: 50%;
      "
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
    >
    <path
        d="M739.555556 473.884444H550.115556V284.444444H473.884444v189.44H284.444444v76.231112h189.44V739.555556h76.231112V550.115556H739.555556V473.884444zM369.777778 862.435556H161.564444V654.222222H85.333333v284.444445h284.444445v-76.231111zM862.435556 654.222222v208.213334H654.222222v76.231111h284.444445v-284.444445h-76.231111zM369.777778 85.333333h-284.444445v284.444445h76.231111V161.564444H369.777778V85.333333zM654.222222 85.333333v76.231111h208.213334V369.777778h76.231111v-284.444445h-284.444445z"
        fill="#15165"
      />
    </svg>`;
        toolbar?.appendChild(tool);
    }, []);

    const leftClickHandler = useCallback((evt: L.LeafletMouseEvent) => {
        L.marker(evt.latlng);
        setLat(evt.latlng.lat);
        setLng(evt.latlng.lng);
        map.off("click", leftClickHandler);
        mapContainer.style.cursor = "pointer";
    }, []);

    const onMyButtonCoordinate = useCallback(() => {
        map.on("click", leftClickHandler);
        mapContainer.style.cursor = "crosshair";
    }, [leftClickHandler]);

    const success = useCallback(() => {
        messageApi.open({
            type: "success",
            content: `经度${lng},纬度${lat}`,
        });
    }, [lat, lng, messageApi]);

    useEffect(() => {
        if (lat !== 0 && lng !== 0) {
            success();
        }
    }, [lat, lng, success]);

    return <div>{contextHolder}</div>;
};
