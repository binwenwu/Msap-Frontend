import { Button, Form, Input, Modal, TreeSelect, message } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import CustomTable from "@/components/table";
import CustomButton from "@/components/button";
import dayjs from "dayjs";
import styles from "./role.module.scss";
import {
  RoleBody,
  addRole,
  delRole,
  editRole,
  queryRoleList,
} from "@/request/manager/role";

const { Search, TextArea } = Input;

const columns = [
  {
    title: "角色名",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "角色描述",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    key: "createTime",
  },
];

const treeData = [
  {
    title: "管理员",
    value: "manager",
    key: "manager",
    children: [
      {
        title: "首页",
        value: "manager-index",
        key: "manager-index",
      },
      {
        title: "实习课程",
        value: "manager-course",
        key: "manager-course",
      },
      {
        title: "数据资源",
        value: "manager-resource",
        key: "manager-resource",
      },
      {
        title: "用户中心",
        value: "manager-user",
        key: "manager-user",
      },
      {
        title: "角色管理",
        value: "manager-role",
        key: "manager-role",
      },
      {
        title: "版本管理",
        value: "manager-version",
        key: "manager-version",
      },
      {
        title: "个人信息",
        value: "manager-person",
        key: "manager-person7",
      },
    ],
  },
  {
    title: "教师",
    value: "teacher",
    key: "teacher",
    children: [
      {
        title: "首页",
        value: "teacher-index",
        key: "teacher-index",
      },
      {
        title: "实习课程",
        value: "teacher-course",
        key: "teacher-course",
      },
      {
        title: "数据资源",
        value: "teacher-resource",
        key: "teacher-resource",
      },
      {
        title: "个人信息",
        value: "teacher-person",
        key: "teacher-person",
      },
    ],
  },
  {
    title: "学生",
    value: "student",
    key: "student",
    children: [
      {
        title: "实习任务",
        value: "student-task",
        key: "student-task",
      },
      {
        title: "个人信息",
        value: "student-person",
        key: "student-person",
      },
    ],
  },
];

const Index = () => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [total, setTotal] = useState(0);
  const [title, setTitle] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: 10,
  });
  const [dataSource, setDataSource] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    queryRoleList({
      fuzzyKey: searchValue,
      ...pagination,
    })
      .then((resp) => {
        setTotal(resp.total);
        setDataSource(
          resp.records.map((record: Record<string, any>) => ({
            ...record,
            key: record.id,
          }))
        );
        setLoading(false);
      })
      .catch((err) => {
        message.error("获取角色列表失败！");
        console.error(err);
        setLoading(false);
      });
  }, [refresh]);

  const handleAdd = useCallback(() => {
    setTitle("新增角色");
    setOpen(true);
  }, []);

  const handleEdit = useCallback((record: Record<string, any>) => {
    setTitle("编辑角色");
    setOpen(true);
    form.setFieldsValue({
      id: record.id,
      name: record.name,
      description: record.description,
      permission: record.permission.split(","),
    });
    console.log(record.permission);
  }, []);

  const handleDelete = useCallback((record: Record<string, any>) => {
    // todo
    delRole([record.id])
      .then(() => {
        message.success("删除成功！");
        setRefresh((bool) => !bool);
      })
      .catch((err) => {
        message.error("删除失败！");
        console.error(err);
      });
  }, []);

  const onFinish = useCallback(
    (values: RoleBody) => {
      if (title === "新增角色") {
        addRole({
          ...values,
          permission: String(values.permission),
        })
          .then(() => {
            message.success("新增角色成功！");
            setRefresh((bool) => !bool);
            setOpen(false);
          })
          .catch((err) => {
            message.success("新增角色失败！");
            console.error(err);
          });
      } else {
        editRole({
          ...values,
          permission: String(values.permission),
        })
          .then(() => {
            message.success("编辑角色成功！");
            setRefresh((bool) => !bool);
            setOpen(false);
          })
          .catch((err) => {
            message.success("编辑角色失败！");
            console.error(err);
          });
      }
    },
    [title]
  );

  const onSearch = useCallback((value: string) => {
    setSearchValue(value);
    setRefresh((bool) => !bool);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.searchBox}>
        <div className={styles.btns}>
          {/* <CustomButton
            bgColor="rgba(242, 248, 255, 1)"
            borderColor="rgba(46, 143, 255, 1)"
            style={{ marginRight: 20 }}
            onClick={handleAdd}
          >
            新增
          </CustomButton> */}
        </div>
        <div className={styles.searchInput}>
          <Search
            placeholder="角色名搜索"
            allowClear
            enterButton
            onSearch={onSearch}
          />
        </div>
      </div>
      <div className={styles.tableBox}>
        <CustomTable
          loading={loading}
          total={total}
          useSelection={false}
          columns={[
            ...columns,
            // {
            //   title: "操作",
            //   dataIndex: "action",
            //   key: "action",
            //   render: (_, record) => {
            //     return (
            //       <>
            //         <Button
            //           type="link"
            //           onClick={() => handleEdit(record)}
            //           title="编辑"
            //         >
            //           <EditOutlined
            //             style={{ color: "rgb(46, 143, 255)", fontSize: 20 }}
            //           />
            //         </Button>
            //         <Button
            //           type="link"
            //           title="删除"
            //           onClick={() => handleDelete(record)}
            //         >
            //           <DeleteOutlined style={{ color: "#f10", fontSize: 20 }} />
            //         </Button>
            //       </>
            //     );
            //   },
            // },
          ]}
          dataSource={dataSource}
          onPaginationChange={(page, pageSize) => {
            setPagination({ pageNum: page, pageSize });
            setRefresh((bool) => !bool);
          }}
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
        <Form
          style={{ padding: "20px 0" }}
          preserve={false}
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          onFinish={onFinish}
        >
          {title === "编辑角色" ? (
            <Form.Item label="id" name="id" hidden>
              <Input />
            </Form.Item>
          ) : null}
          <Form.Item label="角色名" name="name" rules={[{ required: true }]}>
            <Input style={{ width: 300 }} />
          </Form.Item>
          <Form.Item label="角色描述" name="description">
            <TextArea rows={8} style={{ width: 300 }} />
          </Form.Item>
          <Form.Item label="权限" name="permission">
            <TreeSelect
              treeData={treeData}
              treeCheckable
              style={{ width: 300 }}
            />
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
