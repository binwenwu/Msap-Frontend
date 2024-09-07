import React, { useEffect, useState } from "react";
import { message, DatePicker, Popover } from "antd";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { useImmer } from "use-immer";
import { CalendarTwoTone } from "@ant-design/icons";
import { BASE_PATH } from "@/utils/globalVariable";
import CustomTable from "@/components/table";
import { queryOverdueStudents } from "@/request/teacher";
import { OverAllType, overall, querySubmitTask } from "@/request/manager";
import { queryCourse } from "@/request/course";
import dayjs from "dayjs";
import styles from "./index.module.scss";

const { RangePicker } = DatePicker;
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
    title: "个人信息",
    key: "person",
    bg: `rgba(237, 250, 237, 1)`,
    icon: `${BASE_PATH}/img/teacher/index/person.webp`,
    color: `rgb(22,175,100)`,
  },
];

const nums = [
  {
    text: "教学课程（门）",
    key: "practiceNum",
    color: "rgb(46, 143, 255)",
  },
  {
    text: "我的数据（景）",
    key: "dataNum",
    color: "rgb(22, 175, 99)",
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

// 定义一个渲染函数
const renderStatus = (status: number) => {
  switch (status) {
    case 0:
      return "进行中";
    case 1:
      return "已完成";
    case 2:
      return "已逾期";
    default:
      return "未知状态";
  }
};
const columns = [
  {
    title: "实习名称",
    dataIndex: "practiceName",
    key: "practiceName",
  },
  {
    title: "院系",
    dataIndex: "department",
    key: "department",
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
    title: "学号",
    dataIndex: "sno",
    key: "sno",
  },
  {
    title: "姓名",
    dataIndex: "studentName",
    key: "studentName",
  },
  {
    title: "完成状态",
    dataIndex: "status",
    render: (status: number) => renderStatus(status),
    key: "status",
  },
  {
    title: "截止时间",
    dataIndex: "endTime",
    key: "endTime",
  },
];

interface PracticeProps {
  statistics: OverAllType;
  changeActiveKey: (key: string) => void;
}

const Practice: React.FC<PracticeProps> = ({ statistics, changeActiveKey }) => {
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
        center: [100, "50%"],
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
  const [submitOptions, updateSubmitOptions] = useImmer({
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
      data: [] as string[],
    },
    yAxis: {
      type: "value",
      min: 0, // 设置 Y 轴的最小值
      max: 100, // 设置 Y 轴的最大值
    },
    series: [
      {
        data: [] as number[],
        type: "line",
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
  });
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [total, setTotal] = useState(0);
  const [startTime, setStartTime] = useState(
    dayjs().subtract(1, "month").format("YYYY-MM-DD")
  );
  const [endTime, setEndTime] = useState(dayjs().format("YYYY-MM-DD"));
  const [courses, setCourses] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState<Record<string, any>[]>([]);
  const [pagination, setPagination] = useState({
    pageSize: 10,
    pageNumber: 1,
  });
  useEffect(() => {
    setLoading(true);
    queryOverdueStudents({
      ...pagination,
    })
      .then((resp) => {
        setTotal(resp.total);
        setDataSource(
          resp.records.map((item: Record<string, any>, index: number) => ({
            ...item,
            key: index,
          }))
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        message.error("获取实习任务列表失败！");
        setLoading(false);
      });
  }, [refresh]);

  useEffect(() => {
    querySubmitTask({
      startTime,
      endTime,
    })
      .then((resp) => {
        updateSubmitOptions((draft) => {
          draft.xAxis.data = resp
            .map((item, index) => {
              if (index % 7 === 0) {
                return item.time;
              } else {
                return "";
              }
            })
            .filter(Boolean);
          draft.series[0].data = resp
            .map((item, index) => {
              if (index % 7 === 0) {
                return item.count;
              } else {
                return null;
              }
            })
            .filter((item) => item !== null) as number[];
        });
      })
      .catch((err) => {
        message.error("获取作业提交情况失败！");
        console.error(err);
      });
  }, [startTime, endTime]);

  useEffect(() => {
    queryCourse({ status: 0 })
      .then((resp) => {
        setCourses(
          resp.records.map((record: Record<string, any>) => record.name)
        );
      })
      .catch((err) => {
        message.error("获取进行中的实习失败！");
        console.error(err);
      });
  }, []);

  return (
    <div className={styles.practice}>
      <div className={styles.header}>实习概览</div>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.task}>
            <div className={styles.cardTitle}>实习任务统计</div>
            <div className={styles.chart}>
              <ReactECharts
                option={statusOptions}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
          <div className={styles.doing}>
            <div className={styles.cardTitle}>进行中的实习</div>
            <div className={styles.chart}>
              <div className={styles.lines}>
                {courses.map((course, index) => {
                  return (
                    <div
                      className={styles.line}
                      key={index}
                      onClick={() => changeActiveKey("course")}
                    >
                      <img
                        className={styles.icon}
                        src={`${BASE_PATH}/img/teacher/index/book.webp`}
                      />
                      <div className={styles.book}>{course}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className={styles.submit}>
            <div className={styles.cardTitle}>
              作业提交情况
              <Popover
                content={
                  <RangePicker
                    onChange={(dates) => {
                      setStartTime(dates?.[0]?.format("YYYY-MM-DD")!);
                      setEndTime(dates?.[1]?.format("YYYY-MM-DD")!);
                    }}
                    disabledDate={(current) =>
                      current && current > dayjs().endOf("day")
                    }
                  />
                }
                trigger="click"
              >
                <CalendarTwoTone style={{ marginLeft: 10 }} />
              </Popover>
            </div>
            <div className={styles.chart}>
              <ReactECharts
                option={submitOptions}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.cardTitle}>
            逾期消息
            <span className={styles.tip}>（距离截止时间7天未完成）</span>
          </div>
          <div className={styles.table}>
            <CustomTable
              loading={loading}
              total={total}
              emptyHeight={100}
              pagination={{
                pageSize: pagination.pageSize,
                current: pagination.pageNumber,
              }}
              columns={columns}
              scroll={{ y: 200 }}
              dataSource={dataSource}
              useSelection={false}
              onPaginationChange={(page, pageSize) => {
                setPagination({
                  pageSize,
                  pageNumber: page,
                });
                setRefresh((bool) => !bool);
              }}
            />
          </div>
        </div>
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

  return (
    <div className={styles.container}>
      <div className={styles.line}>
        <Population statistics={statistics} />
        <Quicker changeActiveKey={changeActiveKey} />
      </div>
      <Practice statistics={statistics} changeActiveKey={changeActiveKey} />
    </div>
  );
};

export default Index;
