import {
    Button,
    Collapse,
    Form,
    Input,
    InputNumber,
    Progress,
    Select,
    Upload,
    type UploadProps,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hook";
import { UploadOutlined } from "@ant-design/icons";
import { UploadFile } from "antd/lib";
import { eventEmitter } from "@/utils/events";
import styles from "@/components/box-center/utilsBox.module.scss";
import { getPath } from "@/request/operators";
import { BASE_PATH } from "@/utils/globalVariable";

interface FSDBProps {
    onFinish: (values: Record<string, any>) => void;
    setOpen: (open: boolean) => void;
}

interface FormProp {}

const FSDB: React.FC<FSDBProps> = ({ onFinish, setOpen }) => {
    const layers = useAppSelector((state) => state.box.resourceLayers);
    const tokenHead = localStorage.getItem("education-tokenHead");
    const token = localStorage.getItem("education-token");
    const uid = localStorage.getItem("education-uid");
    const [status, setStatus] = useState<ProgressStatuses[number]>("active");
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm<FormProp>();

    const options = useMemo(() => {
        return layers.map((layer) => ({
            label: layer.name,
            value: layer.filePath,
        }));
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
        eventEmitter.emit("compute:pause", "大气校正");
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

    const onAcquiGainbias = useCallback(({ file }: { file: UploadFile }) => {
        if (file.status === "done") {
            form.setFieldValue("ACQUI_GAINBIAS", file.response);
        }
    }, []);

    const onAcquiSolarilluminations = useCallback(
        ({ file }: { file: UploadFile }) => {
            if (file.status === "done") {
                form.setFieldValue("ACQUI_SOLARILLUMINATIONS", file.response);
            }
        },
        []
    );

    const onAtmoAeronet = useCallback(({ file }: { file: UploadFile }) => {
        form.setFieldValue("atmoAeronet", `myData/${file.name}`);
    }, []);

    const onAtmoRsr = useCallback(({ file }: { file: UploadFile }) => {
        form.setFieldValue("atmoRsr", `myData/${file.name}`);
    }, []);

    const uploadProps: UploadProps = {
        action: `${BASE_PATH}/api/datasource/api/dataupload/uploadteacher`,
        name: "file",
        accept: ".txt",
        headers: {
            Authorization: `${tokenHead}${token}`,
        },
        data: (file) => {
            return {
                uid: uid,
                coursename: "operator_temp",
            };
        },
        maxCount: 1,
    };

    const handleFinish = async (values: Record<string, any>) => {
        setLoading(true);
        setStatus("active");
        const IN = (
            await getPath({
                paths: values.IN,
            })
        )?.res?.toString();
        const ACQUI_GAINBIAS = (
            await getPath({
                paths: values.ACQUI_GAINBIAS,
            })
        )?.res?.toString();
        const ACQUI_SOLARILLUMINATIONS = (
            await getPath({
                paths: values.ACQUI_SOLARILLUMINATIONS,
            })
        )?.res?.toString();
        const params = {
            identifier: "OpticalCalibration",
            mode: "sync",
            inputs: {
                IN,
                ACQUI_GAINBIAS,
                ACQUI_SOLARILLUMINATIONS,
                LEVEL: values.LEVEL,
            },
        };
        onFinish?.(params);
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
                initialValues={{ milli: false }}
                onFinish={handleFinish}
                form={form}
                autoComplete="off"
            >
                <Form.Item
                    label="选择影像"
                    name="IN"
                    rules={[{ required: true }]}
                >
                    <Select
                        showSearch
                        placeholder="选择影像"
                        options={options}
                        style={{ width: 290 }}
                    />
                </Form.Item>
                {/* <Form.Item
          label="校准级别"
          name="LEVEL"
          initialValue="toa"
          rules={[{ required: true, message: "请选择校准级别" }]}
        >
          <Select
            showSearch
            placeholder="请选择"
            options={[
              { label: "toa", value: "toa" },
              { label: "toatoim", value: "toatoim" },
              { label: "toc", value: "toc" },
            ]}
            style={{ width: 290 }}
          />
        </Form.Item> */}
                <Form.Item
                    label="增益和偏差"
                    name="ACQUI_GAINBIAS"
                    rules={[{ required: true }]}
                >
                    <Upload {...uploadProps} onChange={onAcquiGainbias}>
                        <Button icon={<UploadOutlined />}>选择文件</Button>
                    </Upload>
                </Form.Item>
                <Form.Item
                    label="太阳辐照"
                    name="ACQUI_SOLARILLUMINATIONS"
                    rules={[{ required: true }]}
                >
                    <Upload
                        {...uploadProps}
                        onChange={onAcquiSolarilluminations}
                    >
                        <Button icon={<UploadOutlined />}>选择文件</Button>
                    </Upload>
                </Form.Item>
                <Collapse
                    ghost
                    items={[
                        {
                            label: "高级参数",
                            children: (
                                <div>
                                    <Form.Item
                                        label="气溶胶模型"
                                        initialValue="continental"
                                        name="atmoAerosol"
                                    >
                                        <Select
                                            showSearch
                                            placeholder="请选择"
                                            options={[
                                                {
                                                    label: "noaersol",
                                                    value: "noaersol",
                                                },
                                                {
                                                    label: "continental",
                                                    value: "continental",
                                                },
                                                {
                                                    label: "martitime",
                                                    value: "martitime",
                                                },
                                                {
                                                    label: "urban",
                                                    value: "urban",
                                                },
                                                {
                                                    label: "desertic",
                                                    value: "desertic",
                                                },
                                            ]}
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="臭氧量(cm-atm)"
                                        name="atmoOz"
                                        initialValue={0}
                                    >
                                        <InputNumber
                                            placeholder="请输入"
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="水汽量(g/cm²)"
                                        name="atmoWa"
                                        initialValue={2.5}
                                    >
                                        <InputNumber
                                            placeholder="请输入"
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="大气压(hPa)"
                                        name="atmoPressure"
                                        initialValue={1030}
                                    >
                                        <InputNumber
                                            placeholder="请输入"
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="气溶胶光学厚度"
                                        name="atmoOpt"
                                        initialValue={0.2}
                                    >
                                        <InputNumber
                                            placeholder="请输入"
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label="Aeronet 文件"
                                        name="atmoAeronet"
                                    >
                                        <Upload
                                            {...uploadProps}
                                            onChange={onAtmoAeronet}
                                        >
                                            <Button icon={<UploadOutlined />}>
                                                选择文件
                                            </Button>
                                        </Upload>
                                    </Form.Item>

                                    <Form.Item
                                        label="相对光谱响应文件"
                                        name="atmoRsr"
                                    >
                                        <Upload
                                            {...uploadProps}
                                            onChange={onAtmoRsr}
                                        >
                                            <Button icon={<UploadOutlined />}>
                                                选择文件
                                            </Button>
                                        </Upload>
                                    </Form.Item>
                                    <Form.Item
                                        label="窗口半径(邻近效应)"
                                        name="atmoRadius"
                                        initialValue={2}
                                    >
                                        <Input
                                            placeholder="请输入"
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="像素大小(公里)"
                                        name="atmoPixsize"
                                        initialValue={1}
                                    >
                                        <InputNumber
                                            placeholder="请输入"
                                            style={{ width: 290 }}
                                        />
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

export default FSDB;
