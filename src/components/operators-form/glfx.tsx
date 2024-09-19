import {
    Button,
    Collapse,
    Form,
    Input,
    InputNumber,
    Progress,
    Select,
} from "antd";
import styles from "@/components/box-center/utilsBox.module.scss";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hook";
import { deleteNullValue } from "@/utils/common";
import { eventEmitter } from "@/utils/events";
import { getPath } from "@/request/operators";

interface GLFXProps {
    onFinish: (values: Record<string, any>) => void;
    setOpen: (open: boolean) => void;
}

interface FormProp {}

const GLFX: React.FC<GLFXProps> = ({ onFinish, setOpen }) => {
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
        const INPUT = (
            await getPath({
                paths: values.INPUT,
            })
        )?.res.toString();
        const params = {
            ...values,
            INPUT,
        };
        onFinish?.({
            identifier: "SampleFilter",
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
                initialValues={{ remember: true }}
                onFinish={handleFinish}
                form={form}
                autoComplete="off"
            >
                <Form.Item
                    label="栅格"
                    name="INPUT"
                    rules={[{ required: true, message: "请选择栅格" }]}
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
                            key: "1",
                            label: "高级参数",
                            children: (
                                <>
                                    <Form.Item
                                        label="滤波器"
                                        name="method"
                                        initialValue={0}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="请选择"
                                            options={[
                                                { label: "Smooth", value: 0 },
                                                { label: "Sharpen", value: 1 },
                                                { label: "Edge", value: 2 },
                                            ]}
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="核类型"
                                        name="kernelType"
                                        initialValue={1}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="请选择"
                                            options={[
                                                { label: "Smooth", value: 1 },
                                                { label: "Square", value: 2 },
                                            ]}
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="半径"
                                        name="kernelRadius"
                                        initialValue={2}
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

export default GLFX;
