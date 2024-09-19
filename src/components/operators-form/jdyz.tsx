import { Button, Form, Progress, Select } from "antd";
import styles from "@/components/box-center/utilsBox.module.scss";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hook";
import { eventEmitter } from "@/utils/events";
import { ExecuteResponse, getPath, mntToMinio } from "@/request/operators";

interface JDYZProps {
    onFinish: (values: Record<string, any>) => void;
    setOpen: (open: boolean) => void;
}

interface FormProp {}

const JDYZ: React.FC<JDYZProps> = ({ onFinish, setOpen }) => {
    const layers = useAppSelector((state) => state.box.resourceLayers);
    const [status, setStatus] = useState<ProgressStatuses[number]>("active");
    const [imgPath, setImgPath] = useState("");
    const [txt1, setTxt1] = useState("");
    const [txt2, setTxt2] = useState("");
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm<FormProp>();

    const options = useMemo(() => {
        return layers.map((layer) => ({
            label: layer.name,
            value: layer.filePath,
        }));
    }, [layers]);

    const handleFinish = async (values: Record<string, any>) => {
        const uid = localStorage.getItem("education-uid")!;
        setLoading(true);
        setStatus("active");
        eventEmitter.on("operator:custom", (response: ExecuteResponse) => {
            const img = response.result?.[1]?.value;
            if (img) {
                const imgData = new FormData();
                imgData.append("filePaths", img);
                imgData.append("uid", uid);
                mntToMinio(imgData)
                    .then((resp) => {
                        setImgPath(Object.values(resp)?.[0]);
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            }
            setTxt1(response.result?.[2]?.value);
            setTxt2(response.result?.[3]?.value);
        });

        const TRUE_TIF = (
            await getPath({
                paths: values.TRUE_TIF,
            })
        )?.res?.toString();

        const PRED_TIF = (
            await getPath({
                paths: values.PRED_TIF,
            })
        )?.res?.toString();
        const params = {
            TRUE_TIF,
            PRED_TIF,
        };
        onFinish?.({
            identifier: "ConfusionMatrixEval",
            mode: "sync",
            inputs: {
                ...params,
            },
            name: "jdyz",
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

    const handleCancel = useCallback(() => {
        setOpen(false);
        eventEmitter.emit("compute:pause", "精度评价");
    }, []);

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
                    label="预测数据"
                    name="PRED_TIF"
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
                    label="真实数据"
                    name="TRUE_TIF"
                    rules={[{ required: true, message: "请选择" }]}
                >
                    <Select
                        showSearch
                        placeholder="请选择"
                        options={options}
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
            {imgPath ? (
                <p>
                    <a
                        target="_blank"
                        href={`http://openge.org.cn/gateway/resource/preview/path?resourcePath=${imgPath}`}
                    >
                        精度验证图片
                    </a>
                </p>
            ) : null}
            {txt1 ? <p>参数1: {txt1}</p> : null}
            {txt2 ? <p>参数2: {txt2}</p> : null}
        </>
    );
};

export default JDYZ;
