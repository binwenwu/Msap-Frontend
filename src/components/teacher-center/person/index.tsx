import React, { useCallback, useEffect, useState } from "react";
import { Button, Form, Input, InputNumber, Spin, Tabs, message } from "antd";
import { queryTeacherInfo, updateInfo, updatePassword } from "@/request/person";
import { useAppSelector } from "@/store/hook";
import styles from "./person.module.scss";

const Index: React.FC<{}> = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("base");
  const onFinish = useCallback((values: Record<string, any>) => {
    if (tab === "base") {
      setLoading(true);
      updateInfo({
        phone: values.phone,
        email: values.email,
      })
        .then((resp) => {
          message.success("修改成功！");
          setLoading(false);
        })
        .catch((err) => {
          message.error("修改失败！");
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(true);
      updatePassword({
        password: values.password,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      })
        .then((resp) => {
          message.success("修改成功！");
          setLoading(false);
        })
        .catch((err) => {
          message.error("修改失败！");
          console.error(err);
          setLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    queryTeacherInfo()
      .then((resp) => {
        form.setFieldValue("username", resp.username);
        form.setFieldValue("department", resp.department);
        form.setFieldValue("tname", resp.tname);
        form.setFieldValue("phone", resp.phone);
        form.setFieldValue("email", resp.email);
        setLoading(false);
      })
      .catch((err) => {
        message.error("账号信息获取失败！");
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.container}>
      <Spin spinning={loading}>
        <Tabs
          items={[
            { label: "基础信息", key: "base" },
            { label: "密码", key: "password" },
          ]}
          onChange={(key) => setTab(key)}
        />
        <Form
          form={form}
          style={{ width: 480 }}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          onFinish={onFinish}
        >
          {tab === "base" ? (
            <>
              <Form.Item label="登录账号" name="username">
                <Input className={styles.input} disabled />
              </Form.Item>
              <Form.Item label="姓名" name="tname">
                <Input className={styles.input} disabled />
              </Form.Item>
              <Form.Item label="所属院系" name="department">
                <Input className={styles.input} disabled />
              </Form.Item>
              <Form.Item label="手机号码" name="phone">
                <InputNumber className={styles.input} />
              </Form.Item>
              <Form.Item label="电子邮箱" name="email">
                <Input type="email" className={styles.input} />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item label="旧密码" name="password">
                <Input.Password className={styles.input} />
              </Form.Item>
              <Form.Item label="新密码" name="newPassword">
                <Input.Password className={styles.input} />
              </Form.Item>
              <Form.Item label="确认密码" name="confirmNewPassword">
                <Input.Password className={styles.input} />
              </Form.Item>
            </>
          )}
          <div className={styles.btns}>
            <Button type="primary" htmlType="submit">
              修改
            </Button>
          </div>
        </Form>
      </Spin>
    </div>
  );
};

export default Index;
