import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { BASE_PATH } from "@/utils/globalVariable";
import CustomTable from "@/components/table";
import {
  Button,
  Form,
  Input,
  Radio,
  Select,
  Upload,
  Modal,
  type UploadFile,
  type UploadProps,
  message,
} from "antd";
import {
  InfoCircleOutlined,
  MedicineBoxOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getResultList,
  getTaskDetail,
  getTaskList,
  queryRemidCourse,
  submitResult,
} from "@/request/student";
import { OverAllType, overall } from "@/request/manager";
import {
  queryAllOperator,
  queryCourse,
  queryResultDetail,
} from "@/request/course";
import { type UploadChangeParam } from "antd/es/upload";
import { parseJSON, toJSON } from "@/utils/common";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import {
  ResourceLayer,
  addDrawLayers,
  addResourceLayers,
  addResultLayers,
} from "@/store/slices/boxSlice";
import { useRouter } from "next/router";
import styles from "./task.module.scss";

interface IndexProps {}

const TaskStatusMap = {
  0: {
    text: "进行中",
    color: "rgb(255, 141, 26)",
  },
  1: {
    text: "已完成",
    color: "#1f1",
  },
  2: {
    text: "已逾期",
    color: "rgb(212, 48, 48)",
  },
};

const columns = [
  {
    title: "实习名称",
    dataIndex: "practiceName",
    key: "practiceName",
  },
  {
    title: "任务名称",
    dataIndex: "taskName",
    key: "taskName",
  },
  {
    title: "任务类型",
    dataIndex: "taskType",
    key: "taskType",
    render: (value: string) => {
      return <>{value === "1" ? "工具箱模式" : "编程模式"}</>;
    },
  },
  {
    title: "指导教师",
    dataIndex: "teacherName",
    key: "teacherName",
  },
  {
    title: "任务状态",
    dataIndex: "taskStatus",
    key: "taskStatus",
    render: (value: number) => {
      return (
        <span style={{ color: TaskStatusMap[value].color }}>
          {TaskStatusMap[value].text}
        </span>
      );
    },
  },
  {
    title: "截止时间",
    dataIndex: "practiceEndTime",
    key: "practiceEndTime",
    render: (time: string) => {
      return <span>{dayjs(time).format("YYYY-MM-DD HH:mm:ss")}</span>;
    },
  },
];

