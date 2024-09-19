import { useCallback, useEffect, useRef, useState } from "react";
import {
    DeleteOutlined,
    EditOutlined,
    PlusCircleOutlined,
} from "@ant-design/icons";
import {
    Button,
    Drawer,
    Form,
    Input,
    Modal,
    Select,
    TableProps,
    Tabs,
    message,
    type TabsProps,
} from "antd";
import CustomTable from "../table";
import { addDrawLayers, toogleVectorOpen } from "@/store/slices/boxSlice";
import { toFeatureCollection } from "@/utils/common";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import styles from "./layerManager.module.scss";

const items: TabsProps["items"] = [
    {
        key: "label",
        label: "字段",
    },
    {
        key: "properties",
        label: "属性表",
    },
];

const labelColumns: TableProps["columns"] = [
    {
        key: "name",
        title: "字段名称",
        dataIndex: "name",
    },
    {
        key: "type",
        title: "类型",
        dataIndex: "type",
    },
];

export default () => {
    const dispatch = useAppDispatch();
    const currentLayer = useAppSelector((slice) => slice.box.currentLayer);
    const vectorOpen = useAppSelector((slice) => slice.box.vectorOpen);
    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const [addOpen, setAddOpen] = useState(false);

    const [isParse, setIsParse] = useState(false);
    const [editPropertyOpen, setEditPropertyOpen] = useState(false);
    const [currentKey, setCurrentKey] = useState("label");
    const [propertyColumns, setPropertyColumns] = useState<
        TableProps["columns"]
    >([]);
    const [rows, setRows] = useState<Record<string, any>[]>([]);
    const [labelSource, setLabelSource] = useState<Record<string, any>[]>([]);
    const [propertySource, setPropertySource] = useState<Record<string, any>[]>(
        []
    );
    const geojsonRef = useRef<Record<string, any>>({});

    useEffect(() => {
        if (!isParse) return;
        if (currentKey === "label") return;
        const columns: TableProps["columns"] = [];
        labelSource.forEach((label) => {
            columns.push({
                title: label.name,
                key: label.name,
                dataIndex: label.name,
            });
        });
        setPropertyColumns(columns);
    }, [currentKey]);

    useEffect(() => {
        if (!vectorOpen) return;
        if (!currentLayer.layerIds.length) return;
        // todo 生成featureCollection
        const featureGeojson: Record<string, any> =
            toFeatureCollection(currentLayer);
        geojsonRef.current = featureGeojson;
        const datas: Record<string, any>[] = [];

        Object.entries(featureGeojson.features?.[0]?.properties).forEach(
            ([key, value]: [string, any], index: number) => {
                datas.push({
                    name: key,
                    type: typeof value === "number" ? "数值" : "文本",
                });
            }
        );
        setLabelSource(datas.map((item, index) => ({ ...item, key: index })));

        const columns: TableProps["columns"] = [];
        Object.keys(featureGeojson.features?.[0]?.properties).forEach(
            (key: string) => {
                columns.push({
                    title: key,
                    key,
                    dataIndex: key,
                });
            }
        );
        setPropertyColumns(columns);

        // todo 编成多个Feature
        const datas2: Record<string, any>[] = [];
        const data: Record<string, any> = {};
        featureGeojson.features.forEach((feature: Record<string, any>) => {
            columns.forEach((column) => {
                data[column.key!] = feature.properties[column.key!];
            });
            datas2.push(data);
        });
        setPropertySource(
            datas2.map((item, index) => ({ ...item, key: index }))
        );
        setIsParse(true);
    }, [vectorOpen, currentLayer]);

    const onEditChange = useCallback((key: string) => {
        setCurrentKey(key);
    }, []);

    const handlePropertyEdit = useCallback((record: Record<string, any>) => {
        setEditPropertyOpen(true);
        editForm.setFieldsValue({
            ...record,
        });
    }, []);

    const onAddFinish = useCallback(() => {
        addForm.validateFields().then((values) => {
            setLabelSource([
                ...labelSource,
                { ...values, key: labelSource.length },
            ]);
            setAddOpen(false);
        });
    }, [labelSource]);

    const onEditFinish = useCallback(() => {
        editForm.validateFields().then((values) => {
            const sources = propertySource.map((s, i) => {
                if (i === values.key) {
                    return values;
                }
                return s;
            });
            setPropertySource(sources);
            setEditPropertyOpen(false);
        });
    }, [propertySource]);

    const onSelectionChange = useCallback((records: Record<string, any>[]) => {
        setRows(records);
    }, []);

    const handleDelete = () => {
        const keys = rows.map((row) => row.key);
        const newSources = labelSource.filter((s) => !keys.includes(s.key));
        setLabelSource(newSources);
    };

    const handleSaveKey = () => {
        const objs = labelSource.map((label) => ({
            [label.name]: label.type === "文本" ? "" : null,
        }));
        const obj = objs.reduce((pre, next) => ({ ...pre, ...next }), {});
        propertySource.forEach((property, index) => {
            geojsonRef.current.features[index].properties = obj;
        });
        console.log("geojson", geojsonRef.current);
        dispatch(
            addDrawLayers({
                type: "update",
                layerObj: {
                    ...currentLayer,
                    geojson: geojsonRef.current,
                },
            })
        );
        message.success("保存成功！");
    };

    const handleSaveValue = () => {
        propertySource.forEach((property, index) => {
            const obj = { ...property };
            delete obj.key;
            geojsonRef.current.features[index].properties = { ...obj };
        });
        console.log("geojson", geojsonRef.current);
        dispatch(
            addDrawLayers({
                type: "update",
                layerObj: {
                    ...currentLayer,
                    geojson: geojsonRef.current,
                },
            })
        );
        message.success("保存成功！");
        dispatch(toogleVectorOpen(false));
    };

    return (
        <>
            <Drawer
                open={vectorOpen}
                title="属性编辑"
                width={450}
                maskClosable={false}
                destroyOnClose
                onClose={() => dispatch(toogleVectorOpen(false))}
            >
                <Tabs
                    defaultActiveKey={currentKey}
                    items={items}
                    onChange={onEditChange}
                />
                {currentKey === "label" ? (
                    <>
                        <div className={styles.btns}>
                            <Button
                                icon={<PlusCircleOutlined />}
                                onClick={() => setAddOpen(true)}
                            >
                                添加字段
                            </Button>
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={handleDelete}
                            >
                                删除
                            </Button>
                            <Button type="primary" onClick={handleSaveKey}>
                                保存
                            </Button>
                        </div>
                        <CustomTable
                            columns={labelColumns.map((source, index) => ({
                                ...source,
                                key: index,
                            }))}
                            dataSource={labelSource}
                            usePagination={false}
                            onSelectionChange={onSelectionChange}
                        />
                    </>
                ) : (
                    <>
                        <div className={styles.btns}>
                            <Button type="primary" onClick={handleSaveValue}>
                                保存
                            </Button>
                        </div>
                        <CustomTable
                            columns={[
                                ...propertyColumns!,
                                {
                                    title: "操作",
                                    key: "action",
                                    dataIndex: "action",
                                    render: (_, record) => (
                                        <Button
                                            type="link"
                                            title="编辑"
                                            onClick={() =>
                                                handlePropertyEdit(record)
                                            }
                                        >
                                            <EditOutlined
                                                className={styles.icon}
                                            />
                                        </Button>
                                    ),
                                },
                            ]}
                            dataSource={propertySource}
                            useSelection={false}
                            usePagination={false}
                        />
                    </>
                )}
            </Drawer>
            <Modal
                title="添加字段"
                open={addOpen}
                width={300}
                onCancel={() => setAddOpen(false)}
                maskClosable={false}
                onOk={onAddFinish}
                destroyOnClose
            >
                <Form
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    form={addForm}
                    preserve={false}
                >
                    <Form.Item
                        label="字段名称"
                        name="name"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="类型"
                        name="type"
                        rules={[{ required: true }]}
                    >
                        <Select
                            options={[
                                {
                                    label: "数值",
                                    value: "数值",
                                },
                                {
                                    label: "文本",
                                    value: "文本",
                                },
                            ]}
                        />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="编辑属性"
                open={editPropertyOpen}
                width={300}
                destroyOnClose
                maskClosable={false}
                onOk={onEditFinish}
                onCancel={() => setEditPropertyOpen(false)}
            >
                <Form
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    form={editForm}
                    preserve={false}
                >
                    <Form.Item label="key" name="key" hidden>
                        <Input />
                    </Form.Item>
                    {propertyColumns?.map((column, index) => {
                        return (
                            <Form.Item
                                key={index}
                                label={column.title as string}
                                name={column.key}
                            >
                                <Input />
                            </Form.Item>
                        );
                    })}
                </Form>
            </Modal>
        </>
    );
};
