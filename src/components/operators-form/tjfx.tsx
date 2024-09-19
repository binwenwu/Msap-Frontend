import {
    Collapse,
    Button,
    Form,
    Input,
    Progress,
    Select,
    Checkbox,
    Modal,
    Table,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hook";
import { eventEmitter } from "@/utils/events";
import {
    ExecuteResponse,
    getPath,
    statisticsAnalysis,
    uploadGeojson,
} from "@/request/operators";
import styles from "@/components/box-center/utilsBox.module.scss";

const columns = [
    {
        title: "属性",
        dataIndex: "label",
        key: "label",
    },
    {
        title: "值",
        dataIndex: "value",
        key: "value",
    },
];
interface TJFXProps {
    onFinish: (values: Record<string, any>) => void;
    setOpen: (open: boolean) => void;
}
interface FormProp {}
const TJFX: React.FC<TJFXProps> = ({ onFinish, setOpen }) => {
    const layers = useAppSelector((state) => state.box.resourceLayers);
    const drawLayers = useAppSelector((slice) => slice.box.drawLayers);
    const [form] = Form.useForm<FormProp>();
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<ProgressStatuses[number]>("active");
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [areaLoading, setAreaLoading] = useState(false);
    const [areaPath, setAreaPath] = useState("");
    const [dataSource, setDataSource] = useState<Record<string, any>[]>([]);

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

    const onAreaChange = async (value: Record<string, any>) => {
        setAreaLoading(true);
        const filePath = (await uploadGeojson(value.label, value.value))?.data
            ?.path;
        setAreaPath(filePath);
        setAreaLoading(false);
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

    const onExecuteFailed = useCallback(() => {
        setLoading(false);
        setProgress(100);
        setStatus("exception");
    }, []);

    const handleCancel = useCallback(() => {
        setOpen(false);
        eventEmitter.emit("compute:pause", "统计分类");
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
        setDataSource([]);
        eventEmitter.on("operator:custom", (response: ExecuteResponse) => {
            const path = response.result?.[0]?.value;
            statisticsAnalysis({
                dbfFilePath: path,
            })
                .then((resp) => {
                    const datas: Record<string, any>[] = [];
                    if (resp.code === 200) {
                        Object.entries(resp.res).forEach(
                            ([key, value]: [string, any]) => {
                                datas.push({
                                    label: key,
                                    value: value,
                                });
                            }
                        );
                        setDataSource(datas);
                        setModalOpen(true);
                    } else {
                        setDataSource([]);
                    }
                })
                .catch((err) => {
                    console.error(err);
                    eventEmitter.emit("compute:failed");
                });
        });
        const GRIDS = (
            await getPath({
                paths: values.GRIDS,
            })
        )?.res.toString();
        const POLYGONS = (
            await getPath({
                paths: areaPath,
            })
        )?.res.toString();
        const params = {
            GRIDS,
            POLYGONS,
        };
        onFinish?.({
            identifier: "Statistics",
            mode: "sync",
            inputs: {
                ...params,
            },
            name: "tjfx",
        });
    };

    const onSuccess = useCallback(() => {
        setLoading(false);
        setProgress(100);
        setStatus("success");
    }, []);

    return (
        <>
            <Modal
                title="统计结果"
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
                width={600}
                maskClosable={false}
            >
                <Table
                    scroll={{ x: "100%", y: 600 }}
                    dataSource={dataSource}
                    columns={columns}
                    pagination={false}
                    size="small"
                />
            </Modal>
            <Progress
                status={status}
                style={{ position: "absolute", top: 50, left: 0 }}
                percent={progress}
                format={() => ""}
            />
            <Form
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                initialValues={{
                    useMultipleCores: false,
                    numberOfCells: true,
                    minimum: true,
                    maximum: true,
                    range1: true,
                    sum1: true,
                    mean: true,
                    variance: true,
                    standardDeviation: true,
                    gini: false,
                }}
                onFinish={handleFinish}
                form={form}
                autoComplete="off"
            >
                <Form.Item
                    label="选择影像"
                    name="GRIDS"
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
                    name="POLYGONS"
                    label="矢量范围"
                    rules={[{ required: true }]}
                >
                    <Select
                        loading={areaLoading}
                        labelInValue
                        showSearch
                        placeholder="请选择"
                        options={options2}
                        style={{ width: 290 }}
                        onChange={onAreaChange}
                    />
                </Form.Item>

                <Collapse
                    ghost
                    items={[
                        {
                            label: "高级参数",
                            children: (
                                <div>
                                    <Form.Item
                                        label="百分数"
                                        name="percentiles"
                                        initialValue="5"
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="字段命名"
                                        name="fieldNaming"
                                        initialValue={0}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="请选择"
                                            options={[
                                                {
                                                    label: "grid number",
                                                    value: 0,
                                                },
                                                {
                                                    label: "grid name",
                                                    value: 1,
                                                },
                                            ]}
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="方法"
                                        name="method"
                                        initialValue={1}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="请选择"
                                            options={[
                                                {
                                                    label: "simple and fast ",
                                                    value: 0,
                                                },
                                                {
                                                    label: "polygon wise(cell centerss)",
                                                    value: 1,
                                                },
                                                {
                                                    label: "polygon wise(cell area)",
                                                    value: 2,
                                                },
                                                {
                                                    label: "polygon wise(cell area weighted)",
                                                    value: 3,
                                                },
                                            ]}
                                            style={{ width: 290 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="使用多核"
                                        name="useMultipleCores"
                                        valuePropName="checked"
                                        initialValue={false}
                                    >
                                        <Checkbox />
                                    </Form.Item>
                                    <Form.Item
                                        label="单元格数量"
                                        name="numberOfCells"
                                        valuePropName="checked"
                                    >
                                        <Checkbox />
                                    </Form.Item>
                                    <Form.Item
                                        label="最小值"
                                        name="minimum"
                                        valuePropName="checked"
                                    >
                                        <Checkbox />
                                    </Form.Item>
                                    <Form.Item
                                        label="最大值"
                                        name="maximum"
                                        valuePropName="checked"
                                    >
                                        <Checkbox />
                                    </Form.Item>
                                    {/* range  sum后面必须加1 */}
                                    <Form.Item
                                        label="范围"
                                        name="range1"
                                        valuePropName="checked"
                                    >
                                        <Checkbox />
                                    </Form.Item>
                                    <Form.Item
                                        label="总和"
                                        name="sum1"
                                        valuePropName="checked"
                                    >
                                        <Checkbox />
                                    </Form.Item>
                                    <Form.Item
                                        label="平均值"
                                        name="mean"
                                        valuePropName="checked"
                                    >
                                        <Checkbox />
                                    </Form.Item>
                                    <Form.Item
                                        label="方差"
                                        name="variance"
                                        valuePropName="checked"
                                    >
                                        <Checkbox />
                                    </Form.Item>
                                    <Form.Item
                                        label="标准差"
                                        name="standardDeviation"
                                        valuePropName="checked"
                                    >
                                        <Checkbox />
                                    </Form.Item>
                                    <Form.Item
                                        label="Gini系数"
                                        name="gini"
                                        valuePropName="checked"
                                    >
                                        <Checkbox />
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

export default TJFX;
