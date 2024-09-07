import React, { useCallback, useEffect, useState } from "react";
import { Button, Form, Input, Spin, message } from "antd";
import { queryAdministratorInfo, updatePassword } from "@/request/person";
import styles from "./person.module.scss";

const Index: React.FC<{}> = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const onFinish = useCallback((values: Record<string, any>) => {
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
  }, []);

  useEffect(() => {
    setLoading(true);
    queryAdministratorInfo()
      .then((resp) => {
        form.setFieldValue("username", resp.username);
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
        <Form
          form={form}
          style={{ width: 480 }}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          onFinish={onFinish}
        >
          <Form.Item label="登录账号" name="username">
            <Input className={styles.input} disabled />
          </Form.Item>
          <Form.Item label="旧密码" name="password">
            <Input.Password className={styles.input} />
          </Form.Item>
          <Form.Item label="新密码" name="newPassword">
            <Input.Password className={styles.input} />
          </Form.Item>
          <Form.Item label="确认密码" name="confirmNewPassword">
            <Input.Password className={styles.input} />
          </Form.Item>
          <Form />
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
