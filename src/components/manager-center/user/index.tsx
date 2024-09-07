import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Tabs,
  Upload,
  message,
  Popconfirm,
  type UploadProps,
  type TabsProps,
  type PopconfirmProps,
} from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import CustomTable from "@/components/table";
import CustomButton from "@/components/button";
import {
  addStudent,
  addTeacher,
  deleteStudent,
  deleteTeacher,
  editStudent,
  editTeacher,
  getStudentList,
  getTeacherList,
} from "@/request/manager/user";
import styles from "./user.module.scss";
import { BASE_PATH } from "@/utils/globalVariable";
import { updatePasswordWithAdmin, serialExist } from "@/request/person";
type onChange = UploadProps["onChange"];

const { Search } = Input;

const items: TabsProps["items"] = [
  {
    key: "teacher",
    label: "教师",
  },
  {
    key: "student",
    label: "学生",
  },
];

interface Props {}

const teacherColumns = [
  {
    title: "姓名",
    dataIndex: "tname",
    key: "tname",
  },
  {
    title: "教师编号",
    dataIndex: "tno",
    key: "tno",
  },
  {
    title: "院系",
    dataIndex: "department",
    key: "department",
  },
  {
    title: "性别",
    dataIndex: "sex",
    key: "sex",
    render: (value: number) => {
      return <>{value === 1 ? "男" : "女"}</>;
    },
  },
  {
    title: "手机号",
    dataIndex: "phone",
    key: "phone",
  },
  {
    title: "邮箱",
    dataIndex: "email",
    key: "email",
  },
];
const token =
  typeof window !== "undefined"
    ? localStorage.getItem("education-token")
    : null;
const TeacherUploadProps: UploadProps = {
  action: `${BASE_PATH}/api/user/administrate/teacher/import`,
  method: "POST",
  name: "excelFile",
  accept: ".xlsx",
  showUploadList: false,
  headers: {
    "Oge-Edu-Roles": "administrator",
    Authorization: `Bearer ${token}`,
  },
};

