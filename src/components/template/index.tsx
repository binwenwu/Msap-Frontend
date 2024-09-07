import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Modal, Button, message } from "antd";
import { Steps } from "../Steps";
import styles from "./index.module.scss";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import {
  initState,
  setCurrent,
  toogleOpen,
} from "@/store/slices/templateSlice";
import { queryTemplateDetail } from "@/request/template";
import { queryCourseDetail } from "@/request/course";

interface TemplateProps {
  /**
   * 1. 创建
   * 2. 编辑
   * 3. 查看
   */
  isEdit: 1 | 2 | 3;
  course?: Record<string, any>;
  status?: number; // 1 我的模板 | 2 平台模板
  type?: number; // 1 模板  | 2 课程
}

const BaseInfoComponent = dynamic(() => import("./baseInfo"));
const TaskComponent = dynamic(() => import("./task"));
const ReportComponent = dynamic(() => import("./report"));
const RateComponent = dynamic(() => import("./rate"));

const items = [
  { title: "基础信息" },
  { title: "实习任务" },
  { title: "实习报告" },
  { title: "评分准则" },
];

const titleMap = {
  1: "创建课程",
  2: "编辑课程",
  3: "课程详情",
};

const Template: React.FC<TemplateProps> = ({
  isEdit,
  course,
  status,
  type,
}) => {
  const dispatch = useAppDispatch();
  const { current, open } = useAppSelector((slice) => slice.template);
  const edit = [1, 2].includes(isEdit);
  const [detail, setDetail] = useState<Record<string, any>>({});
  const stepComponents = {
    0: <BaseInfoComponent isEdit={edit} detail={detail} />,
    1: <TaskComponent isEdit={edit} detail={detail} />,
    2: <ReportComponent isEdit={edit} detail={detail} />,
    3: <RateComponent isEdit={edit} detail={detail} status={status} />,
  };

  // const handleConfirm = useCallback(() => {}, []);

  useEffect(() => {
    if (type === 1) {
      if ([2, 3].includes(isEdit) && open) {
        queryTemplateDetail(course!.id)
          .then((resp) => {
            console.log(resp);
            setDetail(resp);
          })
          .catch((err) => {
            console.error(err);
            message.error("获取模板详情失败！");
          });
      } else {
        setDetail({});
      }
    }
  }, [course, open]);

  useEffect(() => {
    if (type === 2) {
      if ([2, 3].includes(isEdit) && open) {
        queryCourseDetail(course!.id)
          .then((resp) => {
            console.log(resp);
            setDetail(resp);
          })
          .catch((err) => {
            console.error(err);
            message.error("获取课程详情失败！");
          });
      } else {
        setDetail({});
      }
    }
  }, [course, open]);

  return (
    <Modal
      title={titleMap[isEdit]}
      maskClosable={false}
      width={600}
      open={open}
      onCancel={() => {
        dispatch(toogleOpen(false));
        dispatch(initState());
      }}
      footer={null}
      destroyOnClose
    >
      <div className={styles.contaienr}>
        <div className={styles.stepsBar}>
          <Steps items={items} edit={edit} />
        </div>

        <div className={styles.stepsCom}>{stepComponents[current]}</div>
      </div>
    </Modal>
  );
};

export default Template;
