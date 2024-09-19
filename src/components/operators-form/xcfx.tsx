import {
    Button,
    Checkbox,
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
import { deleteNullValue, toInitialUpperCase } from "@/utils/common";
import { eventEmitter } from "@/utils/events";
import { getPath } from "@/request/operators";

interface XCFXProps {
    onFinish: (values: Record<string, any>) => void;
    setOpen: (open: boolean) => void;
}

interface FormProp {}

const XCFX: React.FC<XCFXProps> = ({ onFinish, setOpen }) => {
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
        eventEmitter.emit("compute:pause", "消除分析");
    }, []);

    const onSuccess = useCallback(() => {
        setLoading(false);
        setProgress(100);
        setStatus("success");
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
        const input = (
            await getPath({
                paths: values.input,
            })
        )?.res?.toString();
        const params = {
            identifier: "Sieve",
            mode: "sync",
            inputs: {
                input,
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
                initialValues={{ eightConnectedness: false, noMask: false }}
                onFinish={handleFinish}
                form={form}
                autoComplete="off"
            >
                <Form.Item
                    label="选择影像"
                    name="input"
                    rules={[{ required: true, message: "请选择输入影像" }]}
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
                                        label="阈值"
                                        name="threshold"
                                        initialValue={10}
                                        rules={[{ required: true }]}
                                    >
                                        <InputNumber
                                            placeholder="请输入"
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label="使用8向车浦-1se8-corectedness"
                                        name="eightConnectedness"
                                        valuePropName="checked"
                                    >
                                        <Checkbox />
                                    </Form.Item>
                                    <Form.Item
                                        label="对输入波段不要使用默认的有效性掩码"
                                        name="noMask"
                                        valuePropName="checked"
                                    >
                                        <Checkbox />
                                    </Form.Item>

                                    <Form.Item
                                        label="有效性掩膜"
                                        name="maskLayer"
                                    >
                                        <Select
                                            allowClear
                                            showSearch
                                            placeholder="请选择"
                                            options={options}
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>
                                    <Form.Item label="额外参数" name="extra">
                                        <Input style={{ width: 290 }} />
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

export default XCFX;
