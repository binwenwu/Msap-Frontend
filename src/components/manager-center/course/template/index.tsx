import {
  Input,
  Modal,
  Pagination,
  Tree,
  Popconfirm,
  Spin,
  message,
  Empty,
} from "antd";
import React, { useCallback, useState, useEffect } from "react";
import { BASE_PATH } from "@/utils/globalVariable";
import Template from "@/components/template";
import CustomButton from "@/components/button";
import {
  deleteTemplate,
  queryTemplate,
  shareTeacherList,
  shareTemplate,
} from "@/request/template";
import { useAppDispatch } from "@/store/hook";
import { toogleOpen } from "@/store/slices/templateSlice";
import styles from "../course.module.scss";
import { eventEmitter } from "@/utils/events";

const { Search } = Input;

const TemplateCourse = () => {
  const dispatch = useAppDispatch();
  const [shareOpen, setShareOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isEdit, setIsEdit] = useState<1 | 2 | 3>(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [row, setRow] = useState<Record<string, any>>({});
  const [teacherIds, setTeacherIds] = useState<number[]>([]);
  const [dataSource, setDataSource] = useState<Record<string, any>[]>([]);

  const [sharedKeys, setSharedKeys] = useState<string[]>([]);
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
    queryData();
  }, [refresh, status]);

  useEffect(() => {
    if (shareOpen) {
      shareTeacherList(row.id).then((resp) => {
        setTreeData(
          resp.map((item: Record<string, any>) => ({
            title: item.tname,
            key: String(item.uid),
          }))
        );
        const keys = resp
          .filter((item: Record<string, any>) => item.shared)
          .map((item: Record<string, any>) => String(item.uid));
        setSharedKeys(keys);
      });
    }
  }, [shareOpen]);

  const queryData = () => {
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
          resp.records.map((record: Record<string, any>) => ({
            ...record,
            key: record.id,
          }))
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setTotal(0);
        setDataSource([]);
        setLoading(false);
      });
  };

  const handleShare = useCallback((record: Record<string, any>) => {
    setRow(record);
    setShareOpen(true);
  }, []);

  const onSearch = useCallback((value: string) => {
    setSearchValue(value);
    setRefresh((bool) => !bool);
  }, []);

  const onOk = useCallback(async () => {
    // todo
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
  }, [row, teacherIds]);

  const onCheck = useCallback((checkedKeys: any) => {
    const uids: string[] = checkedKeys.filter((key: string) => key !== "all");
    setTeacherIds(uids.map((uid) => Number(uid)));
    setSharedKeys(uids);
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
                setRow({});
                dispatch(toogleOpen(true));
                setIsEdit(1);
              }}
            >
              创建模板
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
            placeholder="请输入备注搜索"
            allowClear
            enterButton
            onSearch={onSearch}
          />
        </div>
      </div>
      <Spin spinning={loading}>
        <div className={styles.tableBox}>
          {dataSource.length ? (
            dataSource.map((course, index) => {
              return (
                <div className={styles.courseBlock} key={index}>
                  <div className={styles.courseImg}>
                    <img
                      src={`${BASE_PATH}/api/resource/preview/path?resourcePath=${course.coverPicPath}`}
                    />
                    <div className={styles.title}>{course.name}</div>
                  </div>
                  <div className={styles.courseDesc}>
                    <div className={styles.courseLine}>
                      <div className={styles.creator}>
                        {course.creatorName || "创建人"}
                      </div>
                      <div className={styles.icons}>
                        <img
                          src={`${BASE_PATH}/icons/edit.webp`}
                          alt="编辑"
                          title="编辑"
                          onClick={() => {
                            dispatch(toogleOpen(true));
                            setRow(course);
                            setIsEdit(2);
                          }}
                        />
                        {status === 1 ? (
                          <img
                            src={`${BASE_PATH}/icons/share.webp`}
                            alt="分享"
                            title="分享"
                            onClick={() => handleShare(course)}
                          />
                        ) : null}
                        <img
                          src={`${BASE_PATH}/icons/detail.webp`}
                          alt="详情"
                          title="详情"
                          onClick={() => {
                            setRow(course);
                            dispatch(toogleOpen(true));
                            setIsEdit(3);
                          }}
                        />
                        {status === 1 ? (
                          <Popconfirm
                            title={null}
                            description="确定要删除该课程？"
                            onConfirm={() => onConfirmDelete(course)}
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
        <Tree
          checkable
          height={400}
          rootStyle={{ minHeight: 400 }}
          defaultExpandAll
          checkedKeys={sharedKeys}
          selectedKeys={sharedKeys}
          onCheck={onCheck}
          // @ts-ignore
          treeData={[{ title: "全选", key: "all", children: treeData }]}
        />
      </Modal>
    </div>
  );
};

export default TemplateCourse;
