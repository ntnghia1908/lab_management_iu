import {authSlice} from "./Authentication/Action.ts";
import {combineReducers, configureStore} from "@reduxjs/toolkit";
import {useDispatch} from "react-redux";
import lessonTimeSlice from "./LessonTime/Action.ts";
import timetableSlice from "./Timetable/Action.ts";
import logsSlice from "./Dashboard/Action.ts";
import userSlice from "./User/Action.ts";
import {adminSlice} from "./Admin/Action.ts";
import usageTimeUsersSlice from "./Dashboard/UsageTimeUsersSlice.ts";
import {notifySlice} from "./Notification/Action.ts";

export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof store.getState>;

export const useAppDispatch: () => AppDispatch = useDispatch;
const rootReducer=combineReducers({
    auth:authSlice.reducer,
    timetable:timetableSlice.reducer,
    lessonTime:lessonTimeSlice.reducer,
    logs:logsSlice.reducer,
    user:userSlice.reducer,
    admin:adminSlice.reducer,
    usage:usageTimeUsersSlice.reducer,
    notify:notifySlice.reducer
});

export const store=configureStore({
    reducer:rootReducer,
})