import { Button, Form, InputNumber, Progress, Select } from "antd";
import styles from "@/components/box-center/utilsBox.module.scss";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hook";
import { eventEmitter } from "@/utils/events";
import { getPath } from "@/request/operators";
interface KJLBProps {
    onFinish: (values: Record<string, any>) => void;
    setOpen: (open: boolean) => void;
}

interface FormProp {}

const KJLB: React.FC<KJLBProps> = ({ onFinish, setOpen }) => {
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

    interface ConversionPathQuery {
        paths: string;
    }
    const handleFinish = async (values: Record<string, any>) => {
        setLoading(true);
        setStatus("active");
        const query: ConversionPathQuery = {
            paths: values.FILE_PATH,
        };
        const FILE_PATH = (await getPath(query))?.res.toString();
        setLoading(true);
        const params = {
            ...values,
            FILE_PATH,
        };
        onFinish?.({
            identifier: "SpatialFilter",
            mode: "sync",
            inputs: {
                ...params,
            },
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
        eventEmitter.emit("compute:pause", "空间滤波");
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
                <Form.Item
                    label="滤波方法"
                    name="FILTER_TYPE"
                    rules={[{ required: true }]}
                >
                    <Select
                        options={[
                            { label: "最大值", value: "max" },
                            { label: "最小值", value: "min" },
                            { label: "均值", value: "mean" },
                            { label: "中值", value: "median" },
                            { label: "高斯", value: "gaussian" },
                            { label: "拉普拉斯", value: "laplacian" },
                            { label: "高通", value: "highpass" },
                            { label: "sobel", value: "sobel" },
                        ]}
                        style={{ width: 290 }}
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

export default KJLB;