const TeacherComponent = () => {
  const uid = localStorage.getItem("education-uid");
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [total, setTotal] = useState(0);
  const [pageNo, setPageNO] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [dataSource, setDataSource] = useState([]);
  const [formValue, setFormValue] = useState({
    department: "",
    fuzzyWords: "",
  });
  const [passwordUid, setPasswordUid] = useState<string>("1");

  useEffect(() => {
    queryData();
  }, [refresh]);

  const queryData = async () => {
    const bool = Object.values(formValue).some((value) => value !== "");
    setLoading(true);
    const resp = await getTeacherList({
      ...formValue,
      pageSize: pageSize,
      pageNumber: !bool ? pageNo : 1,
    });
    setDataSource(
      resp.records?.map((record: Record<string, any>) => ({
        ...record,
        key: record.uid,
      }))
    );
    setTotal(resp.total);
    setLoading(false);
  };

  const onFinish = useCallback(
    async (values?: any) => {
      if (title === "新增教师") {
        addTeacher(values)
          .then((res) => {
            message.success("新增成功！");
            setOpen(false);
            setRefresh((bool) => !bool);
          })
          .catch((error) => {
            message.error("新增失败！");
          });
      } else if (title === "编辑教师") {
        await editTeacher(values);
        message.success("编辑成功！");
        setOpen(false);
        setRefresh((bool) => !bool);
      } else {
        await updatePasswordWithAdmin({
          newPassword: values.newPassword,
          confirmNewPassword: values.confirmNewPassword,
          id: passwordUid,
        });
        message.success("修改成功！");
        setOpen(false);
        setRefresh((bool) => !bool);
      }
    },
    [title]
  );

  // 删除功能
  const confirm = (record: Record<string, any>) => {
    deleteTeacher([record.uid])
      .then((resp) => {
        message.success("删除成功！");
        setRefresh((bool) => !bool);
      })
      .catch((err) => {
        message.error("删除失败！");
      });
  };

  const cancel: PopconfirmProps["onCancel"] = (e) => {};
  const handleDelete = useCallback(async (ids: number[]) => {
    await deleteTeacher(ids);
    message.success("删除成功！");
    setRefresh((bool) => !bool);
  }, []);

  const handleAdd = useCallback(() => {
    form.resetFields();
    setTitle("新增教师");
    setOpen(true);
  }, []);

  const handleExport = useCallback(() => {
    if (!rows.length) {
      message.warning("请先选择导出项！");
      return;
    }
    const uids = rows.map((row) => row.uid);
    const querystring = uids.map((id) => `teacherIds=${id}`).join("&");
    window.open(
      `${BASE_PATH}/api/user/administrate/teacher/export?uid=${uid}&${querystring}`
    );
  }, [rows]);

  const onPageChange = useCallback((page: number, pageSize: number) => {
    setPageNO(page);
    setPageSize(pageSize);
    setRefresh((bool) => !bool);
  }, []);

  const onSelectionChange = useCallback((records: Record<string, any>[]) => {
    setRows(records);
  }, []);

  const handleEdit = useCallback((row: Record<string, any>) => {
    setTitle("编辑教师");
    setOpen(true);
    form.setFieldsValue({
      id: row?.uid,
      sex: row?.sex,
      tname: row?.tname,
      tno: row?.tno,
      email: row?.email,
      phone: row?.phone,
      department: row?.department,
    });
  }, []);

  const handlePassword = useCallback((row: Record<string, any>) => {
    setTitle("修改密码");
    setPasswordUid(row.uid);
    setOpen(true);
    form.setFieldsValue({
      tname: row?.tname,
    });
  }, []);

  const handleSearch = useCallback(async (value?: any) => {
    setFormValue({
      department: value?.department || "",
      fuzzyWords: value?.fuzzyWords || "",
    });
    setPageNO(1);
    setRefresh((bool) => !bool);
  }, []);

  const handleReset = useCallback(async () => {
    form.resetFields();
    handleSearch();
  }, []);

  const onUploadChange: onChange = useCallback(({ file }: any) => {
    if (file.status === "done") {
      message.success("上传成功！");
      setRefresh((bool) => !bool);
    } else if (file.status === "error") {
      message.error("上传失败！");
    }
  }, []);

  return (
    <div className={styles.contentBox}>
      <div className={styles.searchBox}>
        <div className={styles.btns}>
          <CustomButton
            bgColor="rgba(242, 248, 255, 1)"
            borderColor="rgba(46, 143, 255, 1)"
            style={{ marginRight: 20 }}
            onClick={handleAdd}
          >
            新增
          </CustomButton>
          <Upload
            {...TeacherUploadProps}
            onChange={onUploadChange}
            rootClassName={styles.uploadBtn}
          >
            <CustomButton
              borderColor="rgba(254, 123, 34, 1)"
              bgColor="rgba(252, 243, 237, 1)"
              style={{ marginRight: 20 }}
            >
              导入
            </CustomButton>
          </Upload>
          <CustomButton
            borderColor="rgba(3, 163, 82, 1)"
            bgColor="rgba(237, 250, 237, 1)"
            style={{ marginRight: 20 }}
            onClick={handleExport}
          >
            导出
          </CustomButton>
          <CustomButton
            borderColor="rgba(245, 71, 52, 1)"
            bgColor="rgba(252, 240, 240, 1)"
            onClick={() => handleDelete([...rows.map((row) => row.uid)])}
          >
            批量删除
          </CustomButton>
        </div>
        <div className={styles.searchInput}>
          <Form form={form} onFinish={handleSearch} layout="inline">
            <Form.Item name="department" label="院系">
              <Input style={{ width: 150 }} placeholder="请输入院系" />
            </Form.Item>
            <Form.Item name="fuzzyWords">
              <Input style={{ width: 200 }} placeholder="学号/姓名模糊查询" />
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
      </div>
      <div className={styles.tableBox}>
        <CustomTable
          loading={loading}
          total={total}
          pagination={{
            current: pageNo,
            pageSize: pageSize,
          }}
          columns={[
            ...teacherColumns,
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
                      <EditOutlined
                        style={{ color: "rgb(46, 143, 255)", fontSize: 20 }}
                      />
                    </Button>
                    <Button
                      type="link"
                      title="更改密码"
                      onClick={() => handlePassword(record)}
                    >
                      <EyeOutlined
                        style={{ color: "rgb(46, 143, 255)", fontSize: 20 }}
                      />
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
                          style={{ color: "#f10", fontSize: 20 }}
                        />
                      </Button>
                    </Popconfirm>
                  </>
                );
              },
            },
          ]}
          onPaginationChange={onPageChange}
          onSelectionChange={onSelectionChange}
          dataSource={dataSource}
          scroll={{ y: 680 }}
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
          {title === "编辑教师" ? (
            <Form.Item label="id" name="id" hidden>
              <InputNumber />
            </Form.Item>
          ) : null}
          {title !== "修改密码" ? (
            <Form.Item
              label="姓名"
              name="tname"
              rules={[
                { required: true },
                {
                  pattern: /^[a-zA-Z\u4e00-\u9fa5]+$/,
                  message: "请输入中文和英文！",
                },
              ]}
            >
              <Input style={{ width: 300 }} />
            </Form.Item>
          ) : null}
          {title === "新增教师" ? (
            <Form.Item
              label="教师编号"
              name="tno"
              rules={[
                {
                  required: true,
                  message: "请输入教师编号!",
                },
              ]}
            >
              <Input style={{ width: 300 }} />
            </Form.Item>
          ) : null}
          {title !== "修改密码" ? (
            <Form.Item
              label="院系"
              name="department"
              rules={[
                { required: true },
                {
                  pattern: /^[\u4e00-\u9fa5]+$/,
                  message: "请输入中文！",
                },
              ]}
            >
              <Input style={{ width: 300 }} />
            </Form.Item>
          ) : null}
          {title !== "修改密码" ? (
            <Form.Item label="性别" name="sex" rules={[{ required: true }]}>
              <Select
                style={{ width: 300 }}
                options={[
                  { label: "男", value: 1 },
                  { label: "女", value: 2 },
                ]}
              />
            </Form.Item>
          ) : null}
          {title === "新增教师" ? (
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true }]}
            >
              <Input.Password style={{ width: 300 }} />
            </Form.Item>
          ) : null}
          {title === "修改密码" ? (
            <>
              <Form.Item label="当前帐号" name="tname">
                <Input style={{ width: 300 }} />
              </Form.Item>
              <Form.Item label="新密码" name="newPassword">
                <Input.Password style={{ width: 300 }} />
              </Form.Item>
              <Form.Item label="确认密码" name="confirmNewPassword">
                <Input.Password style={{ width: 300 }} />
              </Form.Item>
            </>
          ) : null}
          {title === "新增教师" ? (
            <Form.Item
              label="确认密码"
              name="secondConfirmPassword"
              rules={[{ required: true }]}
            >
              <Input.Password style={{ width: 300 }} />
            </Form.Item>
          ) : null}
          {title !== "修改密码" ? (
            <Form.Item
              label="手机号"
              name="phone"
              rules={[
                {
                  required: true,
                  message: "请输入手机号！",
                },
                {
                  pattern: /^1[3-9]\d{9}$/,
                  message: "请输入有效的手机号码！",
                },
              ]}
            >
              <Input style={{ width: 300 }} />
            </Form.Item>
          ) : null}
          {title !== "修改密码" ? (
            <Form.Item
              label="电子邮箱"
              name="email"
              rules={[{ required: true }]}
            >
              <Input type="email" style={{ width: 300 }} />
            </Form.Item>
          ) : null}
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

