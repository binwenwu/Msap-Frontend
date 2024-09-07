import { Button, Form, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import styles from "../Map.module.scss";

export default () => {
  const [saveForm] = Form.useForm();

  const [openSwipeControl, setopenSwipeControl] = useState(false);

  const [openPopupSwipeControl, setopenPopupSwipeControl] = useState(false);

  useEffect(() => {
    const toolbar = document.getElementById("toolbar");
    const tool = document.createElement("div");
    tool.title = "卷帘";
    tool.style.cssText = `width:30px;height:30px;background-color:#fff;display:flex;justify-content:center;align-items:center;z-index:999;border-bottom:1px solid #ccc;`;
    tool.innerHTML = `<svg
      style="
        width: 50%;
        height: 50%;
      "
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
    >
      <path
        d="M853.333333 85.333333h-298.666666V42.666667c0-23.466667-19.2-42.666667-42.666667-42.666667s-42.666667 19.2-42.666667 42.666667v42.666666H170.666667c-46.933333 0-85.333333 38.4-85.333334 85.333334v682.666666c0 46.933333 38.4 85.333333 85.333334 85.333334h298.666666v42.666666c0 23.466667 19.2 42.666667 42.666667 42.666667s42.666667-19.2 42.666667-42.666667v-42.666666h298.666666c46.933333 0 85.333333-38.4 85.333334-85.333334V170.666667c0-46.933333-38.4-85.333333-85.333334-85.333334z m0 323.84l-298.666666 298.666667v-92.586667l298.666666-298.666666v92.586666zM554.666667 170.666667h110.506666L554.666667 281.173333V170.666667z m298.666666 25.173333l-298.666666 298.666667V401.493333L785.493333 170.666667H853.333333v25.173333zM170.666667 170.666667h298.666666v682.666666H170.666667V170.666667z m384 657.493333l298.666666-298.666667v92.586667L622.506667 853.333333H554.666667v-25.173333z m188.16 25.173333L853.333333 742.826667V853.333333h-110.506666z"
        fill="#515151"
      />
    </svg>`;
    toolbar?.appendChild(tool);
    tool.onclick = () => {
      onClickButton();
    };
  }, []);

  const onClickButton = () => {
    if (openSwipeControl) {
      setopenSwipeControl((prevState) => !prevState);
    }
    // setopenSwipeControl(prevState => !prevState)
    if (!openSwipeControl) {
      setopenPopupSwipeControl((prevState) => !prevState);
    }
  };
  const handleSubmit = () => {
    setopenPopupSwipeControl(false);
    // 控制卷帘效果
    setopenSwipeControl((prevState) => !prevState);
  };

  const handleLayerChange = (value: any) => {
    console.log(value);
  };

  return (
    <>
      <Modal
        title="选择图层"
        width={300}
        open={openPopupSwipeControl}
        footer={null}
        destroyOnClose
        onCancel={() => {
          setopenPopupSwipeControl(false);
          setopenSwipeControl(false);
        }}
      >
        <Form
          form={saveForm}
          preserve={false}
          labelCol={{ span: 8 }}
          onFinish={handleSubmit}
        >
          <Form.Item
            label="左卷帘"
            name="leftLayer"
            //  必须填写
            rules={[{ required: true }]}
          >
            <Select options={[]} onChange={handleLayerChange} />
          </Form.Item>
          <Form.Item
            label="右卷帘"
            name="rightLayer"
            rules={[{ required: true }]}
          >
            <Select options={[]} onChange={handleLayerChange} />
          </Form.Item>
          <div className={styles.btns}>
            <Button
              onClick={() => {
                setopenPopupSwipeControl(false);
                setopenSwipeControl(false);
              }}
            >
              取消
            </Button>
            <Button
              style={{ marginLeft: "10px" }}
              type="primary"
              htmlType="submit"
            >
              确认
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};
