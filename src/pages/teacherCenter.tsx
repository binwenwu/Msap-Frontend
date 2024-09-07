import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { message } from "antd";
import { useAppDispatch } from "@/store/hook";
import SideBar from "@/components/teacher-center/side-bar";
import styles from "@/styles/teacherCenter.module.scss";

const IndexComponent = dynamic(
  () => import("@/components/teacher-center/index")
);
const CourseComponent = dynamic(
  () => import("@/components/teacher-center/course")
);
const ResourceComponent = dynamic(
  () => import("@/components/teacher-center/resource")
);
const PersonComponent = dynamic(
  () => import("@/components/teacher-center/person")
);

export default function TeacherCenter() {
  const dispatch = useAppDispatch();
  const [activeKey, setActiveKey] = useState("index");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const tabList = {
    index: <IndexComponent changeActiveKey={setActiveKey} />,
    course: <CourseComponent />,
    resource: <ResourceComponent />,
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
