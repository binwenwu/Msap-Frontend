import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const templateState: TemplateState = {
    open: false,
    current: 0,
    practiceTemplate: {
        id: null,
        name: "",
        creatorUid: null,
        creatorName: "",
        submitReport: null, // 是否提交报告 0 不提交 1 不提交
        intro: "",
        coverPicPath: "",
        endTime: "",
    },
    gradeCriterionJson: [],
    reportDict: [],
    practiceTaskTemplates: [],
};
const templateSlice = createSlice({
    name: "template",
    initialState: templateState,
    reducers: {
        toogleOpen: (state, action: PayloadAction<boolean>) => {
            state.open = action.payload;
        },
        setCurrent: (state, action: PayloadAction<number>) => {
            state.current = action.payload;
        },
        setBaseInfo: (
            state,
            action: PayloadAction<TemplateState["practiceTemplate"]>
        ) => {
            state.practiceTemplate = action.payload;
        },
        setReport: (
            state,
            action: PayloadAction<TemplateState["reportDict"]>
        ) => {
            state.reportDict = action.payload;
        },
        setGradeCritierion: (
            state,
            action: PayloadAction<TemplateState["gradeCriterionJson"]>
        ) => {
            state.gradeCriterionJson = action.payload;
        },
        setTaskTemplate: (
            state,
            action: PayloadAction<TemplateState["practiceTaskTemplates"]>
        ) => {
            state.practiceTaskTemplates = action.payload;
        },
        initState: (state) => {
            state.current = 0;
            state.gradeCriterionJson = [];
            state.practiceTaskTemplates = [];
            state.practiceTemplate = {
                id: null,
                name: "",
                creatorUid: null,
                creatorName: "",
                submitReport: null,
                intro: "",
                coverPicPath: "",
                endTime: "",
            };
            state.reportDict = [];
        },
    },
});

export const {
    toogleOpen,
    setCurrent,
    setBaseInfo,
    setTaskTemplate,
    setGradeCritierion,
    setReport,
    initState,
} = templateSlice.actions;

export default templateSlice.reducer;
