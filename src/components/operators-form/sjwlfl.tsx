import {
    Button,
    Checkbox,
    Collapse,
    Form,
    Input,
    InputNumber,
    Progress,
    Select,
    Upload,
    message,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hook";
import { UploadOutlined } from "@ant-design/icons";
import { eventEmitter } from "@/utils/events";
import { getPath, uploadGeojson } from "@/request/operators";
import styles from "@/components/box-center/utilsBox.module.scss";

interface SJWLFLProps {
    onFinish: (values: Record<string, any>) => void;
    setOpen: (open: boolean) => void;
}

interface FormProp {}
const SJWLFL: React.FC<SJWLFLProps> = ({ onFinish, setOpen }) => {
    const layers = useAppSelector((state) => state.box.resourceLayers);
    const drawLayers = useAppSelector((slice) => slice.box.drawLayers);
    const [status, setStatus] = useState<ProgressStatuses[number]>("active");
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [sampleLoading, setSampleLoading] = useState(false);
    const [areaLoading, setAreaLoading] = useState(false);
    const [samplePath, setSamplePath] = useState("");
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

    const onSampleChange = async (value: Record<string, any>) => {
        setSampleLoading(true);
        const filePath = (await uploadGeojson(value.label, value.value))?.data
            ?.path;
        // form.setFieldValue("TRAIN_SAMPLES", filePath);
        setSamplePath(filePath);
        setSampleLoading(false);
    };

    const onAreaChange = async (value: Record<string, any>) => {
        setAreaLoading(true);
        const filePath = (await uploadGeojson(value.label, value.value))?.data
            ?.path;
        // form.setFieldValue("TRAIN_AREAS", filePath);
        setAreaPath(filePath);
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

    const handleCancel = useCallback(() => {
        setOpen(false);
        eventEmitter.emit("compute:pause", "神经网络分类");
    }, []);

    const handleFinish = async (values: Record<string, any>) => {
        if (!samplePath) {
            message.warning("请先选择训练样本！");
            return;
        }
        if (!areaPath) {
            message.warning("请先选择训练区域！");
            return;
        }
        setLoading(true);
        setStatus("active");
        const FEATURES = (
            await getPath({
                paths: values.FEATURES,
            })
        )?.res?.toString();
        const TRAIN_SAMPLES = (
            await getPath({
                paths: samplePath,
            })
        )?.res?.toString();
        const TRAIN_AREAS = (
            await getPath({
                paths: areaPath,
            })
        )?.res?.toString();
        // todo sample范围要经影像大 area范围无限制
        const params: Record<string, any> = {
            identifier: "ANN",
            mode: "sync",
            inputs: {
                FEATURES,
                // FEATURES: "/mnt/oge/oge_mount/ogebos/algorithmData/Landsat_wh_s.tif",
                NORMALIZE: false,
                MODEL_TRAIN: values.MODEL_TRAIN,
                // TRAIN_SAMPLES:
                //   "/mnt/oge/oge_mount/oge-edu/Student/edu_student_01_317/17371533778_768/sample/08-29-2024-16-28-50_files_list/sample.shp",
                // TRAIN_AREAS:
                //   "/mnt/oge/oge_mount/oge-edu/Teacher/1844985716_767/DataResource/sample_svm5_eed63ef3-09eb-4345-9cd2-af953f3559b1/sample_svm5.shp",
                // TRAIN_CLASS: "name",
                TRAIN_SAMPLES,
                TRAIN_AREAS,
                TRAIN_CLASS: values.TRAIN_CLASS,
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
                onFinish={handleFinish}
                form={form}
                autoComplete="off"
            >
                <Form.Item
                    label="输入影像"
                    name="FEATURES"
                    rules={[{ required: true }]}
                >
                    <Select
                        showSearch
                        placeholder="请选择"
                        options={options}
                        style={{ width: 290 }}
                    />
                </Form.Item>
                <Form.Item
                    label="训练"
                    name="MODEL_TRAIN"
                    initialValue={0}
                    rules={[{ required: true }]}
                >
                    <Select
                        style={{ width: 290 }}
                        options={[
                            { label: "training areas", value: 0 },
                            { label: "training samples", value: 1 },
                            { label: "load from file", value: 2 },
                        ]}
                    />
                </Form.Item>
                <Form.Item
                    label="训练区域"
                    name="TRAIN_AREAS"
                    rules={[{ required: true }]}
                >
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
                    name="TRAIN_CLASS"
                    rules={[{ required: true }]}
                >
                    <Input style={{ width: 290 }} />
                </Form.Item>
                <Form.Item
                    label="训练样本"
                    name="TRAIN_SAMPLES"
                    rules={[{ required: true }]}
                >
                    <Select
                        allowClear
                        loading={sampleLoading}
                        labelInValue
                        showSearch
                        placeholder="请选择"
                        options={options2}
                        style={{ width: 290 }}
                        onChange={onSampleChange}
                    />
                </Form.Item>

                <Collapse
                    ghost
                    items={[
                        {
                            label: "高级参数",
                            children: (
                                <>
                                    <Form.Item
                                        label="归一化"
                                        name="NORMALISE"
                                        valuePropName="checked"
                                    >
                                        <Checkbox />
                                    </Form.Item>
                                    <Form.Item
                                        label="从文件加载统计数据"
                                        name="file_load"
                                        initialValue="False"
                                        rules={[
                                            {
                                                required: true,
                                                message: "请选择文件",
                                            },
                                        ]}
                                    >
                                        <Upload accept=".txt">
                                            <Button icon={<UploadOutlined />}>
                                                选择文件
                                            </Button>
                                        </Upload>
                                    </Form.Item>
                                    <Form.Item
                                        label="训练"
                                        name="TRAIN_WITH"
                                        initialValue={0}
                                    >
                                        <Select
                                            style={{ width: 290 }}
                                            options={[
                                                {
                                                    label: "training areas",
                                                    value: 0,
                                                },
                                                {
                                                    label: "training samples",
                                                    value: 1,
                                                },
                                                {
                                                    label: "load from file",
                                                    value: 2,
                                                },
                                            ]}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label="缓冲区大小"
                                        name="train_buffer"
                                        initialValue={1}
                                    >
                                        <InputNumber
                                            placeholder="请输入"
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="距离阈值"
                                        name="threshold_dist"
                                        initialValue={0}
                                    >
                                        <InputNumber
                                            placeholder="请输入"
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="光谱角阈值"
                                        name="threshold_angle"
                                        initialValue={0}
                                    >
                                        <InputNumber
                                            placeholder="请输入"
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="概率阈值"
                                        name="threshold_prob"
                                        initialValue={0}
                                    >
                                        <InputNumber
                                            placeholder="请输入"
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="概率参考"
                                        name="relative_prob"
                                        initialValue={1}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="请选择"
                                            options={[
                                                { label: "绝对", value: 0 },
                                                { label: "相对", value: 1 },
                                            ]}
                                            style={{ width: 290 }}
                                        />
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

export default SJWLFL;
