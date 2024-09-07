import {
  Input,
  Modal,
  Pagination,
  Tree,
  Popconfirm,
  Spin,
  message,
  Empty,
  DatePicker,
  Form,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { BASE_PATH } from "@/utils/globalVariable";
import Template from "@/components/template";
import CustomButton from "@/components/button";
import {
  deleteTemplate,
  instanceTemplate,
  queryStudentsByTemplateId,
  queryTemplate,
  shareTeacherList,
  shareTemplate,
} from "@/request/template";
import { useAppDispatch } from "@/store/hook";
import { toogleOpen } from "@/store/slices/templateSlice";
import TransferTreeTable from "@/components/transfer-tree-table";
import { eventEmitter } from "@/utils/events";
import styles from "../course.module.scss";

const { Search } = Input;

const TemplateCourse = () => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [shareOpen, setShareOpen] = useState(false);
  const [startCourseOpen, setStartCourseOpen] = useState(false);
  const [startCourseLoading, setStartCourseLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isEdit, setIsEdit] = useState<1 | 2 | 3>(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [row, setRow] = useState<Record<string, any>>({});
  const [targetKeys, setTargetKeys] = useState<React.Key[]>([]);
  const [studentTotal, setStudentTotal] = useState(0);
  const [students, setStudents] = useState<Record<string, any>[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Record<string, any>[]>(
    []
  );
  const [teacherIds, setTeacherIds] = useState<number[]>([]);

  const [dataSource, setDataSource] = useState<Record<string, any>[]>([]);
  const [sharedKeys, setSharedKeys] = useState<number[]>([]);
  const [treeData, setTreeData] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    const onTemplateUpdate = () => {
      setRefresh((bool) => !bool);
    };
    eventEmitter.on("update:template", onTemplateUpdate);
    return () => {
      eventEmitter.off("update:template", onTemplateUpdate);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    queryTemplate({
      type: status,
      name: searchValue,
      pageNumber: 1,
      pageSize: 10,
    })
      .then((resp) => {
        setTotal(resp.total);
        setDataSource(
          resp.records?.map((record: Record<string, any>) => ({
            ...record,
            key: record.id,
          }))
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        message.error("获取课程模板失败！");
        setDataSource([]);
        setLoading(false);
      });
  }, [refresh, status]);

  useEffect(() => {
    if (shareOpen) {
      shareTeacherList(row.id).then((resp) => {
        setTreeData(
          resp.map((item: Record<string, any>) => ({
            title: item.tname,
            key: item.uid,
          }))
        );
        const keys = resp
          .map((item: Record<string, any>) => item.shared)
          .filter(Boolean);
        setSharedKeys(keys);
      });
    }
  }, [shareOpen]);

  useEffect(() => {
    if (startCourseOpen) {
      setStartCourseLoading(true);
      queryStudentsByTemplateId(row.id)
        .then((resp: Record<string, any>[]) => {
          setStudents(
            resp.map((item) => ({
              ...item,
              key: item.uid,
            }))
          );
          setStudentTotal(resp.length || 0);
          setStartCourseLoading(false);
        })
        .catch(() => {
          setStartCourseLoading(false);
        });
    }
  }, [startCourseOpen]);

  const onStudentChange = useCallback((rows: Record<string, any>[]) => {
    // console.log("rows", rows);
    setSelectedStudent(rows);
  }, []);

  const onSearch = useCallback((value: string) => {
    setSearchValue(value);
    setRefresh((bool) => !bool);
  }, []);

  const onOk = useCallback(() => {
    shareTemplate({
      practiceTid: row.id,
      uids: [...teacherIds],
    })
      .then((resp) => {
        message.success("分享成功！");
        setShareOpen(false);
      })
      .catch((err) => {
        message.error("分享失败！");
        console.error(err);
      });
    setShareOpen(false);
  }, [row, teacherIds]);

  const onCheck = useCallback((checkedKeys: any) => {
    setTeacherIds(checkedKeys);
  }, []);

  const onTransferOk = useCallback(() => {
    form
      .validateFields()
      .then((values: Record<string, any>) => {
        if (!selectedStudent.length) {
          message.warning("请选选择开课的学生！");
          return;
        }
        instanceTemplate({
          endTime: values.endTime.format("YYYY-MM-DD HH:mm:ss"),
          practiceTid: row.id,
          students: selectedStudent,
        })
          .then((resp) => {
            message.success("开课成功！");
            setStartCourseOpen(false);
          })
          .catch((err) => {
            message.error("开课失败！");
            console.error(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [selectedStudent]);

  const onTransferClose = useCallback(() => {
    setStartCourseOpen(false);
    setStudents([]);
    setTargetKeys([]);
  }, []);

  const onConfirmDelete = useCallback((course: Record<string, any>) => {
    deleteTemplate(course.id)
      .then((resp) => {
        message.success("删除成功！");
        setRefresh((bool) => !bool);
      })
      .catch((err) => {
        message.error("删除失败！");
        console.error(err);
      });
  }, []);

  return (
    <div className={styles.contentBox}>
      <div className={styles.searchBox}>
        {status === 1 ? (
          <div className={styles.btns}>
            <CustomButton
              borderColor="rgba(0, 186, 173, 1)"
              bgColor="rgba(237, 255, 254, 1)"
              style={{ marginRight: 20 }}
              onClick={() => {
                dispatch(toogleOpen(true));
                setIsEdit(1);
              }}
            >
              创建课程
            </CustomButton>
          </div>
        ) : (
          <div className={styles.btns} />
        )}
        <div className={styles.status}>
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
            我的模板
          </CustomButton>
          <CustomButton
            onClick={() => setStatus(2)}
            borderColor="transparent"
            bgColor="transparent"
            style={
              status === 2
                ? {
                    borderColor: "rgba(46, 143, 255, 1)",
                    backgroundColor: "rgba(46, 143, 255, 1)",
                    color: "#fff",
                    padding: "5px 5px",
                  }
                : { color: "rgba(56, 56, 56, 1)", padding: "5px 5px" }
            }
          >
            平台模板
          </CustomButton>
        </div>
        <div className={styles.searchInput}>
          <Search
            placeholder="请输入名称搜索"
            allowClear
            enterButton
            onSearch={onSearch}
          />
        </div>
      </div>
      <Spin spinning={loading}>
        <div className={styles.tableBox}>
          {dataSource.length > 0 ? (
            dataSource.map((course, index) => {
              return (
                <div className={styles.courseBlock} key={index}>
                  <div className={styles.courseImg}>
                    <img
                      src={`${BASE_PATH}/api/resource/preview/path?resourcePath=${course.coverPicPath}`}
                      alt="课程封面"
                    />
                    <div className={styles.title}>{course.name}</div>
                  </div>
                  <div className={styles.courseDesc}>
                    <div className={styles.courseLine}>
                      <div className={styles.creator}>
                        {course.creatorName || "创建人"}
                      </div>
                      <div className={styles.icons}>
                        {status === 1 ? (
                          <img
                            src={`${BASE_PATH}/icons/startcourse.webp`}
                            alt="开课"
                            title="开课"
                            onClick={() => {
                              setRow(course);
                              setStartCourseOpen(true);
                            }}
                          />
                        ) : null}
                        <img
                          src={`${BASE_PATH}/icons/edit.webp`}
                          alt="编辑"
                          title="编辑"
                          onClick={() => {
                            setRow(course);
                            setIsEdit(2);
                            dispatch(toogleOpen(true));
                          }}
                        />
                        {status === 1 ? (
                          <img
                            src={`${BASE_PATH}/icons/share.webp`}
                            alt="分享"
                            title="分享"
                            onClick={() => {
                              setRow(course);
                              setShareOpen(true);
                            }}
                          />
                        ) : null}
                        <img
                          src={`${BASE_PATH}/icons/detail.webp`}
                          alt="详情"
                          title="详情"
                          onClick={() => {
                            setRow(course);
                            setIsEdit(3);
                            dispatch(toogleOpen(true));
                          }}
                        />
                        {status === 1 ? (
                          <Popconfirm
                            title={null}
                            description="确定要删除该课程？"
                            onConfirm={() => {
                              setRow(course);
                              onConfirmDelete(course);
                            }}
                            okText="确定"
                            cancelText="取消"
                          >
                            <img
                              src={`${BASE_PATH}/icons/delete.webp`}
                              alt="删除"
                              title="删除"
                            />
                          </Popconfirm>
                        ) : null}
                      </div>
                    </div>

                    <div className={styles.hr} />
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
            defaultPageSize={10}
            showTotal={(all, range) => (
              <span>
                第{range[0]}~{range[1]}条 / 共{all}条
              </span>
            )}
            defaultCurrent={1}
            showQuickJumper
            showSizeChanger
          />
        </div>
      </Spin>
      <Template isEdit={isEdit} course={row} status={status} type={1} />
      <Modal
        title="分享"
        maskClosable={false}
        open={shareOpen}
        onOk={onOk}
        onCancel={() => setShareOpen(false)}
      >
        <Tree checkable height={400} onCheck={onCheck} treeData={treeData} />
      </Modal>
      <Modal
        title="开课"
        maskClosable={false}
        destroyOnClose
        width={1200}
        open={startCourseOpen}
        onOk={onTransferOk}
        onCancel={onTransferClose}
      >
        <Form form={form}>
          <Form.Item
            label="截止时间"
            name="endTime"
            rules={[{ required: true }]}
          >
            <DatePicker format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
        </Form>
        <TransferTreeTable
          templateId={row.id}
          setSelectedStudent={setSelectedStudent}
        />
      </Modal>
    </div>
  );
};

export default TemplateCourse;
