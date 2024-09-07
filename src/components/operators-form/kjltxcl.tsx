import { Button, Form, InputNumber, Progress, Select, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hook";
import { eventEmitter } from "@/utils/events";
import { ExecuteBody, conversionPath, getPath } from "@/request/operators";
import styles from "@/components/box-center/utilsBox.module.scss";
import { OUTPUT_PATH } from "@/utils/globalVariable";

interface KJLTXCLProps {
  onFinish: (values: ExecuteBody) => void;
  setOpen: (open: boolean) => void;
}

interface FormProp {}

const KJLTXCL: React.FC<KJLTXCLProps> = ({ onFinish, setOpen }) => {
  const layers = useAppSelector((state) => state.box.resourceLayers);
  const [status, setStatus] = useState<ProgressStatuses[number]>("active");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormProp>();

  const options = useMemo(() => {
    return layers.map((layer) => ({
      label: layer.name,
      value: layer.filePath,
    }));
  }, []);

  const handleFinish = async (values: Record<string, any>) => {
    setLoading(true);
    setStatus("active");
    const FILE_PATH = (
      await getPath({
        paths: values.FILE_PATH,
      })
    )?.res.toString();
    const params = {
      ...values,
      FILE_PATH,
    };
    onFinish?.({
      identifier: "SpatialConnectivity",
      mode: "sync",
      inputs: {
        ...params,
      },
      // host_output_path: OUTPUT_PATH,
    });
  };

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

  const onProgressChange = useCallback(
    (value: number) => {
      setProgress(value);
      status !== "active" && setStatus("active");
    },
    [status]
  );

  const onExecuteFailed = useCallback(() => {
    setLoading(false);
    setProgress(100);
    setStatus("exception");
  }, []);

  const onSuccess = useCallback(() => {
    setLoading(false);
    setProgress(100);
    setStatus("success");
  }, []);

  const handleCancel = useCallback(() => {
    setOpen(false);
    eventEmitter.emit("compute:pause", "空间连通性处理");
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
        onFinish={handleFinish}
        form={form}
        autoComplete="off"
      >
        <Form.Item
          label="选择数据"
          name="FILE_PATH"
          rules={[{ required: true, message: "请选择" }]}
        >
          <Select
            showSearch
            placeholder="请选择"
            options={options}
            style={{ width: 290 }}
          />
        </Form.Item>
        <Form.Item label="聚合数" name="K" rules={[{ required: true }]}>
          <InputNumber style={{ width: 290 }} />
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

export default KJLTXCL;
