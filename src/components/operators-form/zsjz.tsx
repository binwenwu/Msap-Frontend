import {
  Button,
  Checkbox,
  Collapse,
  Form,
  InputNumber,
  Progress,
  Select,
  Upload,
  type UploadProps,
} from "antd";
import styles from "@/components/box-center/utilsBox.module.scss";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hook";
import { UploadOutlined } from "@ant-design/icons";
import { deleteNullValue, toInitialUpperCase } from "@/utils/common";
import { eventEmitter } from "@/utils/events";
import { BASE_PATH } from "@/utils/globalVariable";
import { getPath } from "@/request/operators";

interface ZSJZProps {
  onFinish: (values: Record<string, any>) => void;
  setOpen: (open: boolean) => void;
}

interface FormProp {}

const ZSJZ: React.FC<ZSJZProps> = ({ onFinish, setOpen }) => {
  const layers = useAppSelector((state) => state.box.resourceLayers);
  const userInfo = useAppSelector((state) => state.user.userInfo);
  const [status, setStatus] = useState<ProgressStatuses[number]>("active");
  const [epsgList, setEpsgList] = useState<number[]>([]);
  const [interpolate, setInterpolate] = useState("bco");
  const [projector, setProjector] = useState("utm");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormProp>();

  const options = useMemo(() => {
    return layers.map((layer) => ({
      label: layer.name,
      value: layer.filePath,
    }));
  }, [layers]);

  const uploadProps: UploadProps = {
    name: "file",
    accept: ".xml",
    headers: {
      token: userInfo.token!,
    },
    beforeUpload(file) {
      return false;
    },
    async onChange({ file }) {
      form.setFieldValue("args18", file);
    },
    maxCount: 1,
  };

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

  const onExecuteFailed = useCallback(() => {
    setLoading(false);
    setProgress(100);
    setStatus("exception");
  }, []);

  const handleCancel = useCallback(() => {
    setOpen(false);
    eventEmitter.emit("compute:pause", "正射校正");
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

  const onSuccess = useCallback(() => {
    setLoading(false);
    setProgress(100);
    setStatus("success");
  }, []);

  const handleFinish = async (values: Record<string, any>) => {
    setLoading(true);
    setStatus("active");
    const IO_IN = (
      await getPath({
        paths: values.IO_IN,
      })
    )?.res?.toString();
    const params = {
      identifier: "OrthoRectification",
      mode: "sync",
      inputs: {
        IO_IN,
      },
    };
    onFinish?.(params);
  };

  const handleTyChange = useCallback((value: any) => {
    setProjector(value);
  }, []);

  const handleCzChange = useCallback((value: any) => {
    setInterpolate(value);
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
        initialValues={{ args3: false, args15: true }}
        onFinish={handleFinish}
        form={form}
        autoComplete="off"
      >
        <Form.Item label="选择影像" name="IO_IN" rules={[{ required: true }]}>
          <Select
            showSearch
            placeholder="请选择"
            options={options}
            style={{ width: 290 }}
          />
        </Form.Item>

        <Collapse
          ghost
          items={[
            {
              label: "高级参数",
              children: (
                <>
                  <Form.Item label="地图投影" name="args1" initialValue="utm">
                    <Select
                      showSearch
                      placeholder="请选择"
                      options={[
                        { label: "utm", value: "utm" },
                        { label: "lambert2", value: "lambert2" },
                        { label: "lambert93", value: "lambert93" },
                        { label: "wgs", value: "wgs" },
                        { label: "epsg", value: "epsg" },
                      ]}
                      onChange={handleTyChange}
                      style={{ width: 290 }}
                    />
                  </Form.Item>
                  {projector === "utm" ? (
                    <>
                      <Form.Item label="分区号" name="args2" initialValue={31}>
                        <InputNumber
                          placeholder="请输入"
                          style={{ width: 290 }}
                        />
                      </Form.Item>
                      <Form.Item
                        label="北半球"
                        name="args3"
                        valuePropName="checked"
                      >
                        <Checkbox />
                      </Form.Item>
                    </>
                  ) : null}
                  {projector === "epsg" ? (
                    <Form.Item
                      label="EPSG编码"
                      name="args4"
                      initialValue={4326}
                    >
                      <Select
                        showSearch
                        placeholder="请选择"
                        options={[
                          ...epsgList.map((item) => ({
                            label: "EPSG:" + item,
                            value: item,
                          })),
                        ]}
                        style={{ width: 290 }}
                      />
                    </Form.Item>
                  ) : null}
                  <Form.Item
                    label="参数估计模式"
                    name="args5"
                    initialValue="auto"
                  >
                    <Select
                      showSearch
                      placeholder="请选择"
                      options={[
                        { label: "auto", value: "auto" },
                        { label: "autosize", value: "autosize" },
                        { label: "autospacing", value: "autospacing" },
                        { label: "outputroi", value: "outputroi" },
                        { label: "orthofit", value: "orthofit" },
                      ]}
                      style={{ width: 290 }}
                    />
                  </Form.Item>

                  <Form.Item label="左上角X坐标" name="args6" initialValue={0}>
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item label="左上角Y坐标" name="args7" initialValue={0}>
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item label="宽度" name="args8" initialValue={0}>
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item label="高度" name="args9" initialValue={0}>
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item label="像素大小X" name="args10" initialValue={0}>
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item label="像素大小Y" name="args11" initialValue={0}>
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item label="右下角X坐标" name="args12" initialValue={0}>
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item label="右下角Y坐标" name="args13" initialValue={0}>
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item label="模型正射影像" name="args14">
                    <Select
                      showSearch
                      placeholder="请选择"
                      options={options}
                      style={{ width: 290 }}
                    />
                  </Form.Item>
                  <Form.Item
                    label="默认强制等距间距"
                    name="args15"
                    valuePropName="checked"
                  >
                    <Checkbox checked />
                  </Form.Item>

                  <Form.Item label="默认像素值" name="args16" initialValue={0}>
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item label="DEM路径" name="args17">
                    <Select
                      showSearch
                      placeholder="请选择"
                      options={options}
                      style={{ width: 290 }}
                    />
                  </Form.Item>
                  <Form.Item label="大地水准面文件" name="args18">
                    <Upload {...uploadProps}>
                      <Button icon={<UploadOutlined />}>选择文件</Button>
                    </Upload>
                  </Form.Item>
                  <Form.Item label="默认高程" name="args19" initialValue={0}>
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item label="插值" name="args20" initialValue="bro">
                    <Select
                      showSearch
                      placeholder="请选择"
                      onChange={handleCzChange}
                      options={[
                        { label: "bco", value: "bco" },
                        { label: "nn", value: "nn" },
                        { label: "linear", value: "linear" },
                      ]}
                      style={{ width: 290 }}
                    />
                  </Form.Item>
                  {interpolate === "bco" ? (
                    <Form.Item
                      label="双三次插值半径"
                      name="args21"
                      initialValue={2}
                    >
                      <InputNumber
                        placeholder="请输入"
                        style={{ width: 290 }}
                      />
                    </Form.Item>
                  ) : null}
                  <Form.Item
                    label="RPC建模(每轴点数)"
                    name="args22"
                    initialValue={10}
                  >
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                  <Form.Item
                    label="重采样网格间距"
                    name="args23"
                    initialValue={256}
                  >
                    <InputNumber placeholder="请输入" style={{ width: 290 }} />
                  </Form.Item>
                </>
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

export default ZSJZ;
