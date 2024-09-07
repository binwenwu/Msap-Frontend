import {
  Input,
  Modal,
  Pagination,
  Form,
  Button,
  Progress,
  Tabs,
  type TabsProps,
  Select,
  message,
  Spin,
  InputNumber,
  Empty,
  Checkbox,
  Popconfirm,
} from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BASE_PATH } from "@/utils/globalVariable";
import CustomButton from "@/components/button";
import {
  CheckSquareOutlined,
  DeleteOutlined,
  EditOutlined,
  MinusSquareOutlined,
} from "@ant-design/icons";
import CustomTable from "@/components/table";
import * as echarts from "echarts";
import ReactECharts from "echarts-for-react";
import styles from "./history.module.scss";
import {
  endOfCourse,
  evaluateScore,
  queryCourse,
  queryCourseStudents,
  queryResultDetail,
  queryScoreDetail,
  queryScoreList,
  queryScoreOverview,
} from "@/request/course";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { parseJSON } from "@/utils/common";
import { conversionPath } from "@/request/operators";

const { Search, TextArea } = Input;

const items: TabsProps["items"] = [
  {
    key: "1",
    label: "已完成",
    icon: <CheckSquareOutlined />,
  },
  {
    key: "0",
    label: "未完成",
    icon: <MinusSquareOutlined />,
  },
];

