import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Tabs,
  Upload,
  message,
  Select,
  type TabsProps,
  type PopconfirmProps,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  deletePlatformResource,
  deleteResource,
  editGridResource,
  editVectorResource,
  queryGridResource,
  queryPlatformGridResource,
  queryPlatformVectorResource,
  queryVectorResource,
  uploadGridResource,
  uploadVectorResource,
  listSatelliteData,
  listSensorData,
} from "@/request/resource";
import CustomTable from "../../table";
import CustomButton from "../../button";

import styles from "./resource.module.scss";
import { BASE_PATH } from "@/utils/globalVariable";

const { RangePicker } = DatePicker;
const { Search } = Input;

const items: TabsProps["items"] = [
  {
    key: "my",
    label: "我的数据",
  },
  {
    key: "platform",
    label: "平台数据",
  },
];

interface Props {}

const rasterColumns = [
  {
    title: "数据名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "卫星类型",
    dataIndex: "imageSatelliteType",
    key: "imageSatelliteType",
  },
  {
    title: "传感器类型",
    dataIndex: "imageSensor",
    key: "imageSensor",
  },
  {
    title: "采集时间",
    dataIndex: "imagePhenomenonTime",
    key: "imagePhenomenonTime",
  },
  {
    title: "云量",
    dataIndex: "imageCoverCloud",
    key: "imageCoverCloud",
  },
];

const vectorColumns = [
  {
    title: "数据名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "采集时间",
    dataIndex: "time",
    key: "time",
  },
  {
    title: "备注",
    dataIndex: "message",
    key: "message",
  },
];

