import React, { useCallback } from "react";
import styles from "./index.module.scss";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { setCurrent } from "@/store/slices/templateSlice";

interface Item {
  title: string;
}

export interface StepsProps {
  items: Item[];
  edit: boolean;
  onChange?: (current: number) => void;
}

const Steps: React.FC<StepsProps> = ({ items, edit, onChange }) => {
  const dispatch = useAppDispatch();
  const { current } = useAppSelector((slice) => slice.template);

  const handleStepChange = useCallback((index: number) => {
    // 只有查看详情时可点击步骤跳转
    if (edit) {
      return;
    }
    dispatch(setCurrent(index));
  }, []);
  return (
    <div className={styles["steps-container"]}>
      {items.map((item, index) => {
        const isActive = current > index - 1;
        const isLineActive = current > index;
        const { title } = item;
        return (
          <div className={styles.step} onClick={() => handleStepChange(index)}>
            <div
              className={`${styles["step-number"]} ${
                isActive ? styles.active : ""
              }`}
            >
              {index + 1}
            </div>
            <div
              className={`${styles["step-description"]} ${
                isActive ? styles.active : ""
              }`}
            >
              {title}
            </div>
            {index < items.length - 1 ? (
              <div
                className={`${styles["step-line"]} ${
                  isLineActive ? styles.active : ""
                }`}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export { Steps };
