import { CSSProperties } from "react";
import styles from "./index.module.scss";

interface Props {
    borderColor?: string;
    bgColor?: string;
    children?: any;
    style?: CSSProperties;
    onClick?: () => void;
}

const CustomButton: React.FC<Props> = ({
    borderColor,
    bgColor,
    children,
    style,
    onClick,
}) => {
    return (
        <div
            className={styles.btn}
            style={{
                borderColor,
                backgroundColor: bgColor,
                color: borderColor,
                ...style,
            }}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default CustomButton;