const MyData = () => {
  const uid = localStorage.getItem("education-uid");
  const [form] = Form.useForm();
  const [uploadForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(1);
  const [title, setTitle] = useState("");
  const [total, setTotal] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [GridSearchValue, setGridSearchValue] = useState("");
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
  });
  const [columns, setColumns] = useState(rasterColumns);
  const [dataSource, setDataSource] = useState<Record<string, any>[]>([]);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [satelliteList, setSatelliteList] = useState();
  const [sensorList, setSensoList] = useState();
  const [sensorListT, setSensoListT] = useState();
  // 获取卫星
  useEffect(() => {
    listSatelliteData()
      .then((res: any) => {
        const satellites = res.map((item: any) => ({
          value: item,
          label: item,
        }));
        setSatelliteList(satellites);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);
  // 获取传感器
  const handleChange = (value: string) => {
    listSensorData(value)
      .then((res: any) => {
        const sensor = res.map((item: any) => ({
          value: item.sensorKey,
          label: item.sensorName,
        }));
        setSensoList(sensor);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  // 获取搜索卫星对应的传感器
  const handleChangeSatelliteType = (value: string) => {
    listSensorData(value)
      .then((res: any) => {
        const sensor = res.map((item: any) => ({
          value: item.sensorName,
          label: item.sensorName,
        }));
        setSensoListT(sensor);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    setLoading(true);
    if (status === 1) {
      queryGridResource({
        format: form.getFieldValue("format"),
        satelliteType: form.getFieldValue("satelliteType"),
        sensor: form.getFieldValue("sensorType"),
        minCloud: form.getFieldValue("minCloud"),
        maxCloud: form.getFieldValue("maxCloud"),
        startTime: form
          .getFieldValue("phenomenonTime")?.[0]
          ?.format("YYYY-MM-DD HH:mm:ss"),
        endTime: form
          .getFieldValue("phenomenonTime")?.[1]
          ?.format("YYYY-MM-DD HH:mm:ss"),
        nameFuzzyWord: GridSearchValue,
        ...pagination,
      })
        .then((resp) => {
          setLoading(false);
          setTotal(resp.total);
          setDataSource(
            resp.records.map((record: Record<string, any>) => ({
              ...record,
              key: record.id,
            }))
          );
        })
        .catch((err) => {
          console.error(err);
          message.error("获取栅格数据列表失败！");
          setLoading(false);
        });
    } else {
      queryVectorResource({
        nameFuzzyWord: searchValue,
        ...pagination,
      })
        .then((resp) => {
          setLoading(false);
          setTotal(resp.total);
          setDataSource(
            resp.records.map((record: Record<string, any>) => ({
              ...record,
              key: record.id,
            }))
          );
        })
        .catch((err) => {
          console.error(err);
          message.error("获取矢量数据列表失败！");
          setLoading(false);
        });
    }
  }, [refresh, status]);

  const handleUpload = useCallback(() => {
    setTitle("上传数据");
    setOpen(true);
  }, []);

  const handleEdit = useCallback((record: Record<string, any>) => {
    setTitle("编辑数据");
    listSensorData(record.imageSatelliteType)
      .then((res: any) => {
        const sensor = res.map((item: any) => ({
          value: item.sensorKey,
          label: item.sensorName,
        }));
        setSensoList(sensor);
      })
      .catch((error) => {
        console.error(error);
      });
    editForm.setFieldsValue({
      name: record.name,
      sensorType: record.imageSensor,
      coverCloud: record.imageCoverCloud,
      satelliteType: record.imageSatelliteType,
      message: record.message,
      resourceId: record.id,
      phenomenonTime: dayjs(record.imagePhenomenonTime),
    });
    setOpen(true);
  }, []);

  // 删除功能
  const confirm = (record: Record<string, any>) => {
    deleteResource([record.id])
      .then((resp) => {
        message.success("删除成功！");
        setRefresh((bool) => !bool);
      })
      .catch((err) => {
        console.error(err);
        message.error("删除失败！");
      });
  };

  const cancel: PopconfirmProps["onCancel"] = (e) => {};

  const onFinish = useCallback((values: any) => {
    setRefresh((bool) => !bool);
  }, []);

  const onUploadFinish = useCallback(
    (values: Record<string, any>) => {
      setUploading(true);
      const formData = new FormData();
      if (status === 1) {
        formData.append("name", values.name);
        formData.append("message", values.satelliteType);
        formData.append("sensorKey", values.sensorType);
        formData.append("coverCloud", values.coverCloud);
        formData.append(
          "phenomenonTime",
          values.phenomenonTime.format("YYYY-MM-DD HH:mm:ss")
        );
        formData.append("file", values.file.file);
        uploadGridResource(formData)
          .then((resp) => {
            message.success("上传成功！");
            setUploading(false);
            setOpen(false);
            setRefresh((bool) => !bool);
          })
          .catch((err) => {
            setUploading(false);
            console.error(err);
            message.error("上传失败！");
          });
      } else {
        formData.append("name", values.name);
        formData.append("message", values.message);
        formData.append("file", values.file.file);
        uploadVectorResource(formData)
          .then((resp) => {
            message.success("上传成功！");
            setUploading(false);
            setOpen(false);
            setRefresh((bool) => !bool);
          })
          .catch((err) => {
            setUploading(false);
            console.error(err);
            message.error("上传失败！");
          });
      }
    },
    [status]
  );

  const onEditFinish = useCallback(
    (values: Record<string, any>) => {
      const formData = new FormData();
      formData.append("resourceId", values.resourceId);
      if (status === 1) {
        formData.append("name", values.name);
        // formData.append("satelliteType", values.satelliteType);
        formData.append("sensorKey", values.sensorType);
        formData.append("coverCloud", values.coverCloud);
        formData.append(
          "phenomenonTime",
          values.phenomenonTime.format("YYYY-MM-DD HH:mm:ss")
        );
        editGridResource(formData)
          .then((resp) => {
            message.success("编辑成功！");
            setOpen(false);
            setRefresh((bool) => !bool);
          })
          .catch((err) => {
            console.error(err);
            message.error("编辑失败！");
          });
      } else {
        formData.append("name", values.name);
        formData.append("message", values.message);
        editVectorResource(formData)
          .then((resp) => {
            message.success("编辑成功！");
            setOpen(false);
            setRefresh((bool) => !bool);
          })
          .catch((err) => {
            console.error(err);
            message.error("编辑失败！");
          });
      }
    },
    [status]
  );

  const handleReset = useCallback(() => {
    form.resetFields();
    setRefresh((bool) => !bool);
  }, []);

  const onDeleteMultiple = useCallback(() => {
    const ids = rows.map((row) => row.id);
    if (!ids.length) {
      message.warning("请先选择要删除的数据！");
      return;
    }
    deleteResource(ids)
      .then((resp) => {
        message.success("删除成功！");
        setRefresh((bool) => !bool);
      })
      .catch((err) => {
        console.error(err);
        message.error("删除失败！");
      });
  }, [rows]);

  const handleDownload = useCallback(() => {
    if (!rows.length) {
      message.warning("请先选择下载项！");
      return;
    }
    const ids = rows.map((row) => row.id);
    const querystring = ids.map((id) => `resourceIds=${id}`).join("&");
    // todo uid需要动态获取
    window.open(
      `${BASE_PATH}/api/resource/personal/download?id=${uid}&${querystring}`
    );
  }, [rows]);

  const onSearch = useCallback((value: string) => {
    setSearchValue(value);
    setRefresh((bool) => !bool);
  }, []);

  // 栅格搜索
  const onGridSearch = useCallback((value: string) => {
    setGridSearchValue(value);
    setRefresh((bool) => !bool);
  }, []);

  const onBeforeUpload = useCallback((file: File) => {
    return false;
  }, []);

  return (
    <div className={styles.contentBox}>
      <div className={styles.tab}>
        <div className={styles.dataType}>
          <CustomButton
            onClick={() => {
              setColumns(rasterColumns);
              setStatus(1);
            }}
            borderColor="transparent"
            bgColor="transparent"
            style={
              status === 1
                ? {
                    borderColor: "rgba(46, 143, 255, 1)",
                    backgroundColor: "rgba(46, 143, 255, 1)",
                    color: "#fff",
                    padding: "5px 5px",
                  }
                : { color: "rgba(56, 56, 56, 1)", padding: "5px 5px" }
            }
          >
            栅格数据
          </CustomButton>
          <CustomButton
            onClick={() => {
              setColumns(vectorColumns);
              setStatus(2);
            }}
            borderColor="transparent"
            bgColor="transparent"
            style={
              status === 2
                ? {
                    borderColor: "rgba(46, 143, 255, 1)",
                    backgroundColor: "rgba(46, 143, 255, 1)",
                    color: "#fff",
                    padding: "5px 5px",
                  }
                : { color: "rgba(56, 56, 56, 1)", padding: "5px 5px" }
            }
          >
            矢量数据
          </CustomButton>
        </div>
      </div>
      <div className={styles.searchBox}>
        <div className={styles.btns}>
          <CustomButton
            bgColor="rgba(242, 248, 255, 1)"
            borderColor="rgba(46, 143, 255, 1)"
            style={{ marginRight: 20 }}
            onClick={handleUpload}
          >
            上传
          </CustomButton>
          <CustomButton
            borderColor="rgba(0, 186, 173, 1)"
            bgColor="rgba(237, 255, 254, 1)"
            style={{ marginRight: 20 }}
            onClick={handleDownload}
          >
            下载
          </CustomButton>
          <Popconfirm
            description="确认要删除吗？"
            title={null}
            okText="确认"
            cancelText="取消"
            onConfirm={onDeleteMultiple}
          >
            <CustomButton
              borderColor="rgba(245, 71, 52, 1)"
              bgColor="rgba(252, 240, 240, 1)"
            >
              批量删除
            </CustomButton>
          </Popconfirm>
        </div>
        {status === 1 ? (
          <Form form={form} onFinish={onFinish} layout="inline">
            <Form.Item name="satelliteType" label="卫星类型">
              <Select
                style={{ width: 120 }}
                onChange={handleChangeSatelliteType}
                options={satelliteList}
              />
            </Form.Item>
            <Form.Item name="sensorType" label="传感器类型">
              <Select style={{ width: 120 }} options={sensorListT} />
            </Form.Item>
            <Form.Item name="phenomenonTime" label="采集时间">
              <RangePicker />
            </Form.Item>
            <Form.Item name="maxCloud">
              <InputNumber style={{ width: 60 }} min={0} max={1} step={0.1} />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginRight: 10 }}
              >
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Form.Item>
          </Form>
        ) : (
          <Search
            placeholder="请输入名称搜索"
            allowClear
            enterButton
            style={{ width: 245 }}
            onSearch={onSearch}
          />
        )}
      </div>
      <div className={styles.tableBox}>
        <CustomTable
          loading={loading}
          total={total}
          onPaginationChange={(page, pageSize) => {
            setPagination({ pageNumber: page, pageSize });
            setRefresh((bool) => !bool);
          }}
          onSelectionChange={(rows) => setRows(rows)}
          columns={[
            ...columns,
            {
              title: "操作",
              dataIndex: "action",
              key: "action",
              render: (_, record) => {
                return (
                  <>
                    <Button
                      type="link"
                      onClick={() => handleEdit(record)}
                      title="编辑"
                    >
                      <EditOutlined className={styles.icon} />
                    </Button>
                    <Popconfirm
                      title="您确定要删除这条数据吗?"
                      description=""
                      onConfirm={() => confirm(record)}
                      onCancel={cancel}
                      okText="确定"
                      cancelText="取消"
                      style={{ marginLeft: "200px" }}
                    >
                      <Button type="link" title="删除">
                        <DeleteOutlined
                          className={styles.icon}
                          style={{ color: "#f10" }}
                        />
                      </Button>
                    </Popconfirm>
                  </>
                );
              },
            },
          ]}
          scroll={{ y: 680 }}
          dataSource={dataSource}
        />
      </div>
      <Modal
        title={title}
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
        maskClosable={false}
        destroyOnClose
      >
        {title === "上传数据" ? (
          <Form
            style={{ padding: "20px 0" }}
            preserve={false}
            form={uploadForm}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={onUploadFinish}
          >
            <Form.Item
              label="数据名称"
              name="name"
              rules={[{ required: true }]}
            >
              <Input className={styles.input} style={{ width: 350 }} />
            </Form.Item>
            {status == 1 ? (
              <>
                <Form.Item
                  label="卫星类型"
                  name="satelliteType"
                  rules={[{ required: true }]}
                >
                  <Select
                    style={{ width: 350 }}
                    onChange={handleChange}
                    options={satelliteList}
                  />
                </Form.Item>
                <Form.Item
                  label="传感器类型"
                  name="sensorType"
                  rules={[{ required: true }]}
                >
                  <Select style={{ width: 350 }} options={sensorList} />
                </Form.Item>
                <Form.Item
                  label="采集时间"
                  name="phenomenonTime"
                  rules={[{ required: true }]}
                >
                  <DatePicker style={{ width: 350 }} />
                </Form.Item>
              </>
            ) : null}

            <Form.Item
              label="数据文件"
              name="file"
              rules={[{ required: true }]}
            >
              <Upload
                beforeUpload={onBeforeUpload}
                accept={
                  status === 1 ? ".tif,.tiff,.img" : ".zip,.geojson,.kml,.kmz"
                }
              >
                <Button icon={<UploadOutlined />}>选择文件</Button>
              </Upload>
            </Form.Item>
            {status === 1 ? (
              <Form.Item
                label="云量"
                name="coverCloud"
                initialValue={0.1}
                rules={[{ required: true }]}
                hidden
              >
                <InputNumber
                  className={styles.input}
                  style={{ width: 350 }}
                  min={0}
                  max={1}
                />
              </Form.Item>
            ) : (
              <Form.Item
                label="备注"
                name="message"
                rules={[{ required: true }]}
              >
                <Input className={styles.input} style={{ width: 350 }} />
              </Form.Item>
            )}

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <Button onClick={() => setOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={uploading}>
                确定
              </Button>
            </div>
          </Form>
        ) : (
          <Form
            style={{ padding: "20px 0" }}
            preserve={false}
            form={editForm}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={onEditFinish}
          >
            <Form.Item name="resourceId" hidden>
              <Input />
            </Form.Item>
            <Form.Item
              label="数据名称"
              name="name"
              rules={[{ required: true }]}
            >
              <Input className={styles.input} style={{ width: 350 }} />
            </Form.Item>
            {status === 1 ? (
              <>
                <Form.Item
                  label="卫星类型"
                  name="satelliteType"
                  rules={[{ required: true }]}
                >
                  <Select
                    style={{ width: 350 }}
                    onChange={handleChange}
                    options={satelliteList}
                  />
                </Form.Item>
                <Form.Item
                  label="传感器类型"
                  name="sensorType"
                  rules={[{ required: true }]}
                >
                  <Select style={{ width: 350 }} options={sensorList} />
                </Form.Item>
                <Form.Item
                  label="采集时间"
                  name="phenomenonTime"
                  rules={[{ required: true }]}
                >
                  <DatePicker style={{ width: 350 }} />
                </Form.Item>
              </>
            ) : null}
            {status === 1 ? (
              <Form.Item
                label="云量"
                name="coverCloud"
                initialValue={0.1}
                rules={[{ required: true }]}
                hidden
              >
                <InputNumber
                  className={styles.input}
                  style={{ width: 350 }}
                  min={0}
                  max={1}
                />
              </Form.Item>
            ) : (
              <Form.Item
                label="备注"
                name="message"
                rules={[{ required: true }]}
              >
                <Input className={styles.input} style={{ width: 350 }} />
              </Form.Item>
            )}
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <Button onClick={() => setOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

const imageryMap = {
  name: "名称",
  imageSatelliteType: "卫星",
  imagePhenomenonTime: "采集时间",
  imageCoverCloud: "云量",
  imageUpperLeftLat: "左上角经度",
  imageUpperLeftLong: "左上角纬度",
  imageUpperRightLat: "右下角经度",
  imageUpperRightLong: "右下角纬度",
};

const PlatformData = () => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
  });
  const [row, setRow] = useState<Record<string, any>>({});
  const [columns, setColumns] = useState(rasterColumns);
  const [dataSource, setDataSource] = useState<Record<string, any>[]>([]);
  const [sensorListT, setSensoListT] = useState();
  const [satelliteList, setSatelliteList] = useState();
  // 获取卫星
  useEffect(() => {
    listSatelliteData()
      .then((res: any) => {
        const satellites = res.map((item: any) => ({
          value: item,
          label: item,
        }));
        setSatelliteList(satellites);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);
  // 获取搜索卫星对应的传感器
  const handleChangeSatelliteType = (value: string) => {
    listSensorData(value)
      .then((res: any) => {
        const sensor = res.map((item: any) => ({
          value: item.sensorName,
          label: item.sensorName,
        }));
        setSensoListT(sensor);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  useEffect(() => {
    setLoading(true);
    if (status === 1) {
      queryPlatformGridResource({
        format: form.getFieldValue("format"),
        satelliteType: form.getFieldValue("satelliteType"),
        sensor: form.getFieldValue("sensorType"),
        minCloud: form.getFieldValue("minCloud"),
        maxCloud: form.getFieldValue("maxCloud"),
        startTime: form
          .getFieldValue("phenomenonTime")?.[0]
          ?.format("YYYY-MM-DD HH:mm:ss"),
        endTime: form
          .getFieldValue("phenomenonTime")?.[1]
          ?.format("YYYY-MM-DD HH:mm:ss"),
        ...pagination,
      })
        .then((resp) => {
          setLoading(false);
          setTotal(resp.total);
          setDataSource(
            resp.records.map((record: Record<string, any>) => ({
              ...record,
              key: record.id,
            }))
          );
        })
        .catch((err) => {
          console.error(err);
          message.error("获取栅格数据列表失败！");
          setLoading(false);
        });
    } else {
      queryPlatformVectorResource({
        nameFuzzyWord: searchValue,
        ...pagination,
      })
        .then((resp) => {
          setLoading(false);
          setTotal(resp.total);
          setDataSource(
            resp.records.map((record: Record<string, any>) => ({
              ...record,
              imagePhenomenonTime: record.time,
              key: record.id,
            }))
          );
        })
        .catch((err) => {
          console.error(err);
          message.error("获取矢量数据列表失败！");
          setLoading(false);
        });
    }
  }, [refresh, status]);

  const onFinish = useCallback((values?: any) => {
    setRefresh((bool) => !bool);
  }, []);

  const handleReset = useCallback(() => {
    form.resetFields();
    onFinish();
  }, []);

  const handleChange = useCallback((page: number, pageSize: number) => {
    setPagination({
      pageNumber: page,
      pageSize,
    });
    setRefresh((bool) => !bool);
  }, []);

  const handleDetail = useCallback((record: Record<string, any>) => {
    setRow(record);
    setOpen(true);
  }, []);

  const handleDelete = useCallback((record: Record<string, any>) => {
    deletePlatformResource([record.id])
      .then((resp) => {
        message.success("删除成功！");
        setRefresh((bool) => !bool);
      })
      .catch((err) => {
        console.error(err);
        message.success("删除失败！");
      });
  }, []);

  const onSearch = useCallback((value: string) => {
    setSearchValue(value);
    setRefresh((bool) => !bool);
  }, []);

  return (
    <div className={styles.contentBox}>
      <div className={styles.tab}>
        <div className={styles.dataType}>
          <CustomButton
            onClick={() => {
              setColumns(rasterColumns);
              setStatus(1);
            }}
            borderColor="transparent"
            bgColor="transparent"
            style={
              status === 1
                ? {
                    borderColor: "rgba(46, 143, 255, 1)",
                    backgroundColor: "rgba(46, 143, 255, 1)",
                    color: "#fff",
                    padding: "5px 5px",
                  }
                : { color: "rgba(56, 56, 56, 1)", padding: "5px 5px" }
            }
          >
            栅格数据
          </CustomButton>
          <CustomButton
            onClick={() => {
              setColumns(vectorColumns);
              setStatus(2);
            }}
            borderColor="transparent"
            bgColor="transparent"
            style={
              status === 2
                ? {
                    borderColor: "rgba(46, 143, 255, 1)",
                    backgroundColor: "rgba(46, 143, 255, 1)",
                    color: "#fff",
                    padding: "5px 5px",
                  }
                : { color: "rgba(56, 56, 56, 1)", padding: "5px 5px" }
            }
          >
            矢量数据
          </CustomButton>
        </div>
      </div>
      <div className={styles.searchBox}>
        {status === 1 ? (
          <>
            <CustomButton
              bgColor="rgba(242, 248, 255, 1)"
              borderColor="rgba(46, 143, 255, 1)"
              onClick={() =>
                window.open(
                  "http://www.openge.org.cn/resourceCenter?type=dataset"
                )
              }
            >
              前往资源中心
            </CustomButton>
            <Form form={form} onFinish={onFinish} layout="inline">
              <Form.Item name="satelliteType" label="卫星类型">
                <Select
                  style={{ width: 120 }}
                  onChange={handleChangeSatelliteType}
                  options={satelliteList}
                />
              </Form.Item>
              <Form.Item name="sensorType" label="传感器类型">
                <Select style={{ width: 120 }} options={sensorListT} />
              </Form.Item>
              <Form.Item name="sensorType" label="传感器类型">
                <Select style={{ width: 120 }} options={sensorListT} />
              </Form.Item>
              <Form.Item name="phenomenonTime" label="采集时间">
                <RangePicker
                  style={{ width: 230 }}
                  placeholder={["开始日期", "结束 日期"]}
                />
              </Form.Item>
              <Form.Item name="minCloud" label="云量">
                <InputNumber style={{ width: 50 }} />
              </Form.Item>
              <Form.Item name="maxCloud">
                <InputNumber style={{ width: 50 }} />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ marginRight: 10 }}
                >
                  搜索
                </Button>
                <Button onClick={handleReset}>重置</Button>
              </Form.Item>
            </Form>
          </>
        ) : (
          <>
            <CustomButton
              bgColor="rgba(242, 248, 255, 1)"
              borderColor="rgba(46, 143, 255, 1)"
              onClick={() =>
                window.open(
                  "http://www.openge.org.cn/resourceCenter?type=dataset"
                )
              }
            >
              前往资源中心
            </CustomButton>
            <Search
              placeholder="请输入名称搜索"
              allowClear
              enterButton
              style={{ width: 245 }}
              onSearch={onSearch}
            />
          </>
        )}
      </div>
      <div className={styles.tableBox}>
        <CustomTable
          loading={loading}
          columns={[
            ...columns,
            {
              title: "操作",
              dataIndex: "action",
              key: "action",
              render: (_, record) => {
                return (
                  <>
                    <Button type="link" onClick={() => handleDetail(record)}>
                      <InfoCircleOutlined
                        className={styles.icon}
                        style={{ color: "rgb(46, 143, 255)" }}
                      />
                    </Button>
                    <Button type="link" onClick={() => handleDelete(record)}>
                      <DeleteOutlined
                        className={styles.icon}
                        style={{ color: "#f10" }}
                      />
                    </Button>
                  </>
                );
              },
            },
          ]}
          dataSource={dataSource}
          useSelection={false}
          total={total}
          scroll={{ y: 680 }}
          onPaginationChange={handleChange}
        />
      </div>
      <Modal
        title="影像信息"
        width={600}
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <div className={styles.preview}>
          <img src={row.preview} alt="" />
        </div>
        <div className={styles.infos}>
          {Object.entries(imageryMap).map(([key, value]) => {
            return (
              <div className={styles.info}>
                <div className={styles.key}>{value}</div>
                <div className={styles.value}>{row[key]}</div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};

const tabComponent = {
  my: <MyData />,
  platform: <PlatformData />,
};

const Index: React.FC<Props> = () => {
  const [currentKey, setCurrentKey] = useState("my");
  const onChange = useCallback((key: string) => {
    setCurrentKey(key);
  }, []);
  return (
    <div className={styles.container}>
      <Tabs defaultActiveKey={currentKey} items={items} onChange={onChange} />
      {tabComponent[currentKey]}
    </div>
  );
};

export default Index;
