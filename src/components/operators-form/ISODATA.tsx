import {
    Button,
    Checkbox,
    Form,
    InputNumber,
    Progress,
    Select,
    Collapse,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hook";
import { eventEmitter } from "@/utils/events";
import { getPath } from "@/request/operators";
import styles from "@/components/box-center/utilsBox.module.scss";

interface ISODATAProps {
    onFinish: (values: Record<string, any>) => void;
    setOpen: (open: boolean) => void;
}

interface FormProp {}

const ISODATA: React.FC<ISODATAProps> = ({ onFinish, setOpen }) => {
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

    const handleCancel = useCallback(() => {
        setOpen(false);
        eventEmitter.emit("compute:pause", "ISODATA分类");
    }, []);

    const handleFinish = async (values: Record<string, any>) => {
        setLoading(true);
        setStatus("active");
        const FEATURES = (
            await getPath({
                paths: values.FEATURES,
                // "oge-edu/Teacher/teacher_xin_754/DataResource/Landsat_wh_iso_fd43fd3f-619e-47ab-98a0-accdb37a6b57/Landsat_wh_iso.tif",
            })
        )?.res.toString();
        const params = {
            ...values,
            FEATURES,
        };
        onFinish?.({
            identifier: "ISODATAClustering",
            mode: "sync",
            inputs: {
                ...params,
            },
        });
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
                initialValues={{ normalize: false }}
                onFinish={handleFinish}
                form={form}
                autoComplete="off"
            >
                <Form.Item
                    label="选择影像"
                    name="FEATURES"
                    rules={[{ required: true, message: "请选择输入影像" }]}
                >
                    <Select
                        allowClear
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
                                    <Form.Item
                                        label="归一化"
                                        name="normalize"
                                        valuePropName="checked"
                                    >
                                        <Checkbox />
                                    </Form.Item>
                                    <Form.Item
                                        label="最大迭次数"
                                        name="iterations"
                                        initialValue={20}
                                    >
                                        <InputNumber
                                            placeholder="请输入"
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="初始聚类数量"
                                        name="clusterINI"
                                        initialValue={5}
                                    >
                                        <InputNumber
                                            placeholder="请输入"
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="最大聚类数量"
                                        name="clusterMAX"
                                        initialValue={16}
                                    >
                                        <InputNumber
                                            placeholder="请输入"
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="聚类中最少样本数量"
                                        name="samplesMIN"
                                        initialValue={5}
                                    >
                                        <InputNumber
                                            placeholder="请输入"
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="计算方法"
                                        name="initialize"
                                        initialValue={0}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="请选择"
                                            options={[
                                                {
                                                    label: "ranndom",
                                                    value: "0",
                                                },
                                                {
                                                    label: "periodical",
                                                    value: "1",
                                                },
                                                {
                                                    label: "keep values",
                                                    value: "2",
                                                },
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

export default ISODATA;
