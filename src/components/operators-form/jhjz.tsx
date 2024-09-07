import {
  Button,
  Form,
  Progress,
  Select,
  Radio,
  type RadioChangeEvent,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hook";
import { eventEmitter } from "@/utils/events";
import { useSelector, useDispatch } from "react-redux";
import { setPolynomial } from "@/store/slices/polynomialSlice";
import styles from "@/components/box-center/utilsBox.module.scss";

interface JHJZProps {
  onFinish: (values: Record<string, any>) => void;
  setOpen: (open: boolean) => void;
}

interface FormProp {}

const JHJZ: React.FC<JHJZProps> = ({ onFinish, setOpen }) => {
  const layers = useAppSelector((state) => state.box.resourceLayers);
  const [status, setStatus] = useState<ProgressStatuses[number]>("active");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormProp>();

  const options = useMemo(() => {
    return [];
  }, [layers]);

  const onProgressChange = useCallback(
    (value: number) => {
      setProgress(value);
      status !== "active" && setStatus("active");
      if (value === 100) {
        setLoading(false);
        setStatus("success");
      }
    },
    [status]
  );

  const onExecuteFailed = useCallback(() => {
    setLoading(false);
    setProgress(0);
  }, []);
  // 关闭按钮
  const handleCancel = useCallback(() => {
    dispatch(setPolynomial(true)); // 调用action creator来更新状态
    setOpen(false);
    eventEmitter.emit("compute:pause", "ISODATA分类");
  }, []);

  useEffect(() => {
    eventEmitter.on("compute:progress", onProgressChange);
    eventEmitter.on("compute:failed", onExecuteFailed);
    return () => {
      eventEmitter.off("compute:progress", onProgressChange);
      eventEmitter.off("compute:failed", onExecuteFailed);
    };
  }, []);

  const handleFinish = (values: Record<string, any>) => {
    setLoading(true);
    setStatus("active");
  };

  // 控制多项式页面的布尔值

  const dispatch = useDispatch();
  // // 控制点按钮
  // const handleRadioClick = (e) => {
  //   // 在这里处理你的逻辑
  //   dispatch(setPolynomial(e.bubbles)); // 调用action creator来更新状态
  // };

  // 控制点,选择影像
  const [radioValue, setRadioValue] = useState(0);

  const onChange = (e: RadioChangeEvent) => {
    console.log("radio checked", e);
    setRadioValue(e.target.value);
    dispatch(setPolynomial(e.target.checked)); // 调用action creator来更新状态
  };

  return (
    <>
      <Progress
        status={status}
        style={{ position: "absolute", top: 50, left: 0 }}
        percent={progress}
        format={() => ""}
      />
      <Form
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        initialValues={{ remember: true }}
        onFinish={handleFinish}
        form={form}
        autoComplete="off"
      >
        <Form.Item
          label="输入影像"
          name="imagary"
          rules={[{ required: true, message: "请选择影像" }]}
        >
          <Select
            showSearch
            placeholder="请选择"
            options={options}
            style={{ width: 290 }}
          />
        </Form.Item>

        <Form.Item
          label="选择数据"
          name="type"
          rules={[{ required: true, message: "选择数据" }]}
        >
          <Radio.Group onChange={onChange} value={radioValue}>
            <Radio value={1}>控制点</Radio>
            <Radio value={2}>参考影像</Radio>
          </Radio.Group>
        </Form.Item>

        {radioValue == 1 ? (
          <Form.Item
            label="控制点类型"
            name="pointType"
            rules={[{ required: true, message: "控制点类型" }]}
            labelCol={{ span: 6 }} // 控制标签的列数
            wrapperCol={{ span: 18 }} // 控制输入框的列数
          >
            <Select
              showSearch
              placeholder="请选择"
              options={options}
              style={{ width: 290 }}
            />
          </Form.Item>
        ) : null}

        {radioValue == 2 ? (
          <Form.Item
            label="影像类型"
            name="pointType"
            rules={[{ required: true, message: "影像类型" }]}
            labelCol={{ span: 6 }} // 控制标签的列数
            wrapperCol={{ span: 14 }} // 控制输入框的列数
          >
            <Select
              showSearch
              placeholder="请选择"
              options={options}
              style={{ width: 290 }}
            />
          </Form.Item>
        ) : null}

        {/* <Radio.Group >
          <div  style={{ marginLeft: '6px',marginBottom:"14px"}}>
          <Radio value={1} style={{padding:"0 ",marginLeft:"13px", border: 'none'}} onClick={handleRadioClick} >控制点：</Radio>
          <Checkbox.Group style={{marginBottom:"10px",marginLeft:"-12px"}} >
            <Select
            showSearch
            placeholder="请选择"
            style={{ width: 290 }}
            options={[
              {
                value: 'txt',
                label: 'txt',
              },
              {
                value: 'cxt',
                label: 'cxt',
              },
              {
                value: 'word',
                label: 'word',
              },
            ]}  />

          </Checkbox.Group>
          </div>
          <div  style={{ marginLeft: '-8px',marginBottom:"14px" }}>
          <Radio value={2} style={{padding:"0 ",marginLeft:"13px", border: 'none'}}>参数影像：</Radio>
          <Checkbox.Group style={{marginBottom:"10px",marginLeft:"-12px"}}>
            <Select
            showSearch
            placeholder="请选择"
            options={[
              {
                value: '课程数据',
                label: '课程数据',
              },
            ]}
            style={{ width: 290 }}
          />
          </Checkbox.Group>
          </div>
        </Radio.Group> */}

        <Form.Item
          label="采样方法"
          name="sampling"
          rules={[{ required: true, message: "请选择影像" }]}
        >
          <Select
            showSearch
            placeholder="请选择"
            options={[
              {
                value: "Nearest Neighbour",
                label: "Nearest Neighbour",
              },
              {
                value: "Bilinear(2x2 Kernel)",
                label: "Bilinear(2x2 Kernel)",
              },
              {
                value: "Cubic(4x4 Kerel)",
                label: "Cubic(4x4 Kerel)",
              },
              {
                value: "Cubic B-Spline(4x4 Kerel)",
                label: "Cubic B-Spline(4x4 Kerel)",
              },
              {
                value: "Lanczos(6x6 Kerel)",
                label: "Lanczos(6x6 Kerel)",
              },
            ]}
            style={{ width: 290 }}
          />
        </Form.Item>

        <Form.Item
          label="纠正方法"
          name="correct"
          rules={[{ required: true, message: "请选择影像" }]}
        >
          <Select
            showSearch
            placeholder="请选择"
            options={[
              {
                value: "Nearest Neighbour",
                label: "Nearest Neighbour",
              },
              {
                value: "Bilinear(2x2 Kernel)",
                label: "Bilinear(2x2 Kernel)",
              },
              {
                value: "Cubic(4x4 Kerel)",
                label: "Cubic(4x4 Kerel)",
              },
              {
                value: "Cubic B-Spline(4x4 Kerel)",
                label: "Cubic B-Spline(4x4 Kerel)",
              },
              {
                value: "Lanczos(6x6 Kerel)",
                label: "Lanczos(6x6 Kerel)",
              },
            ]}
            style={{ width: 290 }}
          />
        </Form.Item>

        <div className={styles.formBtn} style={{ marginRight: "16px" }}>
          {/* <Button type="primary" htmlType="submit" loading={loading}>
            确认
          </Button> */}
          <Button onClick={handleCancel}>关闭</Button>
        </div>
      </Form>
    </>
  );
};

export default JHJZ;
