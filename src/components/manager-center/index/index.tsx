import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { BASE_PATH } from "@/utils/globalVariable";
import {
  CategorySource,
  DailySource,
  OverAllType,
  overall,
  queryCategory,
  queryDailyActive,
} from "@/request/manager";
import { message } from "antd";
import dayjs from "dayjs";
import styles from "./index.module.scss";

interface IndexProps {
  changeActiveKey: (key: string) => void;
}

const links = [
  {
    title: "实习课程",
    key: "course",
    bg: `rgba(242, 246, 255, 1)`,
    icon: `${BASE_PATH}/img/teacher/index/course.webp`,
    color: `rgb(73,140,255)`,
  },
  {
    title: "数据资源",
    key: "resource",
    bg: `rgba(252, 243, 237, 1)`,
    icon: `${BASE_PATH}/img/teacher/index/resource.webp`,
    color: `rgb(253,140,63)`,
  },
  {
    title: "用户中心",
    key: "user",
    bg: `rgba(245, 240, 255, 1)`,
    icon: `${BASE_PATH}/img/teacher/index/user.webp`,
    color: `rgb(145,88,255)`,
  },
  {
    title: "角色管理",
    key: "role",
    bg: "rgba(237, 246, 255, 1)",
    icon: `${BASE_PATH}/img/teacher/index/role.webp`,
    color: `rgb(73,140,255)`,
  },
  {
    title: "版本管理",
    key: "version",
    bg: "rgba(252, 243, 241, 1)",
    icon: `${BASE_PATH}/img/teacher/index/version.webp`,
    color: `rgb(247,130,110)`,
  },
  {
    title: "个人信息",
    key: "person",
    bg: `rgba(237, 250, 237, 1)`,
    icon: `${BASE_PATH}/img/teacher/index/person.webp`,
    color: `rgb(20,175,100)`,
  },
];

const nums = [
  {
    text: "教学课程（门）",
    key: "practiceNum",
    color: "rgba(42, 130, 228, 1)",
  },
  {
    text: "我的数据（景）",
    key: "dataNum",
    color: "rgba(42, 209, 156, 1)",
  },
  {
    text: "我的用户（人）",
    key: "userTotal",
    color: "rgba(254, 136, 54, 1)",
  },
];

const Population = ({ statistics }: { statistics: OverAllType }) => {
  return (
    <div className={styles.population}>
      <div className={styles.header}>总体概览</div>
      <div className={styles.content}>
        {nums.map((num, index) => {
          return (
            <div className={styles.countBox} key={index}>
              <div className={styles.count} style={{ color: num.color }}>
                {statistics[num.key]}
              </div>
              <div className={styles.text}>{num.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface QuickerProps extends IndexProps {}
const Quicker: React.FC<QuickerProps> = ({ changeActiveKey }) => {
  return (
    <div className={styles.quicker}>
      <div className={styles.header}>快捷入口</div>
      <div className={styles.content}>
        {links.map((link) => {
          return (
            <div
              className={styles.link}
              key={link.title}
              style={{ backgroundColor: link.bg }}
              onClick={() => changeActiveKey(link.key)}
            >
              <img src={link.icon} alt={link.title} className={styles.icon} />
              <div className={styles.text} style={{ color: link.color }}>
                {link.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TaskStatistics = ({
  statistics,
  categorys,
}: {
  statistics: OverAllType;
  categorys: CategorySource[];
}) => {
  const cateOptions: echarts.EChartsOption = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      top: "5%",
      left: "right",
      right: 10,
      orient: "vertical",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        center: [120, "50%"],
        label: {
          show: false,
          position: "center",
        },
        data: categorys.map((category) => ({
          name: category.category,
          value: category.count,
        })),
      },
    ],
  };
  const statusOptions: echarts.EChartsOption = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      top: "5%",
      left: "right",
      right: 10,
      orient: "vertical",
    },
    color: ["rgba(42, 209, 156, 1)", "rgba(254, 136, 54, 1)"],
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        center: [120, "50%"],
        label: {
          show: false,
          position: "center",
        },
        data: [
          { value: statistics.completedPractice, name: "已完成" },
          { value: statistics.runningPractice, name: "进行中" },
        ],
      },
    ],
  };
  return (
    <div className={styles.statistics}>
      <div className={styles.header}>实习概览</div>
      <div className={styles.content}>
        <div className={styles.cate}>
          <div className={styles.cardTitle}>实习类别</div>
          <div className={styles.chart}>
            <ReactECharts option={cateOptions} />
          </div>
        </div>
        <div className={styles.status}>
          <div className={styles.cardTitle}>实习状态</div>
          <div className={styles.chart}>
            <ReactECharts option={statusOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

const MonthlyActivity = ({ dailys }: { dailys: DailySource[] }) => {
  const dailyOptions: echarts.EChartsOption = {
    grid: {
      left: 50,
      right: 50,
      bottom: 100,
    },
    tooltip: {
      trigger: "item",
    },
    xAxis: {
      type: "category",
      axisLine: {
        lineStyle: {
          color: "rgb(166,166,166)", // 红色
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: "rgb(166,166,166)", // 标签颜色
        rotate: 45, // 标签倾斜 45 度
        interval: 0, // 显示所有标签
      },
      data: dailys.map((daily) => daily.date),
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: dailys.map((daily) => daily.activeUsersCount),
        type: "line",
        smooth: true,
        lineStyle: {
          color: "rgba(115, 204, 198, 1)",
        },
        itemStyle: {
          color: "rgba(115, 204, 198, 1)",
        },
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: "rgba(115, 204, 198, 1)",
            },
            {
              offset: 1,
              color: "rgba(0, 241, 195, 0)",
            },
          ]),
        },
      },
    ],
  };

  return (
    <div className={styles.activity}>
      <div className={styles.header}>月活人数</div>
      <div className={styles.content}>
        <ReactECharts option={dailyOptions} style={{ height: "100%" }} />
      </div>
    </div>
  );
};

const Index: React.FC<IndexProps> = ({ changeActiveKey }) => {
  const [statistics, setStatistics] = useState<OverAllType>({
    completedPractice: 0,
    dataNum: 0,
    practiceNum: 0,
    runningPractice: 0,
    userTotal: 0,
  });
  const [dailys, setDaily] = useState<DailySource[]>([]);
  const [categorys, setCategorys] = useState<CategorySource[]>([]);
  useEffect(() => {
    overall()
      .then((resp) => {
        setStatistics(resp);
      })
      .catch((err) => {
        message.error("获取数据失败！");
        console.error(err);
      });
  }, []);

  useEffect(() => {
    queryDailyActive({ deadlineTime: dayjs().format("YYYY-MM-DD") })
      .then((resp) => {
        setDaily(resp);
      })
      .catch((err) => {
        message.error("获取月活人数失败！");
        console.error(err);
      });
  }, []);

  useEffect(() => {
    queryCategory()
      .then((resp) => {
        setCategorys(resp);
      })
      .catch((err) => {
        message.error("获取实习类别失败！");
        console.error(err);
      });
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.line}>
        <Population statistics={statistics} />
        <Quicker changeActiveKey={changeActiveKey} />
      </div>
      <div className={styles.bottom}>
        <TaskStatistics statistics={statistics} categorys={categorys} />
        <MonthlyActivity dailys={dailys} />
      </div>
    </div>
  );
};

export default Index;
