import { Tabs, type TabsProps } from "antd";
import React, { useCallback, useState } from "react";
import HistoryCourse from "./history";
import TemplateCourse from "./template";
import styles from "./course.module.scss";

const items: TabsProps["items"] = [
  {
    key: "history",
    label: "历史课程",
  },
  {
    key: "template",
    label: "课程模板",
  },
];

interface Props {}

const tabComponent = {
  history: <HistoryCourse />,
  template: <TemplateCourse />,
};

const Index: React.FC<Props> = () => {
  const [currentKey, setCurrentKey] = useState("history");
  const onChange = useCallback((key: string) => {
    setCurrentKey(key);
  }, []);
  return (
    <div className={styles.container}>
      <Tabs defaultActiveKey={currentKey} items={items} onChange={onChange} />
      {tabComponent[currentKey]}
    </div>
  );
};

export default Index;
