import { message, Button, Modal, Tree } from "antd";
import { useEffect, useRef, useState } from "react";
import type { TreeProps } from "antd";
import { jupyterhubData, sendJupyterhub } from "@/request/person";

interface Props {}
interface TreeNode {
  name: string;
  path: string;
  children?: TreeNode[];
  flag: boolean;
  isDirectory: boolean;
}

const DevelopCenter: React.FC<Props> = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [treeData, setTreeData] = useState([]);
  const [jupyterUrl, setJupyterUrl] = useState(
    "http://www.openge.org.cn/jupyterhub/hub/login"
  );

  useEffect(() => {
    const token = localStorage.getItem("education-token");
    setJupyterUrl(jupyterUrl + `?token=${token}`);
  }, []);

  const showModal = async () => {
    setCheckedKeys([]);
    setSelectedKeys([]);
    const username = localStorage.getItem("education-sno");
    const res = await jupyterhubData(username);
    const data = res.children.map((item: TreeNode) => ({
      title: item.name,
      key: item.path,
      children: item.children
        ? item.children.map((item: TreeNode) => ({
            title: item.name,
            key: item.path,
            children: item.children
              ? item.children.map((item: TreeNode) => ({
                  title: item.name,
                  key: item.path,
                }))
              : null,
          }))
        : null,
    }));
    setTreeData(data);
    setIsModalOpen(true);
  };
  useEffect(() => {
    if (isModalOpen) {
      showModal();
    }
  }, [isModalOpen]);

  const handleOk = async () => {
    try {
      const filePaths = checkedKeys.filter((item) => {
        const fileExtensionRegex = /\.[^.]+$/;
        return fileExtensionRegex.test(item.toString());
      });
      const res = await sendJupyterhub(filePaths);
      message.success("提交成果成功！");
      setIsModalOpen(false);
      setTreeData([]);
    } catch (error) {
      message.warning("请选择数据！");
    }
  };
  const handleCancel = () => {
    setTreeData([]);
    setIsModalOpen(false);
  };
  // 树形结构
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const onExpand: TreeProps["onExpand"] = (expandedKeysValue) => {
    // console.log('点击前面查看', expandedKeysValue);
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };
  const onCheck: TreeProps["onCheck"] = (checkedKeysValue) => {
    // console.log('选择的数据', checkedKeysValue);
    setCheckedKeys(checkedKeysValue as React.Key[]);
  };
  const onSelect: TreeProps["onSelect"] = (selectedKeysValue, info) => {
    // console.log('我是谁1', selectedKeysValue);
    setSelectedKeys(selectedKeysValue);
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* <div dangerouslySetInnerHTML={{ __html: html }} id="xxx"></div> */}
      <iframe
        ref={iframeRef}
        src={jupyterUrl}
        frameBorder="0"
        width="100%"
        height="100%"
      />
      <Button
        onClick={showModal}
        style={{
          position: "absolute",
          top: 10,
          right: 40,
          zIndex: 1000,
        }}
        type="primary"
      >
        提交成果
      </Button>
      <Modal
        title="成果目录"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Tree
          checkable // 设置为 true 时，树的节点可以被选中（勾选
          onExpand={onExpand} // 当节点被展开或折叠时触发的事件处理器。
          expandedKeys={expandedKeys} // 一个包含当前展开节点键值的数组
          autoExpandParent={autoExpandParent} // 一个布尔值，表示是否自动展开父节点
          onCheck={onCheck} // 当节点被勾选或取消勾选时触发的事件处理器
          checkedKeys={checkedKeys} // 一个包含当前选中节点键值的数组。
          onSelect={onSelect} // 当节点被点击选中时触发的事件处理器。
          selectedKeys={selectedKeys} // 一个包含当前选中节点键值的数组。
          treeData={treeData} // 一个包含树形数据结构的数组。
        />
      </Modal>
    </div>
  );
};

export default DevelopCenter;
