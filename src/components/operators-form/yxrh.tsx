import {
  Button,
  Form,
  Collapse,
  InputNumber,
  Progress,
  Select,
  Upload,
  type UploadProps,
  Input,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hook";
import { UploadOutlined } from "@ant-design/icons";
import { eventEmitter } from "@/utils/events";
import { getPath } from "@/request/operators";
import styles from "@/components/box-center/utilsBox.module.scss";

interface YXRHProps {
  onFinish: (values: Record<string, any>) => void;
  setOpen: (open: boolean) => void;
}

interface FormProp {}

const YXTY: React.FC<YXRHProps> = ({ onFinish, setOpen }) => {
  const layers = useAppSelector((state) => state.box.resourceLayers);
  const userInfo = useAppSelector((state) => state.user.userInfo);
  const [status, setStatus] = useState<ProgressStatuses[number]>("active");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormProp>();
  const [method, setMethod] = useState("PCA");

  const options = useMemo(() => {
    return layers.map((layer) => ({
      label: layer.name,
      value: layer.filePath,
    }));
  }, [layers]);

  const uploadProps: UploadProps = {
    name: "file",
    headers: {
      token: userInfo.token!,
    },
    beforeUpload() {
      return false;
    },
    async onChange({ file }) {
      form.setFieldValue("elevGeoid", file);
    },
    maxCount: 1,
  };

  const [opeator, setOperator] = useState("rcs");
  const [interpolator, setInterpolator] = useState("bco");

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
    setLoading(true);
    setStatus("active");
    const MUX = (
      await getPath({
        paths: values.MUX,
      })
    )?.res?.toString();
    const PAN = (
      await getPath({
        paths: values.PAN,
      })
    )?.res?.toString();

    const params: Record<string, any> = {
      identifier: "ImageFusion",
      mode: "sync",
      inputs: {
        MUX,
        PAN,
        METHOD: values.METHOD,
      },
    };
    if (!["PCA", "Pansharpening"].includes(method)) {
      params.inputs.BANDS = [2, 3, 4];
    }
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
        <Form.Item label="全色影像" name="PAN" rules={[{ required: true }]}>
          <Select
            showSearch
            placeholder="选择影像"
            options={options}
            style={{ width: 290 }}
          />
        </Form.Item>
        <Form.Item label="多光谱影像" name="MUX" rules={[{ required: true }]}>
          <Select
            showSearch
            placeholder="选择影像"
            options={options}
            style={{ width: 290 }}
          />
        </Form.Item>
        <Form.Item label="融合方法" name="METHOD" rules={[{ required: true }]}>
          <Select
            showSearch
            onChange={(value) => setMethod(value)}
            placeholder="选择路径"
            options={[
              { label: "PCA", value: "PCA" },
              { label: "IHS", value: "IHS" },
              { label: "brovey", value: "brovey" },
              { label: "Pansharpening", value: "Pansharpening" },
            ]}
            style={{ width: 290 }}
          />
        </Form.Item>
        <Collapse
          ghost
          items={[
            {
              key: "1",
              label: "高级参数",
              children: (
                <div>
                  <Form.Item label="DEM路径" name="elveDem">
                    <Select
                      showSearch
                      placeholder="选择路径"
                      options={options}
                      style={{ width: 290 }}
                    />
                  </Form.Item>
                  <Form.Item label="大地水准面文件" name="elevGeoid">
                    <Upload {...uploadProps}>
                      <Button icon={<UploadOutlined />}>选择文件</Button>
                    </Upload>
                  </Form.Item>
                  <Form.Item
                    label="默认高程"
                    name="elevDefault"
                    initialValue={0}
                  >
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item label="模式" name="mode" initialValue="default">
                    <Select
                      showSearch
                      placeholder="选择模式"
                      options={[
                        { label: "default", value: "default" },
                        { label: "phr", value: "phr" },
                      ]}
                      style={{ width: 290 }}
                    />
                  </Form.Item>
                  <Form.Item label="算法" name="method" initialValue="rcs">
                    <Select
                      showSearch
                      placeholder="选择算法"
                      onChange={(value: string) => setOperator(value)}
                      options={[
                        { label: "rcs", value: "rcs" },
                        { label: "lmvm", value: "lmvm" },
                        { label: "bayes", value: "bayes" },
                      ]}
                      style={{ width: 290 }}
                    />
                  </Form.Item>

                  {opeator === "rcs" ? (
                    <>
                      <Form.Item
                        label="X radius"
                        name="methodRcsRadiusx"
                        initialValue={9}
                      >
                        <InputNumber
                          placeholder="请输入"
                          style={{ width: 290 }}
                        />
                      </Form.Item>
                      <Form.Item
                        label="Y radius"
                        name="methodRcsRadiusy"
                        initialValue={9}
                      >
                        <InputNumber
                          placeholder="请输入"
                          style={{ width: 290 }}
                        />
                      </Form.Item>
                    </>
                  ) : null}
                  {opeator === "lmvm" ? (
                    <>
                      <Form.Item
                        label="X radius"
                        name="methodLmvmRadiusx"
                        initialValue={3}
                      >
                        <InputNumber
                          placeholder="请输入"
                          style={{ width: 290 }}
                        />
                      </Form.Item>
                      <Form.Item
                        label="Y radius"
                        name="methodLmvmRadiusy"
                        initialValue={3}
                      >
                        <InputNumber
                          placeholder="请输入"
                          style={{ width: 290 }}
                        />
                      </Form.Item>
                    </>
                  ) : null}
                  {opeator === "bayes" ? (
                    <>
                      <Form.Item
                        label="Weight"
                        name="methodBayesLambda"
                        initialValue={0.9999}
                      >
                        <InputNumber
                          placeholder="请输入"
                          style={{ width: 290 }}
                        />
                      </Form.Item>
                      <Form.Item
                        label="S coefficient"
                        name="methodBayesS"
                        initialValue={1}
                      >
                        <InputNumber
                          placeholder="请输入"
                          style={{ width: 290 }}
                        />
                      </Form.Item>
                    </>
                  ) : null}

                  <Form.Item label="变形场间距" name="lms" initialValue={4}>
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item
                    label="插值"
                    name="interpolator"
                    initialValue="bco"
                  >
                    <Select
                      showSearch
                      placeholder="选择插值"
                      options={[
                        { label: "bco", value: "bco" },
                        { label: "nn", value: "nn" },
                        { label: "linear", value: "linear" },
                      ]}
                      onChange={(value: string) => setInterpolator(value)}
                      style={{ width: 290 }}
                    />
                  </Form.Item>
                  {interpolator === "bco" ? (
                    <Form.Item
                      label="双三次插值半径"
                      name="interpolatorBcoRadius"
                      initialValue={2}
                    >
                      <InputNumber
                        placeholder="请输入"
                        style={{ width: 290 }}
                      />
                    </Form.Item>
                  ) : null}
                  <Form.Item label="填充值" name="fv" initialValue={0}>
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

export default YXTY;
