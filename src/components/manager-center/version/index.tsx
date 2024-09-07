import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  message,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import CustomTable from "@/components/table";
import CustomButton from "@/components/button";
import {
  type VersionBody,
  addVersion,
  queryVersionList,
} from "@/request/manager/version";
import dayjs from "dayjs";
import styles from "./version.module.scss";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const columns = [
  {
    title: "序号",
    dataIndex: "index",
    key: "index",
  },
  {
    title: "标题",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "内容",
    dataIndex: "detail",
    key: "detail",
  },
  {
    title: "版本号",
    dataIndex: "version",
    key: "version",
  },
  {
    title: "发布日期",
    dataIndex: "updateTime",
    key: "updateTime",
  },
];

const Index = () => {
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
  });
  const [dataSource, setDataSource] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    queryVersionList()
      .then((resp) => {
        setTotal(resp.total);
        setDataSource(
          resp.records.map((record: Record<string, any>, index: number) => ({
            ...record,
            index: index + 1,
            key: record.number,
          }))
        );
        setLoading(false);
      })
      .catch((err) => {
        message.error("获取版本列表失败！");
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleAdd = useCallback(() => {
    setOpen(true);
  }, []);

  const onFinish = useCallback(() => {
    const boolean = form.getFieldValue("time");
    setLoading(true);
    queryVersionList({
      version: form.getFieldValue("version"),
      title: form.getFieldValue("title"),
      startTime: boolean
        ? dayjs(form.getFieldValue("time")?.[0])
            .startOf("day")
            .format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      endTime: boolean
        ? dayjs(form.getFieldValue("time")?.[1])
            .endOf("day")
            .format("YYYY-MM-DD HH:mm:ss")
        : undefined,
      ...pagination,
    })
      .then((resp) => {
        setTotal(resp.total);
        setDataSource(
          resp.records.map((record: Record<string, any>, index: number) => ({
            ...record,
            index: index + 1,
            key: record.number,
          }))
        );
        setLoading(false);
      })
      .catch((err) => {
        message.error("获取版本列表失败！");
        console.error(err);
        setLoading(false);
      });
    // setRefresh((bool) => !bool);
  }, []);

  const onModalFinish = useCallback((values: VersionBody) => {
    addVersion({
      ...values,
    })
      .then(() => {
        message.success("发布成功！");
        setOpen(false);
        setRefresh((bool) => !bool);
      })
      .catch((err) => {
        message.error("发布失败！");
        console.error(err);
      });
  }, []);

  const handleReset = useCallback(() => {
    form.resetFields();
    onFinish();
    setRefresh((bool) => !bool);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.searchBox}>
        <div className={styles.btns}>
          <CustomButton
            bgColor="rgba(242, 248, 255, 1)"
            borderColor="rgba(46, 143, 255, 1)"
            style={{ marginRight: 20 }}
            onClick={handleAdd}
          >
            发布版本
          </CustomButton>
        </div>
        <Form form={form} onFinish={onFinish} layout="inline">
          <Form.Item name="title" label="标题">
            <Input />
          </Form.Item>
          <Form.Item name="version" label="版本">
            <Input />
          </Form.Item>
          <Form.Item name="time" label="更新日期">
            <RangePicker />
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
      </div>
      <div className={styles.tableBox}>
        <CustomTable
          total={total}
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          useSelection={false}
          scroll={{ y: 680 }}
          onPaginationChange={(page, pageSize) => {
            setPagination({ pageNumber: page, pageSize });
            setRefresh((bool) => !bool);
          }}
        />
      </div>
      <Modal
        title="新增版本"
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
        maskClosable={false}
        destroyOnClose
      >
        <Form
          style={{ padding: "20px 0" }}
          preserve={false}
          form={modalForm}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          onFinish={onModalFinish}
        >
          <Form.Item label="标题" name="title" rules={[{ required: true }]}>
            <Input style={{ width: 300 }} />
          </Form.Item>
          <Form.Item label="内容" name="detail" rules={[{ required: true }]}>
            <TextArea rows={8} style={{ width: 300 }} />
          </Form.Item>
          <Form.Item label="版本号" name="version" rules={[{ required: true }]}>
            <InputNumber style={{ width: 300 }} />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button onClick={() => setOpen(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              确定
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Index;
