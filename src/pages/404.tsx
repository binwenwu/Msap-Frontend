import { useCallback } from "react";
import { BASE_PATH } from "@/utils/globalVariable";
import styles from "@/styles/404.module.scss";
import { useRouter } from "next/router";

export default () => {
  const router = useRouter();
  const handleReturn = useCallback(() => {
    // todo 主要是登录状态就回到对应的管理页面、如果是未登录就返回登录页面
    router.push("./");
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.title}>Page Not Found</div>
        <div className={styles.button} onClick={handleReturn}>
          返回主页
        </div>
      </div>
      <img src={`${BASE_PATH}/img/404/404.webp`} className={styles.img} />
    </div>
  );
};
