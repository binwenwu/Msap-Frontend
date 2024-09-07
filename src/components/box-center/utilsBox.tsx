import React, {
  Fragment,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { message } from "antd";
import CustomDrawer from "../drawer";
import dynamic from "next/dynamic";
import { eventEmitter } from "@/utils/events";
import { executeRepeatedly } from "@/utils/common";
import { BASE_PATH, OUTPUT_PATH } from "@/utils/globalVariable";
import { useDispatch } from "react-redux";
import { setPolynomial } from "@/store/slices/polynomialSlice";
import {
  ExecuteBody,
  executeTmsServer,
  getExtentAndZoom,
  executeOperator,
} from "@/request/operators";
import { useRouter } from "next/router";
import styles from "./utilsBox.module.scss";

const FSDB = dynamic(() => import("@/components/operators-form/fsdb"), {
  ssr: false,
});
const DQJZ = dynamic(() => import("@/components/operators-form/dqjz"), {
  ssr: false,
});
const ZSJZ = dynamic(() => import("@/components/operators-form/zsjz"), {
  ssr: false,
});
const JHJZ = dynamic(() => import("@/components/operators-form/jhjz"), {
  ssr: false,
});
const ZFTPP = dynamic(() => import("@/components/operators-form/zftpp"), {
  ssr: false,
});
const YXXQ = dynamic(() => import("@/components/operators-form/yxxq"), {
  ssr: false,
});
const YXCJ = dynamic(() => import("@/components/operators-form/yxcj"), {
  ssr: false,
});
const YXRH = dynamic(() => import("@/components/operators-form/yxrh"), {
  ssr: false,
});
const YXTY = dynamic(() => import("@/components/operators-form/yxty"), {
  ssr: false,
});

const ISODATA = dynamic(() => import("@/components/operators-form/ISODATA"), {
  ssr: false,
});
const ZXJLFL = dynamic(() => import("@/components/operators-form/zxjlfl"), {
  ssr: false,
});
const ZDSRFL = dynamic(() => import("@/components/operators-form/zdsrfl"), {
  ssr: false,
});
const SJWLFL = dynamic(() => import("@/components/operators-form/sjwlfl"), {
  ssr: false,
});
const ZCXLJFL = dynamic(() => import("@/components/operators-form/zcxljfl"), {
  ssr: false,
});
const JCSFL = dynamic(() => import("@/components/operators-form/jcsfl"), {
  ssr: false,
});
const BYSFL = dynamic(() => import("@/components/operators-form/bysfl"), {
  ssr: false,
});
const SJSLFL = dynamic(() => import("@/components/operators-form/sjslfl"), {
  ssr: false,
});

const TJFX = dynamic(() => import("@/components/operators-form/tjfx"), {
  ssr: false,
});
const GLFX = dynamic(() => import("@/components/operators-form/glfx"), {
  ssr: false,
});
const XCFX = dynamic(() => import("@/components/operators-form/xcfx"), {
  ssr: false,
});

const JDYZ = dynamic(() => import("@/components/operators-form/jdyz"), {
  ssr: false,
});
const KJLTXCL = dynamic(() => import("@/components/operators-form/kjltxcl"), {
  ssr: false,
});
const KJLB = dynamic(() => import("@/components/operators-form/kjlb"), {
  ssr: false,
});
const formComponent = {
  影像投影: YXTY,
  影像裁剪: YXCJ,
  影像镶嵌: YXXQ,
  影像融合: YXRH,
  正射校正: ZSJZ,
  大气校正: DQJZ,
  多项式几何校正: JHJZ,
  直方图匹配: ZFTPP,
  辐射定标: FSDB,
  // 影像分析
  ISODATA分类: ISODATA,
  最小距离分类: ZXJLFL,
  最大似然分类: ZDSRFL,
  神经网络分类: SJWLFL,
  支持向量机分类: ZCXLJFL,
  决策树分类: JCSFL,
  贝叶斯分类: BYSFL,
  随机森林分类: SJSLFL,
  // 分类后片
  统计分析: TJFX,
  过滤分析: GLFX,
  消除分析: XCFX,

  // 其它
  精度验证: JDYZ,
  空间连通性处理: KJLTXCL,
  空间滤波: KJLB,
};

interface DynamicComponentProps {
  componentName: string;
  onFinish: (values: ExecuteBody) => void;
  setOpen: (open: boolean) => void;
}

const DynamicComponentRenderer: React.FC<DynamicComponentProps> = ({
  componentName,
  onFinish,
  setOpen,
}) => {
  const Component = formComponent[componentName];

  if (!Component) {
    return <div>404 Not Found</div>; // 或者返回一个加载指示器
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component onFinish={onFinish} setOpen={setOpen} />
    </Suspense>
  );
};

interface UtilsBoxProps {}

interface OnFinishParams extends ExecuteBody {
  name?: string;
}

const UtilsBox: React.FC<UtilsBoxProps> = () => {
  const operatorsRef = useRef({
    影像处理: [
      "辐射定标",
      "正射校正",
      "大气校正",
      "多项式几何校正",
      "直方图匹配",
      "影像镶嵌",
      "影像裁剪",
      "影像融合",
      "影像投影",
      "空间滤波",
    ],
    影像分类: [
      "ISODATA分类",
      "最小距离分类",
      "最大似然分类",
      "神经网络分类",
      "支持向量机分类",
      "决策树分类",
      "贝叶斯分类",
      "随机森林分类",
    ],
    分类后处理: [
      "统计分析",
      "过滤分析",
      "消除分析",
      "精度验证",
      "空间连通性处理",
    ],
  });

  const [drawTitle, setDrawTitle] = useState("影像投影");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const rightContainerRef = useRef<HTMLDivElement>(null);
  const rightArrowRef = useRef<HTMLDivElement>(null);

  const pauseProcessName = useRef("");

  const onChangeProcessName = useCallback((processName: string) => {
    pauseProcessName.current = processName;
  }, []);

  useEffect(() => {
    eventEmitter.on("compute:pause", onChangeProcessName);
    return () => {
      eventEmitter.off("compute:pause", onChangeProcessName);
    };
  }, []);
  // 控制多项式页面的布尔值
  const dispatch = useDispatch();
  // X好关闭
  const handleClose = useCallback(() => {
    // 点击X号关闭页面
    dispatch(setPolynomial(false));
    setOpen(false);
    onChangeProcessName(drawTitle);
    eventEmitter.emit("operator:resetZoom");
  }, [drawTitle]);

  const handleRightArrow = useCallback(() => {
    const isCollapse = rightContainerRef.current?.classList.contains(
      styles.rightHidden
    );
    if (!isCollapse) {
      rightContainerRef.current?.classList.add(styles.rightHidden);
      rightArrowRef.current?.classList.add(styles.rightArrowHidden);
    } else {
      rightContainerRef.current?.classList.remove(styles.rightHidden);
      rightArrowRef.current?.classList.remove(styles.rightArrowHidden);
    }
  }, []);

  const handleOpenOperator = useCallback((title: string) => {
    setDrawTitle(title);
    setOpen(true);
  }, []);

  const onFinish = useCallback(async (params: OnFinishParams) => {
    message.success("开始执行！");
    const paseTask = executeRepeatedly(
      (value: number) => {
        eventEmitter.emit("compute:progress", value);
      },
      20,
      99
    );
    try {
      // 0不上图 1上图
      const flag = ["jdyz", "tjfx"].includes(params.name!) ? 0 : 1;
      const query = router.query;
      const practiceInstanceId = query.practiceInstanceId as string;
      const taskInstanceId = query.taskInstanceId as string;
      const executeResponse = await executeOperator({
        ...params,
        practiceInstanceId,
        practiceTaskId: taskInstanceId,
        flag: 0,
      });
      if (executeResponse.code !== 20000) {
        message.error("计算失败！请稍后重试。");
        paseTask();
        eventEmitter.emit("compute:failed");
        return;
      }
      const data = executeResponse.data?.result;
      // const name = executeResponse.data?.result.name;
      if (!flag) {
        eventEmitter.emit("operator:custom", data);
        paseTask();
        eventEmitter.emit("compute:done");
        return;
      }
      const extentResponse = await getExtentAndZoom({
        identifier: "GetZoom",
        mode: "sync",
        inputs: {
          inputPath: data?.result?.[0]?.value,
        },
        host_output_path: OUTPUT_PATH,
      });
      const lnglatStr = extentResponse.result?.[0]?.value;
      const maxZoom = extentResponse.result?.[1]?.value;

      eventEmitter.emit("operator:centerAt", {
        lnglatStr,
        maxZoom: Number(maxZoom) - 0,
      });
      const tmsResponse = await executeTmsServer({
        identifier: "VisualizeOnTheFlyEdu",
        mode: "sync",
        inputs: {
          inputPath: data?.result?.[0].value,
          level: Number(maxZoom) - 0,
          coverageReadFromUploadFile: false,
        },
        host_output_path: OUTPUT_PATH,
      });
      // todo 暂时使用jobId当layerName
      eventEmitter.emit("operator:draw", {
        jobId: tmsResponse?.jobId,
        lnglatStr,
        maxZoom,
        minZoom: Number(maxZoom) - 2,
        identifier: params.identifier,
        filePath: data?.result?.[0]?.value,
      });
      eventEmitter.emit("compute:done");
      paseTask();
    } catch (err) {
      message.error("计算失败！请稍后重试。");
      eventEmitter.emit("compute:failed");
      paseTask();
      console.error(err);
    }
  }, []);

  return (
    <>
      <div className={styles.right} ref={rightContainerRef}>
        <div
          className={styles.arrow}
          ref={rightArrowRef}
          onClick={handleRightArrow}
        />
        <div className={styles.titleBox}>
          <img
            src={`${BASE_PATH}/img/box/tools.webp`}
            alt="工具箱"
            className={styles.layerIcon}
          />
          工具箱
        </div>
        <div className={styles.operators}>
          {Object.keys(operatorsRef.current).map((key) => {
            return (
              <Fragment key={key}>
                <div className={styles.cateTitle}>{key}</div>
                <div className={styles.operatorNameBox}>
                  {operatorsRef.current[key].map((title: string) => {
                    return (
                      <div
                        className={styles.operatorName}
                        key={title}
                        onClick={() => handleOpenOperator(title)}
                      >
                        <img
                          src={`${BASE_PATH}/img/box/cube.webp`}
                          className={styles.boxIcon}
                        />
                        {title}
                      </div>
                    );
                  })}
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
      <CustomDrawer
        open={open}
        title={drawTitle}
        onClose={handleClose}
        destroyOnClose
        width={460}
        rootStyle={{
          top: 64,
          height: "calc(100% - 640x)",
        }}
        mask={false}
      >
        <DynamicComponentRenderer
          componentName={drawTitle}
          onFinish={onFinish}
          setOpen={setOpen}
        />
      </CustomDrawer>
    </>
  );
};

export default UtilsBox;
