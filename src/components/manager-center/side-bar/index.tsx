import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "antd";
import type { MenuProps } from "antd";
import { useAppDispatch } from "@/store/hook";
import { BASE_PATH } from "@/utils/globalVariable";
import { emptyUserInfo, setUserInfo } from "@/store/slices/userSlice";
import { queryAdministratorInfo } from "@/request/person";
import styles from "./sideBar.module.scss";

interface Props {
  activeKey: string;
  changeActiveKeys: (activeKey: string) => void;
}

const SideBar: React.FC<Props> = ({ changeActiveKeys, activeKey }) => {
  const dispatch = useAppDispatch();
  type MenuItem = Required<MenuProps>["items"][number];

  const items: MenuItem[] = [
    getItem(
      "首页",
      "index",
      <img src={`${BASE_PATH}/icons/home.webp`} style={{ width: 20 }} />
    ),
    getItem(
      "实习课程",
      "course",
      <img src={`${BASE_PATH}/icons/course.webp`} style={{ width: 20 }} />
    ),
    getItem(
      "数据资源",
      "resource",
      <img src={`${BASE_PATH}/icons/data.webp`} style={{ width: 20 }} />
    ),
    getItem(
      "用户中心",
      "user",
      <img src={`${BASE_PATH}/icons/user.webp`} style={{ width: 20 }} />
    ),
    getItem(
      "角色管理",
      "role",
      <img src={`${BASE_PATH}/icons/role.webp`} style={{ width: 20 }} />
    ),
    getItem(
      "版本管理",
      "version",
      <img src={`${BASE_PATH}/icons/version.webp`} style={{ width: 20 }} />
    ),
    getItem(
      "个人信息",
      "person",
      <img src={`${BASE_PATH}/icons/person.webp`} style={{ width: 20 }} />
    ),
  ];

  const [username, setUsername] = useState("");
  const [menuList, setMenuList] = useState<MenuItem[]>([]);

  function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: "group"
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      type,
    };
  }

  useEffect(() => {
    queryAdministratorInfo()
      .then((resp) => {
        dispatch(
          setUserInfo({
            uid: resp.id,
            username: resp.username,
          })
        );
        setUsername(resp.username);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    getMenuList();
  }, []);

  function getMenuList() {
    setMenuList(items);
  }
  const onClick: MenuProps["onClick"] = (e) => {
    changeActiveKeys(e.key);
  };

  const handleLogout = () => {
    dispatch(emptyUserInfo());
  };

  return (
    <div className={styles.sideBar}>
      <div className={styles.userBox}>
        <div className={styles.avator}>
          <img src={`${BASE_PATH}/img/person/manager-avator.webp`} alt="头像" />
        </div>
        <div className={styles.username}>{username}</div>
        <Link href="./" className={styles.logout} onClick={handleLogout}>
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
          >
            <path
              d="M1024 512l-448 384v-256H320V384h256V128l448 384z"
              fill="#A5B5CE"
            />
            <path d="M64 960V64h320v128H192v640h192v128H64z" fill="#A5B5CE" />
          </svg>
          <span className={styles.text}>退出登录</span>
        </Link>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[activeKey]}
        onClick={onClick}
        style={{ width: 272 }}
        items={menuList}
        rootClassName={styles.menu}
      />
    </div>
  );
};

export default SideBar;
