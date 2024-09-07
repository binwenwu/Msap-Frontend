import {
  ConfigProvider,
  Empty,
  Pagination,
  Table,
  type TablePaginationConfig,
  type TableProps,
} from "antd";
import { useRouter } from "next/router";
import zhCN from "antd/lib/locale/zh_CN";
import enUS from "antd/lib/locale/en_US";
import styles from "./index.module.scss";
import { useRef, useState } from "react";
import { BASE_PATH } from "@/utils/globalVariable";

interface CustomTableProps extends TableProps {
  useSelection?: boolean;
  usePagination?: boolean;
  useEmpty?: boolean;
  total?: number;
  emptyHeight?: number;
  onPaginationChange?: (page: number, pageSize: number) => void;
  onSelectionChange?: (rows: any[]) => void;
}

const CustomTable: React.FC<CustomTableProps> = (props) => {
  const {
    useSelection = true,
    usePagination = true,
    useEmpty = true,
    emptyHeight = 500,
    total,
    pagination,
    onPaginationChange,
    onSelectionChange,
  } = props;
  const rowSelection = {
    onChange: (
      selectedRowKeys: React.Key[],
      selectedRows: Record<string, any>[]
    ) => {
      onSelectionChange?.(selectedRows);
      setSelectedCount(selectedRowKeys.length);
    },
  };
  const paginations: TablePaginationConfig = {};
  if (pagination && pagination.current && pagination.pageSize) {
    paginations.current = pagination.current;
    paginations.pageSize = pagination.pageSize;
  }
  const mergePropsRef = useRef<TableProps>({});
  if (useSelection) {
    mergePropsRef.current.rowSelection = rowSelection;
  } else {
    mergePropsRef.current.rowSelection = undefined;
  }

  const { locale } = useRouter();
  const [selectedCount, setSelectedCount] = useState(0);
  return (
    <>
      <Table
        {...props}
        {...mergePropsRef.current}
        pagination={false}
        locale={
          useEmpty
            ? {
                emptyText: (
                  <Empty
                    image={`${BASE_PATH}/img/common/nodata.png`}
                    imageStyle={{ height: 160, margin: "40px 0 10px 0" }}
                    style={{
                      minHeight: emptyHeight,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  />
                ),
              }
            : {}
        }
      />
      {usePagination ? (
        <ConfigProvider locale={locale === "en-US" ? enUS : zhCN}>
          <div className={styles.pagination}>
            <div className={styles.selected}>
              {props.useSelection ? (
                <div>
                  已选择 <span>{selectedCount}</span> 张
                </div>
              ) : null}
            </div>
            <Pagination
              total={total}
              onChange={(page, pageSize) => {
                onPaginationChange?.(page, pageSize);
              }}
              {...paginations}
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
        </ConfigProvider>
      ) : null}
    </>
  );
};

export default CustomTable;
