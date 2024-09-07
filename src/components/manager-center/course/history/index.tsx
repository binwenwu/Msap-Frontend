import { Empty, Input, Pagination, Spin, message } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { BASE_PATH } from "@/utils/globalVariable";
import CustomButton from "@/components/button";
import styles from "./history.module.scss";
import Template from "@/components/template";
import { queryCourse } from "@/request/course";
import { useAppDispatch } from "@/store/hook";
import { toogleOpen } from "@/store/slices/templateSlice";

const { Search } = Input;

const HistoryCourse = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState(0);
  const [row, setRow] = useState<Record<string, any>>({});
  const [pagination, setPagination] = useState({
    pageSize: 8,
    pageNumber: 1,
  });
  const [searchValue, setSearchValue] = useState("");
  const [dataSource, setDataSource] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    setLoading(true);
    queryCourse({
      status,
      name: searchValue,
      ...pagination,
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
        message.error("课程信息获取失败！");
        setDataSource([]);
        console.error(err);
        setLoading(false);
      });
  }, [status, refresh]);

  const onSearch = useCallback((value: string) => {
    setSearchValue(value);
    setRefresh((bool) => !bool);
  }, []);

  return (
    <div className={styles.contentBox}>
      <div className={styles.searchBox}>
        <div className={styles.btns} />
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
            placeholder="请输入名称搜索"
            allowClear
            enterButton
            onSearch={onSearch}
          />
        </div>
      </div>
      <Spin spinning={loading}>
        <div className={styles.tableBox}>
          {dataSource.length ? (
            dataSource.map((course) => {
              return (
                <div className={styles.courseBlock} key={course.key}>
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
                          src={`${BASE_PATH}/icons/detail.webp`}
                          alt="详情"
                          title="详情"
                          onClick={() => {
                            setRow(course);
                            dispatch(toogleOpen(true));
                          }}
                        />
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
              showQuickJumper
              total={total}
              current={pagination.pageNumber}
              pageSize={pagination.pageSize}
              showTotal={(all, range) => (
                <span>
                  第{range[0]}~{range[1]}条 / 共{all}条
                </span>
              )}
              onChange={(page, pageSize) => {
                setPagination({ pageNumber: page, pageSize });
                setRefresh((bool) => !bool);
              }}
            />
          </div>
        </div>
      </Spin>
      <Template isEdit={3} course={row} type={2} />
    </div>
  );
};

export default HistoryCourse;
