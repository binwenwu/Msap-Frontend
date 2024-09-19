import { useCallback, useRef } from "react";
import { Drawer, type DrawerProps } from "antd";
import styles from "./index.module.scss";

interface CustomDrawerProps extends DrawerProps {}

const CustomDrawer: React.FC<CustomDrawerProps> = (props) => {
    const arrowRef = useRef<HTMLDivElement>(null);
    const widthRef = useRef(0);
    const visible = useRef(true);
    const handleHideAndShow = useCallback(() => {
        const wrapper =
            arrowRef.current?.parentElement?.parentElement?.parentElement;
        if (!wrapper) {
            return;
        }
        if (visible.current) {
            widthRef.current = wrapper.getBoundingClientRect().width;
            wrapper.style.right = -(widthRef.current - 238) + "px";
            visible.current = false;
        } else {
            wrapper.style.right = "0px";
            visible.current = true;
        }
    }, []);

    return (
        <Drawer {...props}>
            <div
                className={styles.arrow}
                onClick={handleHideAndShow}
                ref={arrowRef}
            />
            {props.children}
        </Drawer>
    );
};

export default CustomDrawer;
