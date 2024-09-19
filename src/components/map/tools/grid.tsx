import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import AutoGraticule from "leaflet-auto-graticule";

export default () => {
    const map = useMap();
    const gridRef = useRef<AutoGraticule>();
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const toolbar = document.getElementById("toolbar");
        const tool = document.createElement("div");
        tool.title = "网格";
        tool.style.cssText = `width:30px;height:30px;background-color:#fff;display:flex;justify-content:center;align-items:center;z-index:999;`;
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
      <path d="M981.333333 512a21.333333 21.333333 0 0 0 0-42.666667H725.333333v-170.666666h256a21.333333 21.333333 0 0 0 0-42.666667H725.333333V21.333333a21.333333 21.333333 0 0 0-42.666666 0v234.666667h-170.666667V21.333333a21.333333 21.333333 0 0 0-42.666667 0v234.666667h-170.666666V21.333333a21.333333 21.333333 0 0 0-42.666667 0v234.666667H21.333333a21.333333 21.333333 0 0 0 0 42.666667h234.666667v170.666666H21.333333a21.333333 21.333333 0 0 0 0 42.666667h234.666667v170.666667H21.333333a21.333333 21.333333 0 0 0 0 42.666666h234.666667v277.333334a21.333333 21.333333 0 0 0 42.666667 0V725.333333h170.666666v277.333334a21.333333 21.333333 0 0 0 42.666667 0V725.333333h170.666667v277.333334a21.333333 21.333333 0 0 0 42.666666 0V725.333333h256a21.333333 21.333333 0 0 0 0-42.666666H725.333333v-170.666667h256zM682.666667 298.666667v170.666666h-170.666667v-170.666666h170.666667z m-384 0h170.666666v170.666666h-170.666666v-170.666666z m0 384v-170.666667h170.666666v170.666667h-170.666666z m384 0h-170.666667v-170.666667h170.666667v170.666667z" fill="#231F20" p-id="1853"></path>
    </svg>`;
        toolbar?.appendChild(tool);
        tool.onclick = () => {
            setVisible((v) => !v);
        };
    }, []);

    useEffect(() => {
        if (visible) {
            gridRef.current = new AutoGraticule().addTo(map);
        } else {
            gridRef.current && map.removeLayer(gridRef.current);
        }
        return () => {
            gridRef.current && map.removeLayer(gridRef.current);
        };
    }, [visible]);

    return null;
};
