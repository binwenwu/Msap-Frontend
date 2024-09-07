import {
  Button,
  Checkbox,
  Collapse,
  Form,
  Input,
  InputNumber,
  Progress,
  Select,
  message,
  type UploadProps,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hook";
import { eventEmitter } from "@/utils/events";
import { getPath, uploadGeojson } from "@/request/operators"; //  上传方法
import styles from "@/components/box-center/utilsBox.module.scss";

interface ZCXLJFLProps {
  onFinish: (values: Record<string, any>) => void;
  setOpen: (open: boolean) => void;
}

interface FormProp {}

const ZCXLJFL: React.FC<ZCXLJFLProps> = ({ onFinish, setOpen }) => {
  const layers = useAppSelector((state) => state.box.resourceLayers);
  const drawLayers = useAppSelector((slice) => slice.box.drawLayers);
  const [status, setStatus] = useState<ProgressStatuses[number]>("active");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [areaLoading, setAreaLoading] = useState(false);
  const [areaPath, setAreaPath] = useState("");
  const [form] = Form.useForm<FormProp>();

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

  const handleFinish = async (values: Record<string, any>) => {
    if (!areaPath) {
      message.warning("请先选择训练区域！");
      return;
    }
    setLoading(true);
    setStatus("active");
    const GRIDS = (
      await getPath({
        paths: values.GRIDS,
      })
    )?.res?.toString();
    const ROI = (
      await getPath({
        paths: areaPath,
      })
    )?.res?.toString();
    const params: Record<string, any> = {
      identifier: "SVM",
      mode: "sync",
      inputs: {
        GRIDS,
        // GRIDS: "/mnt/oge/oge_mount/ogebos/algorithmData/Landsat_wh_s.tif",
        ROI,
        // ROI: "/mnt/oge/oge_mount/ogebos/algorithmData/sample_wh.shp",
        ROI_ID: values.ROI_ID,
      },
    };
    onFinish?.(params);
  };

  const onAreaChange = async (value: Record<string, any>) => {
    setAreaLoading(true);
    const filePath = (await uploadGeojson(value.label, value.value))?.data
      ?.path;
    setAreaPath(filePath);
    // form.setFieldValue("ROI", filePath);
    setAreaLoading(false);
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

  const onSuccess = useCallback(() => {
    setLoading(false);
    setProgress(100);
    setStatus("success");
  }, []);

  const handleCancel = useCallback(() => {
    setOpen(false);
    eventEmitter.emit("compute:pause", "支持向量机分类");
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
        <Form.Item label="选择影像" name="GRIDS" rules={[{ required: true }]}>
          <Select
            showSearch
            placeholder="请选择"
            options={options}
            style={{ width: 290 }}
          />
        </Form.Item>
        <Form.Item label="训练区域" name="ROI" rules={[{ required: true }]}>
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
        <Form.Item
          label="类别标识符"
          name="ROI_ID"
          rules={[{ required: true }]}
        >
          <Input placeholder="请输入" style={{ width: 290 }} />
        </Form.Item>

        <Collapse
          ghost
          items={[
            {
              label: "高级参数",
              children: (
                <div>
                  <Form.Item label="缩放" name="scaling" initialValue={2}>
                    <Select
                      style={{ width: 290 }}
                      options={[
                        { label: "none", value: 0 },
                        { label: "normalize(0-1)", value: 1 },
                        { label: "standardize", value: 2 },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item
                    label="冗长消息"
                    name="message"
                    valuePropName="checked"
                  >
                    <Checkbox />
                  </Form.Item>
                  <Form.Item label="模型来源" name="model_src" initialValue={0}>
                    <Select
                      style={{ width: 290 }}
                      options={[
                        { label: "create from trainning areas", value: 0 },
                        { label: "restore from file", value: 1 },
                      ]}
                    />
                  </Form.Item>

                  {/* <Form.Item label="从文件恢复模型" name="x">
        <Select options={[]} style={{ width: 290 }} />
      </Form.Item> */}

                  {/* <Form.Item label="存储模型到文件" name="elevDefault" initialValue="False">
        <Input placeholder="请输入" style={{ width: 290 }} />
      </Form.Item> */}
                  <Form.Item label="SVM类型" name="svm_type" initialValue={0}>
                    <Select
                      style={{ width: 290 }}
                      options={[
                        { label: "C-SVC", value: 0 },
                        { label: "nu-SVC", value: 1 },
                        { label: "one-class SVM", value: 2 },
                        { label: "epsilon-SVR", value: 3 },
                        { label: "nu-SVC", value: 4 },
                        { label: "nu-SVR", value: 5 },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item label="核类型" name="kernel_type" initialValue={2}>
                    <Select
                      style={{ width: 290 }}
                      options={[
                        { label: "linear", value: 0 },
                        { label: "polynomial", value: 1 },
                        { label: "radial basic function", value: 2 },
                        { label: "sigmoid", value: 3 },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item label="度" name="degree" initialValue={3}>
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item label="Gamma" name="gamma" initialValue={0}>
                    <Input placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item label="coefo" name="coef" initialValue={0}>
                    <Input placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item label="C" name="cost" initialValue={1}>
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item label="nu-SVR" name="nu" initialValue={0.5}>
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item
                    label="SVR Epsilon"
                    name="eps_svr"
                    initialValue={0.1}
                  >
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item
                    label="缓存大小"
                    name="cache_size"
                    initialValue={100}
                  >
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item label="Epsilon" name="eps" initialValue={0.001}>
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item
                    label="收缩"
                    name="shrinking"
                    valuePropName="checked"
                  >
                    <Checkbox />
                  </Form.Item>
                  <Form.Item
                    label="概率估计"
                    name="probability"
                    valuePropName="checked"
                  >
                    <Checkbox />
                  </Form.Item>
                  <Form.Item label="交差验证" name="crossval" initialValue={0}>
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                </div>
              ),
            },
          ]}
        />
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
export default ZCXLJFL;
