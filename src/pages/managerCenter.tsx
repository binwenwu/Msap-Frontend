import { useState } from "react";
import dynamic from "next/dynamic";
import SideBar from "@/components/manager-center/side-bar";
import LoadingSvg from "@/components/svgs/loading";
import styles from "@/styles/managerCenter.module.scss";

const IndexComponent = dynamic(
  () => import("@/components/manager-center/index")
);
const CourseComponent = dynamic(
  () => import("@/components/manager-center/course")
  // {
  //   loading: () => (
  //     <div
  //       style={{
  //         width: "100%",
  //         height: "100%",
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //       }}
  //     >
  //       <Spin indicator={<Icon component={LoadingSvg} />} />
  //     </div>
  //   ),
  // }
);
const ResourceComponent = dynamic(
  () => import("@/components/manager-center/resource")
);
const UserComponent = dynamic(() => import("@/components/manager-center/user"));
const RoleComponent = dynamic(() => import("@/components/manager-center/role"));
const VersionComponent = dynamic(
  () => import("@/components/manager-center/version")
);
const PersonComponent = dynamic(
  () => import("@/components/manager-center/person")
);

export default function ManagerCenter() {
  const [activeKey, setActiveKey] = useState("index");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const tabList: any = {
    index: <IndexComponent changeActiveKey={setActiveKey} />,
    course: <CourseComponent />,
    resource: <ResourceComponent />,
    user: <UserComponent />,
    role: <RoleComponent />,
    version: <VersionComponent />,
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
