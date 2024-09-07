import { useCallback, useEffect, useState } from "react";
import {
  Form,
  Input,
  Upload,
  Modal,
  Radio,
  Select,
  Button,
  message,
} from "antd";

import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusCircleTwoTone,
} from "@ant-design/icons";
import type {
  UploadChangeParam,
  UploadFile,
  UploadProps,
} from "antd/es/upload";
import styles from "./index.module.scss";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { setCurrent, setTaskTemplate } from "@/store/slices/templateSlice";
import { queryAllOperator } from "@/request/course";
import { parseJSON, toJSON } from "@/utils/common";
import {
  queryGridResource,
  queryPlatformGridResource,
} from "@/request/resource";
import { BASE_PATH } from "@/utils/globalVariable";

const ImgUploads: UploadProps = {
  action: `${BASE_PATH}/api/datasource/api/dataupload/uploadteacher`,
  listType: "picture",
  accept: ".png,.jpg,.jpeg,.webp",
};
const PdfUploads: UploadProps = {
  action: `${BASE_PATH}/api/datasource/api/dataupload/uploadteacher`,
  accept: ".pdf",
};

interface TaskProps {
  isEdit: boolean;
  detail: Record<string, any>;
}

const Task: React.FC<TaskProps> = ({ isEdit, detail }) => {
  const dispatch = useAppDispatch();
  const { practiceTaskTemplates: tasks } = useAppSelector(
    (slice) => slice.template
  );
  const token = localStorage.getItem("education-token");
  const head = localStorage.getItem("education-tokenHead");
  const uid = localStorage.getItem("education-uid");
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(1);
  const [line, setLine] = useState(0);
  const [title, setTitle] = useState("");
  const [operators, setOperators] = useState<Record<string, any>[]>([]);
  const [imgList, setImgList] = useState<UploadFile[]>([]);
  const [pdfList, setPdfList] = useState<UploadFile[]>([]);
  const [dataList, setDataList] = useState<number[]>([]);

  const [gridData, setGridData] = useState<Record<string, any>[]>([]);
  const [platformGridData, setPlatformGridData] = useState<
    Record<string, any>[]
  >([]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setImgList([]);
      setDataList([]);
      setPdfList([]);
    }
  }, [open]);

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
    queryGridResource({
      pageNumber: 1,
      pageSize: 99999,
    })
      .then((resp) => {
        const grids = resp.records?.map((item: Record<string, any>) => {
          const zoom = parseJSON(item.tmsPreprocessingJson)?.[0];
          const visual = parseJSON(item.tmsPreprocessingJson)?.[1];
          const lnglatStr = zoom?.result?.[0].value;
          const maxZoom = zoom?.result?.[1].value;
          const jobId = visual?.jobId;
          return {
            label: item.name,
            value: JSON.stringify({
              filePath: item.path,
              name: item.name,
              format: item.format,
              maxZoom,
              jobId,
              lnglatStr,
              id: item.id,
            }),
          };
        });
        setGridData(grids);
      })
      .catch((err) => {
        console.error(err);
      });
    queryPlatformGridResource({ pageNumber: 1, pageSize: 9999 })
      .then((resp) => {
        const platformGrids = resp.records?.map((item: Record<string, any>) => {
          const zoom = parseJSON(item.tmsPreprocessingJson)?.[0];
          const visual = parseJSON(item.tmsPreprocessingJson)?.[1];
          const lnglatStr = zoom?.result?.[0].value;
          const maxZoom = zoom?.result?.[1].value;
          const jobId = visual?.jobId;
          return {
            label: item.name,
            value: JSON.stringify({
              filePath: item.path,
              name: item.name,
              format: item.format,
              maxZoom,
              jobId,
              lnglatStr,
              id: item.id,
            }),
          };
        });
        setPlatformGridData(platformGrids);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    if (detail.practiceTaskTemplates) {
      const practiceTaskTemplates = detail.practiceTaskTemplates;
      dispatch(setTaskTemplate(practiceTaskTemplates));
    }
  }, [detail]);

  useEffect(() => {
    // if (tasks) {
    //   const practiceTaskTemplates = detail.practiceTaskTemplates;
    //   dispatch(setTaskTemplate(practiceTaskTemplates));
    // } else {
    //   dispatch(setTaskTemplate([]));
    // }
  }, [tasks]);

  const handleAdd = useCallback(() => {
    setTitle("新增任务");
    setOpen(true);
  }, []);

  const handleEdit = useCallback(
    (index: number) => {
      setLine(index);
      setTitle("编辑任务");
      form.setFieldsValue({
        ...tasks[index],
        providedAlgorithmsIds: parseJSON(tasks[index].providedAlgorithmsIds),
        resultsRequirementIds: parseJSON(tasks[index].resultsRequirementIds),
        taskAttachmentIds: parseJSON(tasks[index].taskAttachmentIds),
        providedDataIds: parseJSON(tasks[index].providedDataIds),
      });
      setImgList(
        parseJSON(tasks[index]?.resultsRequirementIds)?.map(
          (item: Record<string, any>) => ({
            ...item,
            url: `${BASE_PATH}/api/resource/preview/path?resourcePath=${item.filePath}`,
            status: "done",
          })
        ) || []
      );
      setPdfList(
        parseJSON(tasks[index]?.taskAttachmentIds)?.map(
          (item: Record<string, any>) => ({
            ...item,
            url: `${BASE_PATH}/api/resource/preview/path?resourcePath=${item.filePath}`,
            status: "done",
          })
        ) || []
      );
      setDataList(
        parseJSON(tasks[index].providedDataIds)?.map(
          (item: Record<string, any>) => ({
            ...item,
            url: `${BASE_PATH}/api/resource/preview/path?resourcePath=${item.filePath}`,
            status: "done",
          })
        )
      );
      setOpen(true);
    },
    [tasks]
  );

  const onImgChange = (info: UploadChangeParam<UploadFile>) => {
    const newList = [...info.fileList];
    setImgList(newList);
  };
  const onPdfChange = (info: UploadChangeParam<UploadFile>) => {
    const newList = [...info.fileList];
    setPdfList(newList);
  };

  const onFinish = useCallback(
    (values: Record<string, any>) => {
      const customValue = {
        ...values,
        providedDataIds: toJSON(values.providedDataIds),
        resultsRequirementIds: values.resultsRequirementIds?.fileList?.map(
          (file: UploadFile<any>) => ({
            uid: file.uid,
            name: file.name,
            filePath: file.response,
          })
        ),
        taskAttachmentIds: values.taskAttachmentIds?.fileList?.map(
          (file: UploadFile<any>) => ({
            uid: file.uid,
            name: file.name,
            filePath: file.response,
          })
        ),
        providedAlgorithmsIds:
          typeof values.providedAlgorithmsIds === "object"
            ? JSON.stringify(values.providedAlgorithmsIds)
            : values.providedAlgorithmsIds,
      };
      if (title === "编辑任务") {
        const newTasks = [...tasks];
        newTasks[line] = { ...customValue };
        dispatch(setTaskTemplate([...newTasks]));
      } else {
        dispatch(setTaskTemplate([...tasks, { ...customValue }]));
      }
      setOpen(false);
    },
    [tasks, line, title]
  );

  const handleDelete = (index: number) => {
    const newTasks = tasks.filter((t, i) => i !== index);
    dispatch(setTaskTemplate([...newTasks]));
  };

  const handleNext = () => {
    dispatch(setCurrent(2));
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        实习内容
        {isEdit ? (
          <PlusCircleTwoTone
            onClick={handleAdd}
            style={{
              fontSize: 18,
              cursor: "pointer",
              marginLeft: 5,
            }}
          />
        ) : null}
      </div>
      <div className={styles.lines}>
        {tasks
          ?.filter((task) => task.status !== 2)
          ?.map((task, index) => {
            return (
              <div className={styles.line} key={index}>
                <div className={styles.name}>{task.name}</div>
                <div className={styles.icon}>
                  <EditOutlined
                    title="编辑"
                    onClick={() => handleEdit(index)}
                  />
                  {isEdit ? (
                    <DeleteOutlined
                      title="删除"
                      onClick={() => handleDelete(index)}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => dispatch(setCurrent(0))}
        >
          上一页
        </Button>
        <Button icon={<ArrowRightOutlined />} onClick={handleNext}>
          下一页
        </Button>
      </div>
      <Modal
        title={title}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        maskClosable={false}
      >
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          onFinish={onFinish}
          disabled={!isEdit}
        >
          <Form.Item label="任务名称" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="任务类别"
            name="type"
            rules={[{ required: true }]}
            initialValue={1}
          >
            <Radio.Group onChange={(e) => setType(e.target.value)}>
              <Radio value={1}>工具箱模式</Radio>
              <Radio value={2}> 编程模式</Radio>
            </Radio.Group>
          </Form.Item>

          {type === 1 ? (
            <Form.Item
              label="算子选择"
              name="providedAlgorithmsIds"
              rules={[{ required: true, message: "请选择算子" }]}
            >
              <Select options={operators} />
            </Form.Item>
          ) : null}
          <Form.Item
            label="实习数据"
            name="providedDataIds"
            rules={[{ required: true }]}
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              value={dataList}
              onChange={(value) => setDataList(value)}
              options={[
                {
                  label: "我的数据",
                  title: "mine",
                  options: gridData,
                },
                {
                  label: "平台数据",
                  title: "platform",
                  options: platformGridData,
                },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="实习成果要求"
            name="resultsRequirementIds"
            rules={[{ required: false }]}
          >
            <Upload
              {...ImgUploads}
              data={(file) => {
                return {
                  uid,
                  coursename: "test",
                };
              }}
              headers={{
                Authorization: head + "" + token,
              }}
              fileList={imgList}
              onChange={onImgChange}
              onRemove={(file) => {
                setImgList(imgList.filter((item) => item.uid !== file.uid));
              }}
            >
              <Button type="primary">选择数据</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            label="实习附件（参考资料）"
            name="taskAttachmentIds"
            rules={[{ required: false }]}
          >
            <Upload
              {...PdfUploads}
              data={(file) => {
                return {
                  uid,
                  coursename: "test",
                };
              }}
              headers={{
                Authorization: head + "" + token,
              }}
              fileList={pdfList}
              onChange={onPdfChange}
              onRemove={(file) => {
                setPdfList(pdfList.filter((item) => item.uid !== file.uid));
              }}
            >
              <Button type="primary">选择数据</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            label="提交方式"
            name="submissionType"
            rules={[{ required: false }]}
            initialValue={1}
          >
            <Radio.Group>
              <Radio value={1}>个人</Radio>
              <Radio value={2}> 小组</Radio>
            </Radio.Group>
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            <Button type="primary" htmlType="submit">
              确定
            </Button>
            <Button onClick={() => setOpen(false)}>取消</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Task;
