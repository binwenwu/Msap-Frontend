import { Button, Form, Select, InputNumber, message, Progress } from "antd";
import { useAppSelector } from "@/store/hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { eventEmitter } from "@/utils/events";
import styles from "@/components/box-center/utilsBox.module.scss";
import { getPath } from "@/request/operators";
interface YXXQProps {
    onFinish: (values: Record<string, any>) => void;
    setOpen: (open: boolean) => void;
}
// 影像融合、影像镶嵌
const YXXQ: React.FC<YXXQProps> = ({ onFinish, setOpen }) => {
    const layers = useAppSelector((state) => state.box.resourceLayers);
    const [status, setStatus] = useState<ProgressStatuses[number]>("active");
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm<{ imagary: string }>();

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
        eventEmitter.emit("compute:pause", "影像裁剪");
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
        const getPaths = values.inputListPath.map((path: string) => {
            return getPath({
                paths: path,
            });
        });
        let paths = await Promise.all(getPaths);
        paths = paths.map((path) => path?.res?.toString());
        const params = {
            identifier: "MosaicEdu",
            mode: "sync",
            inputs: {
                inputListPath: paths,
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
                initialValues={{ remember: true }}
                onFinish={handleFinish}
                autoComplete="off"
                form={form}
            >
                <Form.Item
                    label="选择影像"
                    name="inputListPath"
                    rules={[{ required: true, message: "请选择一个影像" }]}
                >
                    <Select
                        allowClear
                        mode="tags"
                        showSearch
                        placeholder="选择影像"
                        style={{ width: 290 }}
                        options={options}
                    />
                </Form.Item>
                {/* <Form.Item
          label="经度"
          name="lng"
          rules={[{ required: true, message: "请输入经度" }]}
        >
          <InputNumber style={{ width: 290 }} placeholder="请输入" />
        </Form.Item>
        <Form.Item
          label="纬度"
          name="lat"
          rules={[{ required: true, message: "请输入纬度" }]}
        >
          <InputNumber style={{ width: 290 }} placeholder="请输入" />
        </Form.Item> */}
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

export default YXXQ;