const TaskStatistics = ({ statistics }: { statistics: OverAllType }) => {
  const options: echarts.EChartsOption = {
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
    <div className={styles.task}>
      <div className={styles.header}>实习任务统计</div>
      <div className={styles.body}>
        <ReactECharts
          option={options}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
};

const DoingTask = ({ courses }: { courses: string[] }) => {
  return (
    <div className={styles.doing}>
      <div className={styles.header}>进行中的实习</div>
      <div className={styles.body}>
        <div className={styles.lines}>
          {courses.map((course, index) => {
            return (
              <div className={styles.line} key={index}>
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
  );
};

const Warning = ({ warnings }: { warnings: WarningType[] }) => {
  return (
    <div className={styles.warning}>
      <div className={styles.header}>消息通知</div>
      <div className={styles.body}>
        <div className={styles.lines}>
          {warnings.map((warning, index) => {
            return (
              <div className={styles.line} key={index}>
                <div className={styles.book}>
                  <div
                    className={styles.status}
                    style={{
                      backgroundColor: warning.status
                        ? "rgba(255, 141, 26, 1)"
                        : "rgba(212, 48, 48, 1)",
                    }}
                  >
                    {warning.status ? "待提交" : "已逾期"}
                  </div>
                  <div className={styles.name}>{warning.name}</div>
                </div>
                <div className={styles.time}>{warning.endTime}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const uploadProps: UploadProps = {
  action: `${BASE_PATH}/api/datasource/api/dataupload/uploadstudent`,
  accept: ".pdf",
};

const TaskTable = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const userInfo = useAppSelector((slice) => slice.user.userInfo);
  const [form] = Form.useForm();
  const [detailForm] = Form.useForm();
  const [uploadForm] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    pageSize: 10,
    current: 1,
  });
  const [row, setRow] = useState<Record<string, any>>({});
  const [dataSource, setDataSource] = useState<Record<string, any>[]>([]);
  const [resultValue, setResultValue] = useState("");
  const [resultOptions, setResultOptions] = useState<Record<string, any>[]>([]);
  const [imgList, setImgList] = useState<UploadFile[]>([]);
  const [pdfList, setPdfList] = useState<UploadFile[]>([]);
  const [dataList, setDataList] = useState<UploadFile[]>([]);
  const [reportList, setReportList] = useState<UploadFile[]>([]);
  const [operators, setOperators] = useState<Record<string, any>[]>([]);

  const [token, setToken] = useState("");
  const [tokenHead, setTokenHead] = useState("");

  useEffect(() => {
    const t = localStorage?.getItem("education-token")!;
    const head = localStorage?.getItem("education-tokenHead")!;
    setToken(t);
    setTokenHead(head);
  }, [userInfo]);

  useEffect(() => {
    queryAllOperator()
      .then((resp) => {
        setOperators(
          resp?.map((item: Record<string, any>) => ({
            ...item,
            value: item.name,
          }))
        );
      })
      .catch((err) => {
        message.error("获取算子失败！");
        console.error(err);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    getTaskList({
      ...form.getFieldsValue(),
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
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
        message.error("获取任务任务失败！");
        setLoading(false);
      });
  }, [refresh]);

  useEffect(() => {
    if (!uploadOpen) return;
    queryResultDetail({
      practiceInstanceId: row.practiceInstanceId,
      taskId: row.taskInstanceId,
      sno: userInfo.sno!,
    })
      .then((resp) => {
        const reports = resp?.practiceReports?.map(
          (report: Record<string, any>) => {
            const path = parseJSON(report.path)?.[0];
            return {
              status: "done",
              url: `http://openge.org.cn/gateway/resource/preview/path?resourcePath=${path?.filePath}`,
              name: path?.name,
            };
          }
        );
        setReportList(reports || []);
      })
      .catch((err) => {
        message.error("获取报告失败！");
        console.error(err);
      });
    getResultList(row.taskInstanceId)
      .then((resp) => {
        const options = resp.map((item: Record<string, any>) => {
          const path = parseJSON(item.path);
          const name = path?.[0]?.name;
          if (item.isFinalResult) {
            setResultValue(toJSON(item));
          }
          return {
            label: name,
            value: toJSON(item),
          };
        });
        setResultOptions(options);
      })
      .catch((err) => {
        message.error("获取成果列表失败！");
      });
  }, [uploadOpen]);

  const onFinish = useCallback((values: any) => {
    setRefresh((bool) => !bool);
  }, []);

  const onUploadOk = () => {
    const report = uploadForm.getFieldValue("report");
    const result = uploadForm.getFieldValue("result");
    const taskResult = parseJSON(result);
    const practiceReports: any[] = [];
    const practiceTaskResults: any[] = [];
    if (report) {
      const reportPath = toJSON([
        {
          name: report.file.name,
          uid: report.file.uid,
          filePath: report.file.response,
        },
      ]);
      practiceReports.push({
        practiceInstanceId: row.practiceInstanceId,
        sno: userInfo.sno,
        reportName: report.file.name,
        submissionTime: new Date().toLocaleString().replaceAll("/", "-"),
        path: reportPath,
      });
    }
    if (result) {
      resultOptions.forEach((item) => {
        const value = parseJSON(item.value);
        practiceTaskResults.push({
          ...value,
          isFinalResult: 0,
        });
      });
      practiceTaskResults.push({
        ...taskResult,
        isFinalResult: 1,
        // practiceInstanceId: row.practiceInstanceId,
        // taskId: row.taskInstanceId,
        // taskName: row.taskName,
        // sno: sno,
        // submissionType: 1,
        // resultNum: "",
        // resultName: result,
        // isFinalResult: 1,
        // path: result,
      });
    }
    submitResult({
      practiceReports,
      practiceTaskResults,
    })
      .then((resp) => {
        // todo
        setUploadOpen(false);
        message.success("提交成功！");
        setRefresh((bool) => !bool);
      })
      .catch((err) => {
        message.error("上传失败！");
        console.error(err);
      });
  };

  const handleReset = useCallback(() => {
    form.resetFields();
    setRefresh((bool) => !bool);
  }, []);

  const handleDetail = useCallback((row: Record<string, any>) => {
    getTaskDetail(row.taskInstanceId)
      .then((resp) => {
        const providedDataIds = parseJSON(resp.providedDataIds);
        const names = providedDataIds.map(
          (dataId: string) => parseJSON(dataId)?.name
        );
        detailForm.setFieldsValue({
          name: resp.name,
          cate: resp.type,
          providedAlgorithmsIds: resp.providedAlgorithmsIds,
          providedDataIds: names,
          resultsRequirementIds: parseJSON(resp.providedDataIds),
          taskAttachmentIds: parseJSON(resp.taskAttachmentIds),
          submissionType: row.submissionType,
        });
        setDataList(parseJSON(resp.providedDataIds) || []);
        setImgList(
          parseJSON(resp.resultsRequirementIds)?.map(
            (item: Record<string, any>) => ({
              ...item,
              url: `${BASE_PATH}/api/resource/preview/path?resourcePath=${item.filePath}`,
              status: "done",
            })
          ) || []
        );
        setPdfList(
          parseJSON(resp.taskAttachmentIds)?.map(
            (item: Record<string, any>) => ({
              ...item,
              url: `${BASE_PATH}/api/resource/preview/path?resourcePath=${item.filePath}`,
              status: "done",
            })
          ) || []
        );
        setOpen(true);
      })
      .catch((err) => {
        message.error("获取任务详情失败！");
        console.error(err);
      });
  }, []);

  const handleChange = useCallback((page: number, pageSize: number) => {
    // todo 分页
    setPagination({
      pageSize,
      current: page,
    });
    setRefresh((bool) => !bool);
  }, []);

  const onReportChange = (info: UploadChangeParam<UploadFile>) => {
    const newList = [...info.fileList];
    setReportList(newList);
  };

  const handleToBoxCenter = useCallback((record: Record<string, any>) => {
    if (record.taskType === "2") {
      router.push("./developCenter");
      return;
    }
    dispatch(
      addResourceLayers({
        type: "empty",
      })
    );
    dispatch(
      addResultLayers({
        type: "empty",
        layerObj: {},
      })
    );
    dispatch(
      addDrawLayers({
        type: "empty",
        layerObj: {},
      })
    );
    // router.push(
    //   `./boxCenter?practiceInstanceId=${record.practiceInstanceId}&taskInstanceId=${record.taskInstanceId}`
    // );
    window.location.href = `${window.location.origin}${BASE_PATH}/boxCenter?practiceInstanceId=${record.practiceInstanceId}&taskInstanceId=${record.taskInstanceId}`;
  }, []);

  return (
    <div className={styles.taskTable}>
      <div className={styles.header}>实习任务</div>
      <div className={styles.searchLine}>
        <Form form={form} onFinish={onFinish} layout="inline">
          <Form.Item name="practiceName" label="实习名称">
            <Input />
          </Form.Item>
          <Form.Item name="teacherName" label="指导教师">
            <Input />
          </Form.Item>
          <Form.Item name="status" label="任务状态">
            <Select
              className={styles.formInput}
              placeholder="请选择"
              allowClear
              options={[
                { label: "进行中", value: 0 },
                {
                  label: "已完成",
                  value: 1,
                },
                { label: "已逾期", value: 2 },
              ]}
            />
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
      <div className={styles.tableBox}>
        <CustomTable
          loading={loading}
          columns={[
            ...columns,
            {
              title: "操作",
              dataIndex: "action",
              key: "action",
              render: (_, record) => {
                return (
                  <>
                    <Button
                      type="link"
                      onClick={() => {
                        handleDetail(record);
                      }}
                      title="详情"
                    >
                      <InfoCircleOutlined
                        style={{ color: "rgb(46, 143, 255)", fontSize: 20 }}
                      />
                    </Button>
                    <Button
                      type="link"
                      title={record.taskType === "1" ? "工具箱" : "编程开发"}
                      onClick={() => handleToBoxCenter(record)}
                    >
                      <MedicineBoxOutlined
                        style={{ color: "rgb(46, 143, 255)", fontSize: 20 }}
                      />
                    </Button>
                    <Button
                      type="link"
                      title="上传"
                      onClick={() => {
                        setRow(record);
                        setUploadOpen(true);
                      }}
                    >
                      <UploadOutlined
                        style={{ color: "rgb(46, 143, 255)", fontSize: 20 }}
                      />
                    </Button>
                  </>
                );
              },
            },
          ]}
          pagination={pagination}
          dataSource={dataSource}
          useSelection={false}
          total={total}
          scroll={{ y: 430 }}
          onPaginationChange={handleChange}
        />
      </div>
      <Modal
        title="任务详情"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
        destroyOnClose
        maskClosable={false}
      >
        <Form
          form={detailForm}
          preserve={false}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <Form.Item
            label="任务名称"
            name="name"
            rules={[{ required: true, message: "请输入实习名称" }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="任务类别"
            name="cate"
            rules={[{ required: false, message: "请选择任务类别" }]}
          >
            <Radio.Group disabled>
              <Radio value={1}>工具箱模式</Radio>
              <Radio value={2}> 编程模式</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="算子选择"
            name="providedAlgorithmsIds"
            rules={[{ required: false, message: "请选择算子" }]}
          >
            <Select disabled options={operators} mode="multiple" />
          </Form.Item>
          <Form.Item
            label="实习数据"
            name="providedDataIds"
            rules={[{ required: false, message: "请上传实习数据" }]}
          >
            <Select disabled mode="multiple" options={[]} />
          </Form.Item>
          <Form.Item
            label="实习成果要求"
            name="resultsRequirementIds"
            rules={[{ required: false, message: "请上传实习成果要求" }]}
          >
            <Upload fileList={imgList} disabled>
              <Button type="primary" disabled>
                选择数据
              </Button>
            </Upload>
          </Form.Item>
          <Form.Item
            label="实习附件（参考资料）"
            name="taskAttachmentIds"
            rules={[{ required: false, message: "请上传实习附件" }]}
          >
            <Upload fileList={pdfList} disabled>
              <Button type="primary" disabled>
                选择数据
              </Button>
            </Upload>
          </Form.Item>
          <Form.Item
            label="提交方式"
            name="submissionType"
            rules={[{ required: false, message: "请选择提交方式" }]}
          >
            <Radio.Group disabled>
              <Radio value={1}>个人</Radio>
              <Radio value={2}> 小组</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="上传数据"
        open={uploadOpen}
        onCancel={() => setUploadOpen(false)}
        onOk={onUploadOk}
        destroyOnClose
        maskClosable={false}
      >
        <Form
          preserve={false}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          form={uploadForm}
        >
          <Form.Item
            label="实习报告"
            name="report"
            rules={[{ required: true }]}
          >
            <Upload
              {...uploadProps}
              data={(file) => {
                return {
                  uid: userInfo.uid,
                  sno: userInfo.sno,
                  practice_id: row.practiceInstanceId,
                  coursename: row.practiceName,
                };
              }}
              headers={{
                Authorization: tokenHead + "" + token,
              }}
              fileList={reportList}
              onChange={onReportChange}
              onRemove={(file) => {
                setReportList(
                  reportList.filter((item) => item.uid !== file.uid)
                );
              }}
            >
              <Button type="primary">选择数据</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            label="实习成果"
            name="result"
            rules={[{ required: true }]}
          >
            <Select
              options={resultOptions}
              defaultValue={resultValue}
              style={{ width: 300 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

interface WarningType {
  name: string;
  status: boolean;
  endTime: string;
}

const Index: React.FC<IndexProps> = () => {
  const [courses, setCourses] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<WarningType[]>([]);
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

  useEffect(() => {
    queryRemidCourse({
      pageNumber: 1,
      pageSize: 9999999,
    })
      .then((resp) => {
        setWarnings(
          resp.records.map((record: Record<string, any>) => ({
            name: record.practiceName,
            endTime: record.endTime,
            status: dayjs().isBefore(dayjs(record.endTime)),
          }))
        );
      })
      .catch((err) => {
        message.error("获取预警消息失败！");
        console.error(err);
      });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <TaskStatistics statistics={statistics} />
        <DoingTask courses={courses} />
        <Warning warnings={warnings} />
      </div>
      <TaskTable />
    </div>
  );
};

export default Index;
