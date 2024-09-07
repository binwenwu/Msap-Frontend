import { useCallback, useEffect, useState, useRef } from "react";
import { Form, Input, Upload, DatePicker, Image, Button } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import type { GetProp, UploadProps } from "antd";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { setBaseInfo, setCurrent } from "@/store/slices/templateSlice";
import dayjs from "dayjs";
import { BASE_PATH } from "@/utils/globalVariable";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];
const { TextArea } = Input;
const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

interface BaseInfoProps {
  isEdit: boolean;
  detail: Record<string, any>;
}

const BaseInfo: React.FC<BaseInfoProps> = ({ isEdit, detail }) => {
  const dispatch = useAppDispatch();
  const token = localStorage.getItem("education-token");
  const head = localStorage.getItem("education-tokenHead");
  const uid = localStorage.getItem("education-uid");
  const { practiceTemplate } = useAppSelector((slice) => slice.template);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imgPath, setImgPath] = useState("");
  const [name, setName] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!practiceTemplate.name) return;
    form.setFieldsValue({
      name: practiceTemplate.name,
      coverPicPath: `${BASE_PATH}/api/resource/preview/path?resourcePath=${practiceTemplate?.coverPicPath}`,
      intro: practiceTemplate.intro,
    });
    practiceTemplate?.coverPicPath &&
      setImageUrl(
        `${BASE_PATH}/api/resource/preview/path?resourcePath=${practiceTemplate?.coverPicPath}`
      );
  }, [practiceTemplate]);

  useEffect(() => {
    if (Object.keys(detail).length) {
      const name = detail.practiceTemplate.name;
      const coverPicPath = detail.practiceTemplate.coverPicPath;
      const intro = detail.practiceTemplate.intro;
      form.setFieldsValue({
        name,
        coverPicPath,
        intro,
      });
      setImageUrl(
        `${BASE_PATH}/api/resource/preview/path?resourcePath=${detail.practiceTemplate.coverPicPath}`
      );
    }
  }, [detail]);

  const onFinish = useCallback(
    (values: any) => {
      dispatch(
        setBaseInfo({
          ...values,
          coverPicPath: imgPath || values.coverPicPath,
        })
      );
      dispatch(setCurrent(1));
    },
    [imgPath]
  );

  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      const imgUrl = info.file.response;
      setImgPath(imgUrl);
      setLoading(false);
      setImageUrl(
        `${BASE_PATH}/api/resource/preview/path?resourcePath=${imgUrl}`
      );
    }
  };
  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
    </button>
  );

  useEffect(() => {
    if (inputRef.current) {
      const initialName = form.getFieldValue("name");
      setName(initialName);
    }
  }, []);
  return (
    <Form form={form} onFinish={onFinish} labelCol={{ span: 5 }}>
      <Form.Item label="实习名称" name="name" rules={[{ required: true }]}>
        <Input
          disabled={!isEdit}
          onChange={(e) => setName(e.target.value)}
          ref={inputRef}
          value={name}
        />
      </Form.Item>
      <Form.Item
        label="实习封面"
        name="coverPicPath"
        rules={[{ required: false }]}
      >
        <Upload
          action={`${BASE_PATH}/api/datasource/api/dataupload/uploadteacher`}
          listType="picture-card"
          accept=".png,.jpg,.jpeg,.webp"
          showUploadList={false}
          onChange={handleChange}
          headers={{
            Authorization: head + "" + token,
          }}
          data={() => {
            return {
              uid,
              coursename: name,
            };
          }}
          disabled={!isEdit}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="avatar" style={{ width: "100%" }} />
          ) : (
            uploadButton
          )}
        </Upload>
      </Form.Item>
      <Form.Item label="实习简介" name="intro" rules={[{ required: true }]}>
        <TextArea rows={8} disabled={!isEdit} />
      </Form.Item>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button htmlType="submit">下一页</Button>
      </div>
    </Form>
  );
};

export default BaseInfo;
