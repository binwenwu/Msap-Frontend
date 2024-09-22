/*
 * @Author: xin
 * @Date: 2024-05-16 10:47:04
 * @Last Modified by: xin
 * @Last Modified time: 2024-08-26 20:45:55
 */

import { useState } from "react";
import { Input, Spin, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { BASE_PATH } from "@/utils/globalVariable";
import { buryPoint, loginWithAuth } from "@/request/user";
import { useAppDispatch } from "@/store/hook";
import { setUserInfo } from "@/store/slices/userSlice";
import { objectToQueryString } from "@/utils/common";
import { useRouter } from "next/router";
import styles from "@/styles/index.module.scss";

export default function Home() {
    const router = useRouter();
    const [loading, setLoading] = useState(false); // 控制加载动画的显示
    const [username, setUsername] = useState("17371533778"); // 存储用户输入的用户名
    const [password, setPassword] = useState("123456"); // 存储用户输入的密码
    const [tip, setTip] = useState(""); // 显示错误提示信息
    const dispatch = useAppDispatch(); // 用于分发Redux操作

    // 处理登录逻辑
    const handleSubmit = () => {
        setLoading(true); // 显示加载动画
        loginWithAuth(
            objectToQueryString({
                username,
                password,
                scopes: "web",
                client_secret: 123456,
                client_id: "test",
                grant_type: "password",
            })
        )
            .then((resp) => {
                // 成功后保存用户信息
                dispatch(
                    setUserInfo({
                        token: resp.token,
                        refreshToken: resp.refreshToken,
                        tokenHead: resp.tokenHead,
                    })
                );
                setLoading(false); // 隐藏加载动画
                message.success("登录成功！"); // 提示登录成功
                router.push("./home"); // 跳转到首页
                onBuryPoint(); // 触发埋点操作
            })
            .catch((err) => {
                setLoading(false); // 隐藏加载动画
                setTip(err); // 显示错误提示
                console.error(err);
            });
    };

    // 埋点操作
    const onBuryPoint = () => {
        buryPoint()
            .then(() => {
                console.log("埋点成功！");
            })
            .catch((err) => {
                console.error(err);
            });
    };

    return (
        <>
            <div className={styles.home}>
                <div className={styles.titleBox}>
                    <img
                        src={`${BASE_PATH}/img/home/logo.svg`}
                        alt="logo"
                        className={styles.logo}
                    />
                    <div className={styles.title}>多源模型在线分析平台</div>
                </div>
                <div className={styles.loginBox}>
                    <Spin spinning={loading}>
                        <div className={styles.title}>账号登录</div>
                        <div className={styles.form}>
                            <div className={styles.inputWrap}>
                                <Input
                                    value={username}
                                    onChange={(_) =>
                                        setUsername(_.target.value)
                                    }
                                    size="large"
                                    placeholder="请输入账号"
                                    variant="borderless"
                                    prefix={<UserOutlined />}
                                />
                            </div>
                            <div
                                className={styles.inputWrap}
                                style={{ marginBottom: 10 }}
                            >
                                <Input.Password
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleSubmit();
                                        }
                                    }}
                                    value={password}
                                    onChange={(_) =>
                                        setPassword(_.target.value)
                                    }
                                    size="large"
                                    placeholder="请输入密码"
                                    variant="borderless"
                                    prefix={<LockOutlined />}
                                />
                            </div>
                            <div className={styles.meta}>
                                <div className={styles.forget}>忘记密码</div>
                            </div>
                            <div className={styles.tip}>{tip}</div>
                        </div>
                        <div className={styles.loginBtn} onClick={handleSubmit}>
                            登录
                        </div>
                        <div className={styles.message}>
                            登录注册即表示同意
                            <span className={styles.highlight}>
                                用户协议、隐私协议
                            </span>
                        </div>
                    </Spin>
                </div>
            </div>
        </>
    );
}
