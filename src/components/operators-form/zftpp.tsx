import { Button, Form, InputNumber, Progress, Select, Collapse } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hook";
import { eventEmitter } from "@/utils/events";
import { getPath } from "@/request/operators";
import styles from "@/components/box-center/utilsBox.module.scss";

interface ZFTPPProps {
    onFinish: (values: Record<string, any>) => void;
    setOpen: (open: boolean) => void;
}

interface FormProp {}

const ZFTPP: React.FC<ZFTPPProps> = ({ onFinish, setOpen }) => {
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

    const handleCancel = useCallback(() => {
        setOpen(false);
        eventEmitter.emit("compute:pause", "直文图匹配");
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

        const GRID = (
            await getPath({
                paths: values.GRID,
                // paths:
                //   "oge-edu/Teacher/1844985716_767/DataResource/landsat_b4_zftpp_0453cbce-1f65-4fdd-926a-b742db4ea2f3/landsat_b4_zftpp.tif",
            })
        )?.res?.toString();

        const REFERENCE = (
            await getPath({
                paths: values.REFERENCE,
                // paths:
                //   "oge-edu/Teacher/1844985716_767/DataResource/landsat_b3_zftpp_a1a31f4e-d3ff-49db-acd9-756d0daca25a/landsat_b3_zftpp.tif",
            })
        )?.res?.toString();

        const params = {
            identifier: "HistogramMatching",
            mode: "sync",
            inputs: {
                GRID,
                REFERENCE,
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
                    name="GRID"
                    rules={[{ required: true, message: "请选择输入影像" }]}
                >
                    <Select
                        showSearch
                        placeholder="请选择"
                        options={options}
                        style={{ width: 290 }}
                    />
                </Form.Item>
                <Form.Item
                    label="参考影像"
                    name="REFERENCE"
                    rules={[{ required: true, message: "请选择参考影像" }]}
                >
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
                                    <Form.Item
                                        label="计算方法"
                                        name="METHOD"
                                        initialValue={0}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="请选择"
                                            options={[
                                                { label: "直方图", value: 0 },
                                                { label: "标准差", value: 1 },
                                            ]}
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="直方图分组"
                                        name="nclasses"
                                        initialValue={100}
                                    >
                                        <InputNumber
                                            placeholder="请输入"
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="最大样本量"
                                        name="maxSamples"
                                        initialValue={1000000}
                                    >
                                        <InputNumber
                                            placeholder="请输入"
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

export default ZFTPP;
