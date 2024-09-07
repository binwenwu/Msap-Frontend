import React, { type Key, useEffect, useState, useCallback } from "react";
import {
  Tree,
  Input,
  Button,
  Spin,
  message,
  Upload,
  Modal,
  Form,
  InputNumber,
} from "antd";
import { queryStudentsByTemplateId } from "@/request/template";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type {
  UploadChangeParam,
  UploadFile,
  UploadProps,
} from "antd/es/upload";
import CustomTable from "../table";
import styles from "./transfer.module.scss";
import { BASE_PATH } from "@/utils/globalVariable";

const { Search } = Input;

const studentColumns = [
  {
    title: "姓名",
    key: "sname",
    dataIndex: "sname",
  },
  {
    title: "学号",
    key: "sno",
    dataIndex: "sno",
  },
  {
    title: "分组",
    key: "groupNum",
    dataIndex: "groupNum",
  },
];

interface TransferTreeTableProps {
  templateId: any;
  setSelectedStudent: (students: Record<string, any>[]) => void;
}

const uploadProps: UploadProps = {
  action: `${BASE_PATH}/api/internship/practice/template/instance/student/import`,
  accept: ".xlsx",
};

const TransferTreeTable: React.FC<TransferTreeTableProps> = ({
  templateId,
  setSelectedStudent,
}) => {
  const token = localStorage.getItem("education-token");
  const head = localStorage.getItem("education-tokenHead");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);
  const [total, setTotal] = useState(0);
  const [treeKeys, setTreeKeys] = useState<Key[]>([]);
  const [tableKeys, setTableKeys] = useState<Key[]>([]);
  const [originTreeData, setOriginTreeData] = useState<any[]>([]);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    setLoading(true);
    queryStudentsByTemplateId(templateId)
      .then((resp: Record<string, any>[]) => {
        setTreeData(
          resp.map((item) => ({
            title: item.sname,
            value: item.uid,
            key: item.uid,
            extra: {
              ...item,
            },
          }))
        );
        setOriginTreeData(
          resp.map((item) => ({
            title: item.sname,
            value: item.uid,
            key: item.uid,
            extra: {
              ...item,
            },
          }))
        );
        setTotal(resp.length || 0);
        setLoading(false);
      })
      .catch((err) => {
        message.error("获取开课学生失败！");
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const keys = dataSource.map((item) => item.uid);
    const newTreeData = treeData.map((tree) => ({
      ...tree,
      disabled: keys.includes(tree.extra.uid),
    }));
    setTreeData(newTreeData);
  }, [tableKeys]);

  const onChange = useCallback(
    (value: any, info: any) => {
      if (info.node.key === "all") {
        info.node.checked
          ? setTreeKeys([])
          : setTreeKeys([...treeData.map((item) => item.key), "all"]);
      } else {
        value.checked.length === treeData.length - 1
          ? setTreeKeys([...value.checked, "all"])
          : setTreeKeys(value.checked.filter((item: any) => item !== "all"));
      }
    },
    [treeData]
  );

  const onSearch = useCallback(
    (value: string) => {
      setTreeData(originTreeData.filter((tree) => tree.title.includes(value)));
    },
    [treeData]
  );

  const onSelectionChange = useCallback((rows: Record<string, any>[]) => {
    const uids = rows.map((row) => row.uid);
    setTableKeys(uids);
  }, []);

  const handleToTable = () => {
    const selectedData = treeData.filter(
      (item) => treeKeys.includes(item.key) && !item.disabled
    );
    if (!selectedData.length) {
      message.warning("未选择数据！");
      return;
    }
    const tableData = treeData
      .filter((item) => treeKeys.includes(item.key))
      .map((item) => ({
        ...item,
        ...item.extra,
      }));
    setDataSource(tableData);
    setSelectedStudent(tableData);
    setKey((key) => key + 1);
  };

  const handleToTree = () => {
    const treeData = dataSource.filter((item) => !tableKeys.includes(item.uid));
    setDataSource(treeData);
    setTableKeys([]);
    setSelectedStudent(treeData);
    setKey((key) => key + 1);
  };

  const onUploadChange = useCallback(
    (info: UploadChangeParam<UploadFile>) => {
      if (info.file.status === "done") {
        if (info.file.response.code !== 20000) return;
        const students =
          (info.file.response?.data as Record<string, any>[]) || [];
        const snos = students.map((student) => student.sno);
        message.success("导入成功");
        const keys = [...treeKeys];
        const newTreeData = treeData;
        newTreeData.forEach((item, index) => {
          const i = snos.findIndex((sno) => sno === item.extra.sno);
          if (i !== -1) {
            keys.push(item.extra.uid);
            newTreeData[index] = {
              ...item,
              extra: {
                ...item.extra,
                ...students[i],
              },
            };
          }
        });
        setTreeData(newTreeData);
        setTreeKeys([...new Set(keys)]);
      }
    },
    [treeKeys, treeData]
  );

  const handleEdit = useCallback((row: Record<string, any>) => {
    form.setFieldValue("uid", row.uid);
    setOpen(true);
  }, []);

  const onEditFinish = () => {
    form.validateFields().then((values) => {
      const datas = [...dataSource];
      datas.forEach((data) => {
        if (data.uid === values.uid) {
          data.groupNum = values.groupNum;
        }
      });
      setDataSource(datas);
      setSelectedStudent(datas);
      setOpen(false);
    });
  };

  return (
    <>
      <div className={styles.treeTable}>
        <div className={styles.tree}>
          <Search style={{ marginBottom: 8 }} allowClear onSearch={onSearch} />
          <Spin spinning={loading}>
            <Tree
              checkable
              onCheck={onChange}
              checkedKeys={treeKeys}
              checkStrictly
              defaultExpandAll
              treeData={[{ title: "全选", key: "all", children: treeData }]}
              className={styles.treeList}
            />
          </Spin>
        </div>
        <div className={styles.actions}>
          <Upload
            {...uploadProps}
            headers={{
              Authorization: head + "" + token,
            }}
            onChange={onUploadChange}
            className={styles.import}
          >
            <Button icon={<UploadOutlined />}>导入</Button>
          </Upload>
          <img
            src={
              treeKeys.length
                ? `${BASE_PATH}/img/course/right-arrow-active.webp`
                : `${BASE_PATH}/img/course/right-arrow.webp`
            }
            className={styles.arrow}
            onClick={handleToTable}
          />
          <img
            src={
              tableKeys.length
                ? `${BASE_PATH}/img/course/left-arrow-active.webp`
                : `${BASE_PATH}/img/course/left-arrow.webp`
            }
            className={styles.arrow}
            onClick={handleToTree}
          />
        </div>
        <div className={styles.table}>
          <CustomTable
            usePagination={false}
            key={key}
            total={total}
            columns={[
              ...studentColumns,
              {
                title: "操作",
                key: "action",
                dataIndex: "action",
                render: (_: any, record: Record<string, any>) => {
                  return (
                    <>
                      <Button
                        type="link"
                        onClick={() => handleEdit(record)}
                        title="编辑"
                      >
                        <EditOutlined className={styles.icon} />
                      </Button>
                    </>
                  );
                },
              },
            ]}
            dataSource={dataSource}
            onSelectionChange={onSelectionChange}
            scroll={{ y: 500 }}
          />
        </div>
      </div>
      <Modal
        title="编辑"
        width={300}
        open={open}
        maskClosable={false}
        onCancel={() => setOpen(false)}
        onOk={onEditFinish}
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item name="uid" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="分组" name="groupNum" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default TransferTreeTable;
