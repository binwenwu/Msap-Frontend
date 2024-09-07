import { Button, Form, Input, InputNumber, Progress, Select } from "antd";
import styles from "@/components/box-center/utilsBox.module.scss";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hook";
import { eventEmitter } from "@/utils/events";
import { BASE_PATH, OUTPUT_PATH } from "@/utils/globalVariable";
import { getPath } from "@/request/operators";

interface YXTYProps {
  onFinish: (values: Record<string, any>) => void;
  setOpen: (open: boolean) => void;
}

interface FormProp {
  inputPath: string;
  crs: number;
  /**
   * 分辨率
   */
  scale: number;
}

const YXTY: React.FC<YXTYProps> = ({ onFinish, setOpen }) => {
  const layers = useAppSelector((state) => state.box.resourceLayers);
  const [status, setStatus] = useState<ProgressStatuses[number]>("active");
  const [epsgList, setEpsgList] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormProp>();

  const options = useMemo(() => {
    return layers.map((layer) => ({
      label: layer.name,
      value: layer.filePath,
    }));
  }, [layers]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${BASE_PATH}/epsg.json`);
        if (response.ok) {
          const jsonData = await response.json();
          setEpsgList(jsonData.data);
        } else {
          console.error("Failed to fetch data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

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
    setProgress(100);
    setStatus("exception");
  }, []);

  const handleCancel = useCallback(() => {
    setOpen(false);
    eventEmitter.emit("compute:pause", "ISODATA分类");
  }, []);

  useEffect(() => {
    eventEmitter.on("compute:progress", onProgressChange);
    eventEmitter.on("compute:failed", onExecuteFailed);
    eventEmitter.on("compute:done", onSuccess);
    return () => {
      eventEmitter.off("compute:progress", onProgressChange);
      eventEmitter.off("compute:failed", onExecuteFailed);
      eventEmitter.off("compute:done", onSuccess);
    };
  }, []);

  const handleFinish = async (values: FormProp) => {
    setLoading(true);
    setStatus("active");
    const inputPath = (
      await getPath({
        paths: values.inputPath,
      })
    )?.res?.toString();

    const params: Record<string, any> = {
      identifier: "Reproject",
      mode: "sync",
      inputs: {
        inputPath,
        crs: values.crs,
        scale: values.scale,
      },
    };
    onFinish?.(params);
  };

  const onSuccess = useCallback(() => {
    setLoading(false);
    setProgress(100);
    setStatus("success");
  }, []);

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
          label="选择影像"
          name="inputPath"
          rules={[{ required: true, message: "请选择影像" }]}
        >
          <Select
            showSearch
            placeholder="选择影像"
            style={{ width: 290 }}
            options={options}
          />
        </Form.Item>
        <Form.Item
          label="坐标系"
          name="crs"
          rules={[{ required: true, message: "请选择坐标系" }]}
        >
          <Select
            showSearch
            placeholder="请选择坐标"
            style={{ width: 290 }}
            options={[
              ...epsgList.map((item) => ({
                label: "EPSG:" + item,
                value: "EPSG:" + item,
              })),
            ]}
          />
        </Form.Item>
        <Form.Item label="分辨率" name="scale" rules={[{ required: true }]}>
          <InputNumber placeholder="请输入" style={{ width: 290 }} />
        </Form.Item>
        <div className={styles.formBtn}>
          <Button type="primary" htmlType="submit" loading={loading}>
            确认
          </Button>
          <Button onClick={handleCancel}>取消</Button>
        </div>
      </Form>
    </>
  );
};

export default YXTY;