interface RateProps {
  course: Record<string, any>;
  studentRateRow: Record<string, any>;
  flag: boolean;
}
const RateComponent: React.FC<RateProps> = ({
  course,
  studentRateRow,
  flag,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [resultLoading, setResultLoading] = useState(false);
  const [status, setStatus] = useState(1);
  const [score, setScore] = useState<Record<string, any>>({});
  const [percentage, setPercentage] = useState({
    doneCount: 0,
    unDoneCount: 0,
    allCount: 0,
  });
  const [studentId, setStudentId] = useState("");
  const [students, setStudents] = useState<Record<string, any>[]>([]);
  const [reports, setReports] = useState<Record<string, any>[]>([]);
  const [results, setResults] = useState<Record<string, any>[]>([]);
  const rates = JSON.parse(course.gradeCriterionJson) as Record<string, any>[];

  const onFinish = useCallback(
    (values: Record<string, any>) => {
      const student = students.find((s) => s.sno === studentId);
      const scoringItems = rates.map((rate) => ({
        ...rate,
        value: values?.[rate.key],
      }));
      evaluateScore({
        practiceInstanceId: course.id,
        sno: studentId,
        scoringItemsJson: JSON.stringify(scoringItems),
        studentName: student?.studentName || "",
        gradeName: student?.gradeName || "",
        className: student?.className || "",
        status: 1,
      })
        .then((resp) => {
          message.success("评分成功！");
        })
        .catch((err) => {
          console.error(err);
          message.error("评分失败！");
        });
    },
    [students, studentId]
  );

  const onTabChange = useCallback((key: string) => {
    setStatus(Number(key));
    setStudentId("");
  }, []);

  useEffect(() => {
    setLoading(true);
    setReports([]);
    setResults([]);
    form.resetFields();
    queryCourseStudents({
      status,
      practiceInstanceId: course.id,
    })
      .then((resp) => {
        const key =
          status === 1
            ? "practiceStudentsCompleted"
            : "practiceStudentsRunning";
        setStudents(
          resp[key].map((item: Record<string, any>) => ({
            ...item,
            key: item.sno,
          }))
        );
        setPercentage({
          doneCount: resp.completedNum,
          unDoneCount: resp.runningNum,
          allCount: resp.total,
        });
        setLoading(false);
      })
      .catch((err) => {
        message.error("获取学生列表失败！");
        console.error(err);
        setLoading(false);
      });
  }, [status]);

  useEffect(() => {
    if (!studentId) return;
    setResultLoading(true);
    form.resetFields();
    queryResultDetail({
      practiceInstanceId: course.id,
      sno: studentId,
    })
      .then((resp) => {
        // todo 展示成果数据
        setReports(resp?.practiceReports || []);
        setResults(resp?.practiceTaskResults || []);
        setResultLoading(false);
      })
      .catch((err) => {
        message.error("获取学生成果数据失败！");
        console.error(err);
        setResultLoading(false);
      });
    queryScoreDetail({
      practiceInstanceId: course.id,
      sno: studentId,
    })
      .then((resp) => {
        try {
          const json =
            resp?.scoringItemsJson && JSON.parse(resp.scoringItemsJson);
          if (!json) return;
          const rateKey = Object.keys(form.getFieldsValue());

          rateKey.forEach((key) => {
            const value = json.find(
              (item: Record<string, any>) => item.key === key
            )?.value;
            form.setFieldValue(key, value);
          });
        } catch (err) {
          console.error(err);
        }
      })
      .catch((err) => {
        message.error("获取学生成绩数据失败！");
        console.error(err);
      });
  }, [studentId]);

  const handlePreview = (row: Record<string, any>) => {
    window.open(
      `http://openge.org.cn/gateway/resource/preview/path?resourcePath=${row.filePath}`
    );
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.rateContainer}>
        <div className={styles.progressContaienr}>
          <div className={styles.progressLine}>
            <div className={[styles.status, styles.done].join(" ")}>已完成</div>
            <div className={styles.count}>{percentage.doneCount}</div>
            <div className={styles.progressBar}>
              <Progress
                success={{
                  percent: (percentage.doneCount / percentage.allCount) * 100,
                }}
                showInfo={false}
              />
            </div>
            <div className={styles.percentage}>
              {(percentage.doneCount / percentage.allCount) * 100}%
            </div>
          </div>
          <div className={styles.progressLine}>
            <div className={[styles.status, styles.unDone].join(" ")}>
              未完成
            </div>
            <div className={styles.count}>{percentage.unDoneCount}</div>
            <div className={styles.progressBar}>
              <Progress
                percent={(percentage.unDoneCount / percentage.allCount) * 100}
                strokeColor="rgb(166, 166, 166)"
                showInfo={false}
              />
            </div>
            <div className={styles.percentage}>
              {(percentage.unDoneCount / percentage.allCount) * 100}%
            </div>
          </div>
        </div>
        <Tabs items={items} onChange={onTabChange} />
        <div className={styles.resultContainer}>
          <div className={styles.studentBox}>
            <div className={styles.title}>学生列表</div>
            <div className={styles.studentLine}>
              {students.map((student, index) => {
                return (
                  <div
                    className={[
                      styles.studentId,
                      student.sno === studentId ? styles.active : "",
                    ].join(" ")}
                    key={index}
                    onClick={() => setStudentId(student.sno)}
                  >
                    {student.sno}
                  </div>
                );
              })}
            </div>
          </div>
          <div className={styles.resultBox}>
            <div className={styles.title}>成果列表</div>
            <Spin spinning={resultLoading} wrapperClassName={styles.spin}>
              <div className={styles.resultList}>
                <div className={styles.cate}>成果报告</div>
                <div className={styles.list}>
                  {reports.map((report) => {
                    const path = parseJSON(report.path);
                    return (
                      <div
                        className={styles.link}
                        onClick={() => handlePreview(path?.[0])}
                      >
                        {report.reportName}
                      </div>
                    );
                  })}
                </div>
                <div className={styles.cate}>计算结果文件</div>
                <div className={[styles.list, styles.operators].join(" ")}>
                  {results.map((result) => {
                    const path = parseJSON(result.path);
                    return (
                      <div
                        className={styles.link}
                        onClick={() => handlePreview(path?.[0])}
                      >
                        {path?.[0]?.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Spin>
          </div>
        </div>
        <div className={styles.rateLine}>
          <Form form={form} onFinish={onFinish} layout="inline">
            {rates.map((rate) => {
              return (
                <Form.Item
                  key={rate.key}
                  label={rate.key}
                  name={rate.key}
                  style={{ marginBottom: 0, lineHeight: "36px" }}
                  rules={[{ required: true }]}
                >
                  <InputNumber style={{ width: 100 }} min={0} max={100} />
                </Form.Item>
              );
            })}
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form>
        </div>
      </div>
    </Spin>
  );
};

interface GradeProps {
  course: Record<string, any>;
}

const columns = [
  {
    title: "实习名称",
    dataIndex: "practiceInstanceName",
    key: "practiceInstanceName",
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
    width: 200,
  },
  {
    title: "姓名",
    dataIndex: "studentName",
    key: "studentName",
  },
  {
    title: "完成状态",
    dataIndex: "status",
    key: "status",
    render: (status: number) => {
      return <span>{status === 0 ? "已完成" : "未完成"}</span>;
    },
  },
  {
    title: "成绩",
    dataIndex: "score",
    key: "score",
  },
];

const GradeComponent: React.FC<GradeProps> = ({ course }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [total, setTotal] = useState(0);
  const [dataSource, setDataSource] = useState<Record<string, any>[]>([]);
  const [pagination, setPagination] = useState({
    pageSize: 10,
    current: 1,
  });

  // const [options1, setOptions1] = useState({
  //   tooltip: {
  //     trigger: "axis",
  //   },
  //   xAxis: {
  //     type: "category",
  //     axisLine: {
  //       lineStyle: {
  //         color: "rgb(166,166,166)", // 红色
  //       },
  //     },
  //     axisTick: {
  //       show: false,
  //     },
  //     axisLabel: {
  //       color: "rgb(166,166,166)", // 标签颜色
  //     },
  //     data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  //   },
  //   yAxis: [
  //     {
  //       name: "count",
  //       type: "value",
  //     },
  //   ],
  //   series: [
  //     {
  //       name: "count",
  //       data: [820, 932, 901, 934, 1290, 1330, 1320],
  //       type: "line",
  //       lineStyle: {
  //         color: "rgba(115, 204, 198, 1)",
  //       },
  //       itemStyle: {
  //         color: "rgba(115, 204, 198, 1)",
  //       },
  //       areaStyle: {
  //         opacity: 0.8,
  //         color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
  //           {
  //             offset: 0,
  //             color: "rgba(115, 204, 198, 1)",
  //           },
  //           {
  //             offset: 1,
  //             color: "rgba(0, 241, 195, 0)",
  //           },
  //         ]),
  //       },
  //     },
  //   ],
  // });

  const NormalDistributionChartRef = useRef<any>();

  const [scores, setScores] = useState<number[]>([]);

  function generateIntervalLabels(start: number, end: number, step: number) {
    const labels = [];
    for (let i = start; i <= end - step; i += step) {
      // 计算区间的上限，确保不会超过end值
      const upperBound = Math.min(i + step, end);
      // 将区间标签添加到数组中
      labels.push(`${i}-${upperBound}`);
    }
    return labels;
  }

  function generateBins(start: number, end: number, step: number) {
    const sequence = [];
    for (let i = 0; i < end; i++) {
      sequence.push(start + i * step);
    }
    return sequence;
  }

  useEffect(() => {
    if (scores.length > 0) {
      const newOptions = {
        ...options1,
        series: [
          {
            ...options1.series[0],
            data: calculateDistribution(scores),
          },
        ],
      };
      setOptions1(newOptions);
    }
  }, [scores]); // 依赖数组包含scores

  const calculateDistribution = (scores: number[]) => {
    // 这里需要自定义转换逻辑，例如，你可以将成绩分为几个区间，并计算每个区间的频率
    // 假设bins是分数区间的边界值数组
    // const bins = [0, 40, 50, 60, 70, 80, 90, 100];
    const bins = generateBins(0, 100, 5);
    const frequency = bins.reduce((acc: number[], bin, index) => {
      if (index === bins.length - 1) return acc;
      const count: number = scores.filter(
        (score: number) => score > bin && score <= bins[index + 1]
      ).length;
      acc.push(count);
      return acc;
    }, []);
    return frequency;
  };

  const [options1, setOptions1] = useState({
    tooltip: {},
    xAxis: {
      // data: ['0-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100']
      data: generateIntervalLabels(0, 100, 5),
    },
    yAxis: {},
    series: [
      {
        name: "频率",
        type: "bar",
        data: calculateDistribution(scores),
      },
    ],
  });

  const pieChartRef = useRef<any>();

  const [options2, setOptions2] = useState({
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
        label: {
          show: false,
          position: "center",
        },
        data: [
          { value: 1048, name: "及格" },
          { value: 735, name: "未及格" },
        ],
      },
    ],
  });

  useEffect(() => {
    queryScoreOverview(course.id)
      .then((resp) => {
        setScores(resp.scoreList);
        options2.series[0].data = [
          { value: resp.passNum, name: "及格" },
          { value: resp.failNum, name: "未及格" },
        ];
        pieChartRef.current.getEchartsInstance().setOption(options2);
      })
      .catch((err) => {
        console.error(err);
        message.error("获取总览数据失败！");
      });
  }, [refresh]);

  useEffect(() => {
    setLoading(true);
    queryScoreList({
      ...form.getFieldsValue(),
      practiceInstanceId: course.id,
      pageSize: pagination.pageSize,
      pageNumber: pagination.current,
    })
      .then((resp) => {
        setTotal(resp.total);
        setDataSource(
          resp.records.map((item: Record<string, any>) => ({
            ...item,
            key: item.sno,
          }))
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error("err");
        message.error("获取成绩列表失败！");
        setLoading(false);
      });
  }, [refresh]);

  const onFinish = useCallback((values: any) => {
    setRefresh((bool) => !bool);
  }, []);
  const [studentRateRow, setStudentRateRow] = useState({});
  const [studentRateCourse, setStudentRateCourse] = useState(course);
  const [studentRateOpen, setStudentRateOpen] = useState(false);
  const handleEdit = useCallback((_: any, record: Record<string, any>) => {
    setStudentRateOpen(true);
  }, []);
  const handleDelete = useCallback((record: Record<string, any>) => {}, []);

  const handleReset = useCallback(() => {
    form.resetFields();
    setRefresh((bool) => !bool);
  }, []);

  return (
    <div className={styles.content}>
      <div className={styles.top}>
        <div className={styles.submit}>
          <div className={styles.cardTitle}>学生成绩正态分布</div>
          <div className={styles.chart}>
            <ReactECharts
              ref={NormalDistributionChartRef}
              style={{ width: "1000px", height: "260px" }}
              option={options1}
              // notMerge={true}
              // lazyUpdate={false}
            />
          </div>
        </div>
        <div className={styles.task}>
          <div className={styles.cardTitle}>及格率</div>
          <div className={styles.chart}>
            <ReactECharts
              ref={pieChartRef}
              style={{ width: "250px", height: "260px" }}
              option={options2}
              // notMerge={true}
              // lazyUpdate={false}
            />
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.cardTitle}>成绩列表</div>
        <div className={styles.searchLine}>
          <Form form={form} onFinish={onFinish} layout="inline">
            <Form.Item name="department" label="院系">
              <Input />
            </Form.Item>
            <Form.Item name="gradeName" label="年级">
              <Input />
            </Form.Item>
            <Form.Item name="className" label="班级">
              <Input />
            </Form.Item>
            <Form.Item name="searchKey">
              <Input placeholder="学号/姓名" />
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
        <div className={styles.table}>
          <CustomTable
            size="small"
            useSelection={false}
            loading={loading}
            total={total}
            columns={[
              ...columns,
              {
                title: "操作",
                dataIndex: "action",
                key: "action",
                render: (_: any, record: Record<string, any>) => {
                  return (
                    <>
                      <Button type="link" onClick={() => handleEdit(_, record)}>
                        <EditOutlined
                          style={{ color: "rgb(46, 143, 255)", fontSize: 20 }}
                        />
                      </Button>
                      <Modal
                        title="评分"
                        maskClosable={false}
                        width={810}
                        open={studentRateOpen}
                        onOk={() => setStudentRateOpen(true)}
                        onCancel={() => setStudentRateOpen(false)}
                        destroyOnClose
                      >
                        <RateComponent
                          course={studentRateCourse}
                          studentRateRow={record}
                          flag
                        />
                      </Modal>
                    </>
                  );
                },
              },
            ]}
            emptyHeight={200}
            scroll={{ y: 170 }}
            dataSource={dataSource}
          />
        </div>
      </div>
    </div>
  );
};

const HistoryCourse = () => {
  const [form] = Form.useForm();
  const [endCourseOpen, setEndCourseOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [gradeOpen, setGradeOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState(0);
  const [praticeIds, setPraticeIds] = useState<number[]>([]);
  const [row, setRow] = useState<Record<string, any>>({});
  const [coursePagination, setCoursePagination] = useState({
    pageSize: 8,
    current: 1,
  });
  const [searchValue, setSearchValue] = useState("");
  const [dataSource, setDataSource] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    setLoading(true);
    queryCourse({
      status,
      name: searchValue,
      pageSize: coursePagination.pageSize,
      pageNumber: coursePagination.current,
    })
      .then((resp) => {
        setLoading(false);
        if (!resp) return;
        setTotal(resp.total);
        setDataSource(
          resp.records?.map((record: Record<string, any>) => ({
            ...record,
            key: record.id,
          }))
        );
      })
      .catch((err) => {
        message.error("课程信息获取失败！");
        setDataSource([]);
        console.error(err);
        setLoading(false);
      });
  }, [refresh, status, searchValue, coursePagination]);

  const onSearch = useCallback((value: string) => {
    setSearchValue(value);
    setRefresh((bool) => !bool);
  }, []);

  const onSelectCourse = useCallback((e: CheckboxChangeEvent, id: number) => {
    if (e.target.checked) {
      setPraticeIds([...praticeIds, id]);
    } else {
      setPraticeIds(praticeIds.filter((pid) => pid !== id));
    }
  }, []);

  const onEndCourseFinish = useCallback(
    (values: any) => {
      endOfCourse({
        practiceInstance: {
          endTag: 1,
          id: row.id,
          summary: values.comment,
        },
      })
        .then((resp) => {
          message.success("结课成功！");
          setEndCourseOpen(false);
          setRefresh((bool) => !bool);
        })
        .catch((err) => {
          message.error("结课失败！");
          console.error(err);
        });
    },
    [row]
  );

  const onActiveConfirm = useCallback((row: Record<string, any>) => {
    endOfCourse({
      practiceInstance: {
        endTag: 0,
        id: row.id,
        summary: "",
      },
    })
      .then((resp) => {
        message.success("激活成功！");
        setEndCourseOpen(false);
        setRefresh((bool) => !bool);
      })
      .catch((err) => {
        message.error("激活失败！");
        console.error(err);
      });
  }, []);

  const handleExportScore = useCallback(() => {
    const querystring = praticeIds
      .map((id) => `practiceInstanceIds=${id}`)
      .join("&");
    if (querystring) {
      window.open(`${BASE_PATH}/api/internship/evaluate/export?${querystring}`);
    } else {
      message.warning("请选择须导出课程！");
    }
  }, [praticeIds]);

  return (
    <div className={styles.contentBox}>
      <div className={styles.searchBox}>
        {status === 1 ? (
          <div className={styles.btns}>
            <CustomButton
              borderColor="rgba(0, 186, 173, 1)"
              bgColor="rgba(237, 255, 254, 1)"
              style={{ marginRight: 20 }}
            >
              导出作业
            </CustomButton>
            <CustomButton
              borderColor="rgba(58, 37, 217, 1)"
              bgColor="rgba(252, 240, 240, 1)"
              onClick={handleExportScore}
            >
              导出成绩
            </CustomButton>
          </div>
        ) : (
          <div className={styles.btns} />
        )}
        <div className={styles.status}>
          <CustomButton
            onClick={() => setStatus(0)}
            borderColor="transparent"
            bgColor="transparent"
            style={
              status === 0
                ? {
                    borderColor: "rgba(46, 143, 255, 1)",
                    backgroundColor: "rgba(46, 143, 255, 1)",
                    color: "#fff",
                    padding: "5px 5px",
                  }
                : { color: "rgba(56, 56, 56, 1)", padding: "5px 5px" }
            }
          >
            进行中
          </CustomButton>
          <CustomButton
            onClick={() => setStatus(1)}
            borderColor="transparent"
            bgColor="transparent"
            style={
              status === 1
                ? {
                    borderColor: "rgba(46, 143, 255, 1)",
                    backgroundColor: "rgba(46, 143, 255, 1)",
                    color: "#fff",
                    padding: "5px 5px",
                  }
                : { color: "rgba(56, 56, 56, 1)", padding: "5px 5px" }
            }
          >
            已结课
          </CustomButton>
        </div>
        <div className={styles.searchInput}>
          <Search
            placeholder="课程名称搜索"
            allowClear
            enterButton
            onSearch={onSearch}
          />
        </div>
      </div>
      <Spin spinning={loading}>
        <div className={styles.tableBox}>
          {dataSource.length > 0 ? (
            dataSource.map((course) => {
              return (
                <div className={styles.courseBlock} key={course.key}>
                  {status === 1 ? (
                    <Checkbox
                      onChange={(e) => onSelectCourse(e, course.id)}
                      className={styles.checkbox}
                    />
                  ) : null}
                  <div className={styles.courseImg}>
                    <img
                      src={`${BASE_PATH}/api/resource/preview/path?resourcePath=${course.coverPicPath}`}
                      alt="课程封面"
                    />
                    <div className={[styles.status, styles.ing].join(" ")}>
                      {status === 0 ? "进行中" : "已结课"}
                    </div>
                    <div className={styles.title}>{course.name}</div>
                  </div>
                  <div className={styles.courseDesc}>
                    <div className={styles.courseLine}>
                      <div className={styles.creator}>{course.creatorName}</div>
                      <div className={styles.icons}>
                        <img
                          src={`${BASE_PATH}/icons/rate.webp`}
                          alt="评分"
                          title="评分"
                          onClick={() => {
                            setRow(course);
                            setRateOpen(true);
                          }}
                        />
                        <img
                          src={`${BASE_PATH}/icons/grade.webp`}
                          alt="成绩"
                          title="成绩"
                          onClick={() => {
                            setRow(course);
                            setGradeOpen(true);
                          }}
                        />
                        {status === 0 ? (
                          <img
                            src={`${BASE_PATH}/icons/endcourse.webp`}
                            alt="结课"
                            title="结课"
                            onClick={() => {
                              setRow(course);
                              setEndCourseOpen(true);
                            }}
                          />
                        ) : (
                          <Popconfirm
                            title={null}
                            description="确认要激活课程吗？"
                            onConfirm={() => onActiveConfirm(course)}
                            okText="确认"
                            cancelText="取消"
                          >
                            <img
                              src={`${BASE_PATH}/icons/endcourse.webp`}
                              alt="激活课程"
                              title="激活课程"
                            />
                          </Popconfirm>
                        )}
                      </div>
                    </div>

                    <div className={styles.hr} />
                    <div className={styles.courseCode}>{course.courseCode}</div>
                    <div className={styles.courseIntro}>{course.intro}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.empty}>
              <Empty
                image={`${BASE_PATH}/img/common/nodata.png`}
                imageStyle={{ height: 120 }}
              />
            </div>
          )}
        </div>
        <div className={styles.pagination}>
          <Pagination
            total={total}
            pageSize={coursePagination.pageSize}
            current={coursePagination.current}
            showTotal={(all, range) => (
              <span>
                第{range[0]}~{range[1]}条 / 共{all}条
              </span>
            )}
            showQuickJumper
            onChange={(page, pageSize) =>
              setCoursePagination({
                current: page,
                pageSize,
              })
            }
          />
        </div>
      </Spin>
      <Modal
        title="结课"
        maskClosable={false}
        width={600}
        open={endCourseOpen}
        footer={null}
        onCancel={() => setEndCourseOpen(false)}
        destroyOnClose
      >
        <Form
          form={form}
          preserve={false}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          onFinish={onEndCourseFinish}
        >
          <Form.Item
            label="实习评语"
            name="comment"
            rules={[{ required: true, message: "请输入实习评语" }]}
          >
            <TextArea rows={8} />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button onClick={() => setEndCourseOpen(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              确定
            </Button>
          </div>
        </Form>
      </Modal>
      <Modal
        title="评分"
        maskClosable={false}
        width={810}
        open={rateOpen}
        onOk={() => setRateOpen(false)}
        onCancel={() => setRateOpen(false)}
        destroyOnClose
      >
        <RateComponent course={row} studentRateRow={{}} flag={false} />
      </Modal>
      <Modal
        title="成绩"
        maskClosable={false}
        width={1400}
        open={gradeOpen}
        onOk={() => setGradeOpen(false)}
        onCancel={() => setGradeOpen(false)}
        destroyOnClose
      >
        <GradeComponent course={row} />
      </Modal>
    </div>
  );
};

export default HistoryCourse;
