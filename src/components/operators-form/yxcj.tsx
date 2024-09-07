import { Button, Form, Progress, Select, message } from "antd";
import { useAppSelector } from "@/store/hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { eventEmitter } from "@/utils/events";
import { getPath, uploadGeojson } from "@/request/operators";
import styles from "@/components/box-center/utilsBox.module.scss";
interface YXCJProps {
  onFinish: (values: Record<string, any>) => void;
  setOpen: (open: boolean) => void;
}
// shp xml
const YXCJ: React.FC<YXCJProps> = ({ onFinish, setOpen }) => {
  const layers = useAppSelector((state) => state.box.resourceLayers);
  const drawLayers = useAppSelector((slice) => slice.box.drawLayers);
  const [areaLoading, setAreaLoading] = useState(false);
  const [areaPath, setAreaPath] = useState("");
  const [status, setStatus] = useState<ProgressStatuses[number]>("active");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const options = useMemo(() => {
    return layers.map((layer) => ({
      label: layer.name,
      value: layer.filePath,
    }));
  }, [layers]);

  const options2 = useMemo(() => {
    return drawLayers.map((layer) => ({
      label: layer.layerName,
      key: layer.layerName,
      value: JSON.stringify(layer.geojson),
    }));
  }, [drawLayers]);

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

  const handleFinish = async (values: Record<string, any>) => {
    if (!areaPath) {
      message.warning("请先裁剪区域！");
      return;
    }
    setLoading(true);
    setStatus("active");
    const input = (
      await getPath({
        paths: values.input,
      })
    )?.res?.toString();
    const mask = (
      await getPath({
        paths: areaPath,
      })
    )?.res?.toString();
    const params = {
      identifier: "ClipRasterByMaskLayer",
      mode: "sync",
      inputs: {
        input,
        mask,
      },
    };
    onFinish?.(params);
  };

  const onAreaChange = async (value: Record<string, any>) => {
    setAreaLoading(true);
    const filePath = (await uploadGeojson(value.label, value.value))?.data
      ?.path;
    // form.setFieldValue("TRAIN_AREAS", filePath);
    setAreaPath(filePath);
    setAreaLoading(false);
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
        autoComplete="off"
      >
        {/* <Form.Item
        label="输出影像名"
        name="outputFile"
        rules={[{ required: true, message: "请输入输出影像名" }]}
      >
        <Input style={{ width: 270 }} />
      </Form.Item> */}
        <Form.Item label="选择影像" name="input" rules={[{ required: true }]}>
          <Select
            allowClear
            showSearch
            placeholder="选择影像"
            style={{ width: 290 }}
            options={options}
          />
        </Form.Item>
        <Form.Item name="mask" label="裁切范围" rules={[{ required: true }]}>
          <Select
            allowClear
            loading={areaLoading}
            labelInValue
            showSearch
            placeholder="请选择"
            options={options2}
            style={{ width: 290 }}
            onChange={onAreaChange}
          />
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

export default YXCJ;
