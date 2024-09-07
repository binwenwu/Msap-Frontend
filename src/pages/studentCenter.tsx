import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { message } from "antd";
import SideBar from "@/components/student-center/side-bar";
import { useAppDispatch } from "@/store/hook";
import styles from "@/styles/studentCenter.module.scss";

const TaskComponent = dynamic(() => import("@/components/student-center/task"));
const PersonComponent = dynamic(
  () => import("@/components/student-center/person")
);

export default function StudentCenter() {
  const dispatch = useAppDispatch();
  const [activeKey, setActiveKey] = useState("task");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const tabList: any = {
    task: <TaskComponent />,
    person: <PersonComponent />,
  };

  const changeActiveKeys = (key: string) => {
    switchComponent(key);
  };

  const switchComponent = (key: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveKey(key);
      setIsTransitioning(false);
    }, 500);
  };
  return (
    <div className={styles.mainBox}>
      <div className={styles.leftBox}>
        <SideBar changeActiveKeys={changeActiveKeys} activeKey={activeKey} />
      </div>
      <div
        className={`${styles.rightBox} ${styles.transition} ${
          isTransitioning ? styles.fadeOut : styles.fadeIn
        }`}
      >
        {tabList[activeKey]}
      </div>
    </div>
  );
}
