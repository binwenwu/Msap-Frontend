import { useCallback, useEffect, useState } from "react";
import { Upload, Button, message } from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  PlusCircleTwoTone,
} from "@ant-design/icons";
import type {
  UploadChangeParam,
  UploadFile,
  UploadProps,
} from "antd/es/upload";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { setCurrent, setReport } from "@/store/slices/templateSlice";
import { BASE_PATH } from "@/utils/globalVariable";
import type { RcFile } from "antd/lib/upload";
import styles from "./index.module.scss";

const DocUpload: UploadProps = {
  // action: `${BASE_PATH}/api/datasource/api/dataupload/uploadteacher`,
  accept: ".doc,.docx",
};
interface ReportProps {
  isEdit: boolean;
  detail: Record<string, any>;
}

const Report: React.FC<ReportProps> = ({ isEdit, detail }) => {
  const dispatch = useAppDispatch();
  const { reportDict: reports } = useAppSelector((slice) => slice.template);
  const token = localStorage.getItem("education-token");
  const head = localStorage.getItem("education-tokenHead");
  const uid = localStorage.getItem("education-uid");

  useEffect(() => {
    if (detail?.practiceTemplate?.reportDict) {
      const reportDict = detail.practiceTemplate.reportDict;
      dispatch(setReport(JSON.parse(reportDict)));
    }
  }, [detail]);

  const handleDelete = useCallback(
    (index: number) => {
      const newReports = reports.filter((t, i) => i !== index);
      dispatch(setReport([...newReports]));
    },
    [reports]
  );

  const handlePreview = useCallback((file: Record<string, any>) => {
    window.open(
      `${BASE_PATH}/api/resource/preview/path?resourcePath=${file.filePath}`
    );
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        实习报告
        <Upload
          {...DocUpload}
          customRequest={({ file }) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("uid", uid!);
            formData.append("coursename", "test");
            fetch(`${BASE_PATH}/api/datasource/api/dataupload/uploadteacher`, {
              headers: {
                Authorization: head + "" + token,
              },
              body: formData,
              method: "post",
            })
              .then((response) => response.text())
              .then((resp) => {
                dispatch(
                  setReport([
                    ...reports,
                    { name: (file as RcFile).name, filePath: resp },
                  ])
                );
              })
              .catch((err) => {
                message.error("上传失败！");
                console.error(err);
              });
          }}
          fileList={[]}
        >
          {isEdit ? (
            <PlusCircleTwoTone
              style={{
                fontSize: 18,
                cursor: "pointer",
                marginLeft: 5,
                marginTop: 5,
              }}
            />
          ) : null}
        </Upload>
      </div>
      <div className={styles.lines}>
        {reports.map((report, index) => {
          return (
            <div className={styles.line} key={index}>
              <div
                className={styles.name}
                onClick={() => handlePreview(report)}
              >
                {report.name}
              </div>
              <div className={styles.icon}>
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
          onClick={() => dispatch(setCurrent(1))}
        >
          上一页
        </Button>
        <Button
          icon={<ArrowRightOutlined />}
          onClick={() => dispatch(setCurrent(3))}
        >
          下一页
        </Button>
      </div>
    </div>
  );
};

export default Report;