const studentColumns = [
  {
    title: "姓名",
    dataIndex: "sname",
    key: "sname",
  },
  {
    title: "学号",
    dataIndex: "sno",
    key: "sno",
  },
  {
    title: "手机号",
    dataIndex: "phone",
    key: "phone",
  },
  {
    title: "院系",
    dataIndex: "department",
    key: "department",
  },
  {
    title: "性别",
    dataIndex: "sex",
    key: "sex",
    render: (value: number) => {
      return <>{value === 1 ? "男" : "女"}</>;
    },
  },
  {
    title: "年级",
    dataIndex: "gradeName",
    key: "gradeName",
  },
  {
    title: "班级",
    dataIndex: "className",
    key: "className",
  },
  {
    title: "邮箱",
    dataIndex: "email",
    key: "email",
  },
];

const StudentUploadProps: UploadProps = {
  action: `${BASE_PATH}/api/user/administrate/student/import`,
  method: "POST",
  name: "excelFile",
  accept: ".xlsx",
  showUploadList: false,
  headers: {
    "Oge-Edu-Roles": "administrator",
    Authorization: `Bearer ${token}`,
  },
};

const StudentComponent = () => {
  const uid = localStorage.getItem("education-uid");
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [total, setTotal] = useState(0);
  const [pageNo, setPageNO] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [dataSource, setDataSource] = useState([]);
  const [formValue, setFormValue] = useState({
    department: "",
    gradeName: "",
    className: "",
    fuzzyWords: "",
  });
  const [passwordUid, setPasswordUid] = useState<string>("1");

  useEffect(() => {
    queryData();
  }, [refresh]);

  const queryData = async () => {
    const bool = Object.values(formValue).some((value) => value !== "");
    setLoading(true);
    const resp = await getStudentList({
      ...formValue,
      pageSize: pageSize,
      pageNumber: !bool ? pageNo : 1,
    });
    setDataSource(
      resp.records?.map((record: Record<string, any>) => ({
        ...record,
        key: record.uid,
      }))
    );
    setTotal(resp.total);
    setLoading(false);
  };

  const onFinish = useCallback((values?: any) => {
    setFormValue({
      department: values?.department || "",
      gradeName: values?.gradeName || "",
      className: values?.className || "",
      fuzzyWords: values?.fuzzyWords || "",
    });
    setPageNO(1);
    setRefresh((bool) => !bool);
  }, []);

  const onUserFinish = useCallback(
    async (values: any) => {
      if (title === "新增学生") {
        addStudent(values)
          .then((res) => {
            message.success("新增成功！");
            setOpen(false);
            setRefresh((bool) => !bool);
            modalForm.resetFields();
          })
          .catch((error) => {
            message.error("新增失败！");
          });
      } else if (title === "编辑学生") {
        await editStudent(values);
        message.success("编辑成功！");
        setOpen(false);
        setRefresh((bool) => !bool);
        modalForm.resetFields();
      } else {
        await updatePasswordWithAdmin({
          newPassword: values.newPassword,
          confirmNewPassword: values.confirmNewPassword,
          id: passwordUid,
        });
        message.success("修改成功！");
        setOpen(false);
        setRefresh((bool) => !bool);
        modalForm.resetFields();
      }
    },
    [title]
  );

  const handleAdd = useCallback(() => {
    setTitle("新增学生");
    setOpen(true);
  }, []);

  const handleExport = useCallback(() => {
    if (!rows.length) {
      message.warning("请先选择导出项！");
      return;
    }
    const uids = rows.map((row) => row.uid);
    const querystring = uids.map((id) => `studentIds=${id}`).join("&");
    window.open(
      `${BASE_PATH}/api/user/administrate/student/export?uid=${uid}&${querystring}`
    );
  }, [rows]);

  const handleReset = useCallback(() => {
    form.resetFields();
    onFinish();
  }, []);

  const onPageChange = useCallback((page: number, pageSize: number) => {
    setPageNO(page);
    setPageSize(pageSize);
    setRefresh((bool) => !bool);
  }, []);

  const onSelectionChange = useCallback(
    async (records: Record<string, any>[]) => {
      setRows(records);
    },
    []
  );

  const handleEdit = useCallback((row: Record<string, any>) => {
    setTitle("编辑学生");
    setOpen(true);
    modalForm.setFieldsValue({
      sname: row?.sname,
      sno: row?.sno,
      email: row?.email,
      phone: row?.phone,
      gradeName: row?.gradeName,
      className: row?.className,
      department: row?.department,
      sex: row?.sex,
      id: row?.uid,
    });
  }, []);

  const handlePass = useCallback((row: Record<string, any>) => {
    setTitle("修改密码");
    setPasswordUid(row.uid);
    setOpen(true);
    modalForm.setFieldsValue({
      sname: row?.sname,
    });
  }, []);
  // 删除功能
  const confirm = (ids: number[]) => {
    deleteStudent(ids)
      .then((resp) => {
        message.success("删除成功！");
        setRefresh((bool) => !bool);
      })
      .catch((err) => {
        message.error("删除失败！");
      });
  };

  const cancel: PopconfirmProps["onCancel"] = (e) => {};
  const handleDelete = useCallback(async (ids: number[]) => {
    await deleteStudent(ids);
    message.success("删除成功！");
    setRefresh((bool) => !bool);
  }, []);

  const onUploadChange: onChange = useCallback(({ file }: any) => {
    if (file.status === "done") {
      message.success("上传成功！");
      setRefresh((bool) => !bool);
    } else if (file.status === "error") {
      message.error("上传失败！");
    }
  }, []);

  return (
    <div className={styles.contentBox}>
      <div className={styles.searchBox}>
        <div className={styles.btns}>
          <CustomButton
            bgColor="rgba(242, 248, 255, 1)"
            borderColor="rgba(46, 143, 255, 1)"
            style={{ marginRight: 20 }}
            onClick={handleAdd}
          >
            新增
          </CustomButton>
          <Upload
            {...StudentUploadProps}
            onChange={onUploadChange}
            rootClassName={styles.uploadBtn}
          >
            <CustomButton
              borderColor="rgba(254, 123, 34, 1)"
              bgColor="rgba(252, 243, 237, 1)"
              style={{ marginRight: 20 }}
            >
              导入
            </CustomButton>
          </Upload>
          <CustomButton
            borderColor="rgba(3, 163, 82, 1)"
            bgColor="rgba(237, 250, 237, 1)"
            style={{ marginRight: 20 }}
            onClick={handleExport}
          >
            导出
          </CustomButton>
          <CustomButton
            borderColor="rgba(245, 71, 52, 1)"
            bgColor="rgba(252, 240, 240, 1)"
            onClick={() => handleDelete([...rows.map((row) => row.uid)])}
          >
            批量删除
          </CustomButton>
        </div>
        <div className={styles.searchLine}>
          <Form form={form} onFinish={onFinish} layout="inline">
            <Form.Item name="department" label="院系">
              <Input style={{ width: 150 }} placeholder="请输入院系" />
            </Form.Item>
            <Form.Item name="gradeName" label="年级">
              <Input style={{ width: 150 }} />
            </Form.Item>
            <Form.Item name="className" label="班级">
              <Input style={{ width: 150 }} />
            </Form.Item>
            <Form.Item name="fuzzyWords">
              <Input style={{ width: 200 }} placeholder="学号/姓名模糊查询" />
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
      </div>
      <div className={styles.tableBox}>
        <CustomTable
          loading={loading}
          pagination={{
            current: pageNo,
            pageSize,
          }}
          columns={[
            ...studentColumns,
            {
              title: "操作",
              dataIndex: "action",
              key: "action",
              render: (_, record) => {
                return (
                  <>
                    <Button type="link" onClick={() => handleEdit(record)}>
                      <EditOutlined
                        style={{
                          color: "rgb(46, 143, 255)",
                          fontSize: 20,
                          marginLeft: -10,
                        }}
                      />
                    </Button>
                    <Button
                      type="link"
                      title="更改密码"
                      onClick={() => handlePass(record)}
                    >
                      <EyeOutlined
                        style={{
                          color: "rgb(46, 143, 255)",
                          fontSize: 20,
                          marginLeft: -10,
                        }}
                      />
                    </Button>
                    <Popconfirm
                      title="您确定要删除这条数据吗?"
                      description=""
                      onConfirm={() => confirm([record.uid])}
                      onCancel={cancel}
                      okText="确定"
                      cancelText="取消"
                      style={{ marginLeft: "200px" }}
                    >
                      <Button type="link">
                        <DeleteOutlined
                          style={{
                            color: "red",
                            fontSize: 20,
                            marginLeft: -10,
                          }}
                        />
                      </Button>
                    </Popconfirm>
                  </>
                );
              },
            },
          ]}
          dataSource={dataSource}
          total={total}
          scroll={{ y: 680 }}
          onPaginationChange={onPageChange}
          onSelectionChange={onSelectionChange}
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
          form={modalForm}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          onFinish={onUserFinish}
          autoComplete="false"
        >
          {title === "编辑学生" ? (
            <Form.Item label="id" name="id" hidden>
              <InputNumber />
            </Form.Item>
          ) : null}
          {title !== "修改密码" ? (
            <>
              <Form.Item
                label="姓名"
                name="sname"
                rules={[
                  {
                    required: true,
                  },
                  {
                    pattern: /^[a-zA-Z\u4e00-\u9fa5]+$/,
                    message: "请输入中文和英文！",
                  },
                ]}
              >
                <Input style={{ width: 300 }} />
              </Form.Item>
              {title === "新增学生" ? (
                <Form.Item
                  label="学号"
                  name="sno"
                  rules={[
                    {
                      required: true,
                      message: "请输入学号!",
                    },
                  ]}
                >
                  <Input style={{ width: 300 }} />
                </Form.Item>
              ) : null}
              <Form.Item
                label="院系"
                name="department"
                rules={[
                  { required: true },
                  {
                    pattern: /^[\u4e00-\u9fa5]+$/,
                    message: "请输入中文！",
                  },
                ]}
              >
                <Input style={{ width: 300 }} />
              </Form.Item>
              <Form.Item
                label="年级"
                name="gradeName"
                rules={[
                  { required: true },
                  {
                    pattern: /^[\u4e00-\u9fa5\d]+$/,
                    message: "可输入中文和数字!",
                  },
                ]}
              >
                <Input style={{ width: 300 }} />
              </Form.Item>
              <Form.Item
                label="班级"
                name="className"
                rules={[
                  { required: true },
                  {
                    pattern: /^[\u4e00-\u9fa5\d]+$/,
                    message: "可输入中文和数字！",
                  },
                ]}
              >
                <Input style={{ width: 300 }} />
              </Form.Item>
              <Form.Item label="性别" name="sex" rules={[{ required: true }]}>
                <Select
                  style={{ width: 300 }}
                  options={[
                    { label: "男", value: 1 },
                    { label: "女", value: 2 },
                  ]}
                />
              </Form.Item>
            </>
          ) : null}

          {title === "新增学生" ? (
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true }]}
            >
              <Input.Password style={{ width: 300 }} />
            </Form.Item>
          ) : null}
          {title === "新增学生" ? (
            <Form.Item
              label="确认密码"
              name="secondConfirmPassword"
              rules={[{ required: true }]}
            >
              <Input.Password style={{ width: 300 }} />
            </Form.Item>
          ) : null}
          {title === "修改密码" ? (
            <>
              <Form.Item label="当前帐号" name="sname">
                <Input style={{ width: 300 }} />
              </Form.Item>
              <Form.Item label="新密码" name="newPassword">
                <Input.Password style={{ width: 300 }} />
              </Form.Item>
              <Form.Item label="确认密码" name="confirmNewPassword">
                <Input.Password style={{ width: 300 }} />
              </Form.Item>
            </>
          ) : null}
          {/* <Form.Item label="角色" name="role">
            <Select
              options={[
                {
                  label: "学生",
                  value: "学生",
                },
              ]}
              style={{ width: 300 }}
            />
          </Form.Item> */}
          {title !== "修改密码" ? (
            <>
              <Form.Item
                label="手机号码"
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "请输入手机号！",
                  },
                  {
                    pattern: /^1[3-9]\d{9}$/,
                    message: "请输入有效的手机号码！",
                  },
                ]}
              >
                <Input style={{ width: 300 }} />
              </Form.Item>
              <Form.Item
                label="电子邮箱"
                name="email"
                rules={[{ required: true }]}
              >
                <Input type="email" style={{ width: 300 }} />
              </Form.Item>
            </>
          ) : null}

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

const tabComponent = {
  teacher: <TeacherComponent />,
  student: <StudentComponent />,
};

const Index: React.FC<Props> = () => {
  const [currentKey, setCurrentKey] = useState("teacher");
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
