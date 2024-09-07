import { type ChangeEvent, useCallback, useState, useEffect } from "react";
import { Button, Input, InputNumber, Slider, message } from "antd";
import {
  ArrowLeftOutlined,
  MinusCircleTwoTone,
  PlusCircleTwoTone,
} from "@ant-design/icons";
import styles from "./index.module.scss";
import {
  initState,
  setCurrent,
  setGradeCritierion,
  setGradeCritierion as setRates,
  toogleOpen,
} from "@/store/slices/templateSlice";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { createTemplate, editTemplate } from "@/request/template";
import { Dayjs } from "dayjs";
import { eventEmitter } from "@/utils/events";
import { toJSON } from "@/utils/common";

interface Rate {
  key: string;
  value: number;
}

interface RateProps {
  isEdit: boolean;
  detail: Record<string, any>;
  status?: number;
}

const RateComponent: React.FC<RateProps> = ({ isEdit, detail, status }) => {
  const dispatch = useAppDispatch();
  const {
    gradeCriterionJson: rates,
    practiceTemplate,
    reportDict,
    practiceTaskTemplates,
  } = useAppSelector((slice) => slice.template);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (detail?.practiceTemplate?.gradeCriterionJson) {
      const gradeCriterionJson = detail.practiceTemplate.gradeCriterionJson;
      dispatch(setGradeCritierion(JSON.parse(gradeCriterionJson)));
    }
  }, [detail]);

  const handleAdd = useCallback(() => {
    dispatch(setRates([...rates, { key: "评分项", value: 0 }]));
  }, [rates]);

  const handleDelete = useCallback(
    (index: number) => {
      const newRates = rates.filter((r, i) => i !== index);
      dispatch(setRates([...newRates]));
    },
    [rates]
  );

  const onSlideChange = (percentage: number, index: number) => {
    const newRates = [...rates];
    newRates[index] = { ...newRates[index], percentage: percentage };
    dispatch(setRates([...newRates]));
    const totalScore = newRates
      .map((rate) => rate.percentage)
      .reduce((pre, next) => {
        return pre + next;
      }, 0);
    if (totalScore > 100) {
      setMsg("加权百分比不能大于1");
    } else if (totalScore < 100) {
      setMsg("加权百分比不能小于1");
    } else {
      setMsg("");
    }
  };

  const onTextChange = (value: string, index: number) => {
    const newRates = [...rates];
    newRates[index] = { ...newRates[index], key: value };
    dispatch(setRates([...newRates]));
  };

  const handleSubmit = useCallback(async () => {
    if (!practiceTaskTemplates.length) {
      message.warning("请选创建实习任务！");
      return;
    }
    if (detail?.practiceTemplate && detail?.practiceTaskTemplates) {
      if (status === 1) {
        editTemplate({
          practiceTemplate: {
            ...detail.practiceTemplate,
            ...practiceTemplate,
            reportDict: toJSON(reportDict),
            gradeCriterionJson: toJSON(rates),
          },
          practiceTaskTemplates: practiceTaskTemplates.map((task, index) => ({
            ...detail.practiceTaskTemplates[index],
            ...task,
            status: task.status || 1,
            providedAlgorithmsIds: task.providedAlgorithmsIds,
          })),
        })
          .then((resp) => {
            message.success("编辑课程成功！");
            dispatch(toogleOpen(false));
            dispatch(initState());
            eventEmitter.emit("update:template");
          })
          .catch((err) => {
            console.error(err);
            message.error("编辑课程失败！");
          });
      } else {
        createTemplate({
          practiceTemplate: {
            ...detail.practiceTemplate,
            ...practiceTemplate,
            reportDict: toJSON(reportDict),
            gradeCriterionJson: toJSON(rates),
          },
          practiceTaskTemplates: practiceTaskTemplates.map((task, index) => ({
            ...detail.practiceTaskTemplates[index],
            ...task,
            status: task.status || 1,
            providedAlgorithmsIds: task.providedAlgorithmsIds,
          })),
        })
          .then((resp) => {
            message.success("编辑课程成功！");
            dispatch(toogleOpen(false));
            dispatch(initState());
            eventEmitter.emit("update:template");
          })
          .catch((err) => {
            console.error(err);
            message.error("编辑课程失败！");
          });
      }
    } else {
      createTemplate({
        // @ts-ignore
        practiceTemplate: {
          ...practiceTemplate,
          reportDict: toJSON(reportDict),
          gradeCriterionJson: toJSON(rates),
        },
        practiceTaskTemplates: practiceTaskTemplates.map((task, index) => ({
          ...task,
          status: task.status || 1,
          providedAlgorithmsIds: toJSON(task.providedAlgorithmsIds),
          providedDataIds: toJSON(task.providedDataIds),
          resultsRequirementIds: toJSON(task.resultsRequirementIds),
          taskAttachmentIds: toJSON(task.taskAttachmentIds),
        })),
      })
        .then((resp) => {
          message.success("创建课程成功！");
          dispatch(toogleOpen(false));
          dispatch(initState());
          eventEmitter.emit("update:template");
        })
        .catch((err) => {
          message.error("创建课程失败！");
          console.error(err);
        });
    }
  }, [rates]);

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        实习内容
        {isEdit ? (
          <PlusCircleTwoTone
            onClick={handleAdd}
            style={{ fontSize: 18, cursor: "pointer", marginLeft: 5 }}
          />
        ) : null}
      </div>
      <ul className={styles.tips}>
        <li className={styles.tip}>加权百分比的和必须为1</li>
        <li className={styles.tip}>评分项的分值区间为0~100</li>
      </ul>
      <div className={styles.message}>{msg}</div>
      <div className={styles.lines}>
        {rates.map((rate, index) => {
          return (
            <div className={styles.line} key={index}>
              {isEdit ? (
                <MinusCircleTwoTone
                  style={{ cursor: "pointer" }}
                  onClick={() => handleDelete(index)}
                />
              ) : null}
              <div className={styles.text}>
                <Input
                  disabled={!isEdit}
                  defaultValue={rate.key}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onTextChange(e.target.value, index)
                  }
                />
              </div>
              <div className={styles.progress}>
                <Slider
                  disabled={!isEdit}
                  value={rate.percentage}
                  onChange={(value) => onSlideChange(value, index)}
                />
              </div>
              <div className={styles.percentage}>
                <InputNumber
                  onChange={(value) => onSlideChange(value, index)}
                  value={rate.percentage}
                  style={{ width: 70, display: "inline-block", marginRight: 2 }}
                  min={0}
                  max={100}
                />
                %
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => dispatch(setCurrent(2))}
        >
          上一页
        </Button>
        {isEdit ? (
          <Button onClick={handleSubmit} type="primary">
            提交
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default RateComponent;
