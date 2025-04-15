import * as React from 'react';
import { useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {RootState, useAppDispatch} from '../../../state/store';
import { useSelector } from 'react-redux';
import { fetchLessonTimes } from '../../../state/LessonTime/Reducer';
import { fetchTimetables } from '../../../state/Timetable/Reducer';
import { setSelectedWeek } from '../../../state/Timetable/Action';
import {addDays, isSameDay, parse} from 'date-fns';
import {periods, rooms} from '../../../utils/utilsTimetable';


import SelectWeek from "../SelectWeek.tsx";
import ScheduleHeader from "./ScheduleHeader.tsx";
import ScheduleBody from "./ScheduleBody.tsx";
import './Tooltip.css';
import './Schedule.css'
import {useTranslation} from "react-i18next";

const ScheduleTable: React.FC = () => {
    const {t}=useTranslation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const selectedWeek = useSelector((state: RootState) => state.timetable.selectedWeek);

    const {
        lessonTimes,
        isLoading: isLoadingLessonTimes,
        error: errorLessonTimes,
    } = useSelector((state: RootState) => state.lessonTime);
    const {
        timetables,
        isLoading: isLoadingTimetables,
        error: errorTimetables,
    } = useSelector((state: RootState) => state.timetable);

    useEffect(() => {
        // Try to fetch lesson times with current authentication
        dispatch(fetchLessonTimes())
            .unwrap()
            .catch(error => {
                console.error("Error fetching lesson times:", error);
                // Don't handle auth errors here - let the interceptor do its job
            });
    }, [dispatch]);

    // Add a new useEffect to ensure timetables are loaded initially regardless of user interaction
    useEffect(() => {
        if (selectedWeek && !timetables.length && !isLoadingTimetables) {
            console.log('Initial timetable fetch for:', selectedWeek);
            dispatch(fetchTimetables({ startDate: selectedWeek.startDate, endDate: selectedWeek.endDate }))
                .unwrap()
                .catch(error => {
                    console.error("Error fetching initial timetables:", error);
                });
        } else if (!selectedWeek && !isLoadingTimetables) {
            // If no week is selected, use a default week that we know has data
            const defaultWeek = { startDate: '03/02/2025', endDate: '09/02/2025' };
            console.log('No week selected, using default week:', defaultWeek);
            dispatch(setSelectedWeek(defaultWeek));
            dispatch(fetchTimetables({ 
                startDate: defaultWeek.startDate, 
                endDate: defaultWeek.endDate 
            }));
        }
    }, [selectedWeek, timetables.length, dispatch, isLoadingTimetables]);

    const handleWeekChange = (week: { startDate: string; endDate: string }) => {
        // Always dispatch the selected week and fetch timetables
        dispatch(setSelectedWeek(week));
        dispatch(fetchTimetables({ startDate: week.startDate, endDate: week.endDate }));
        console.log('Week changed to:', week);
    };

    const daysOfWeek: string[] = t("timetable.scheduleTableHeader.daysOfWeek", { returnObjects: true }) as string [];
    console.log("UI days of week:", daysOfWeek);
    
    // Debug what days the API is returning
    useEffect(() => {
        if (timetables.length > 0) {
            const apiDays = [...new Set(timetables.map(item => item.dayOfWeek))];
            
            console.log("----- TIMETABLE DEBUG -----");
            console.log(`Found ${timetables.length} timetable records`);
            console.log(`API days of week: ${apiDays.join(', ')}`);
            console.log(`UI days of week: ${daysOfWeek.join(', ')}`);
            console.log("---------------------------");
            
            // Print a sample timetable entry
            console.log("Sample timetable item:", {
                id: timetables[0].id,
                dayOfWeek: timetables[0].dayOfWeek,
                courseName: timetables[0].courses?.[0]?.name || 'No course',
                room: timetables[0].room?.name,
                startLesson: timetables[0].startLessonTime?.lessonNumber,
                endLesson: timetables[0].endLessonTime?.lessonNumber,
                instructor: timetables[0].instructor?.user?.fullName || 'No instructor'
            });
        }
    }, [timetables, daysOfWeek]);

    const handleCourseClick = (
        courseId: string | null,
        NH: string | null,
        TH: string | null,
        studyTime: string | null,
        timetableName: string | null
    ) => {
        if (courseId && NH && TH && studyTime) {
            navigate(`/courses/${courseId}/${NH}/${TH}/${studyTime}`, {
                state: { selectedWeek },
            });
        } else if (timetableName) {
            navigate(`/courses/${timetableName}`, {
                state: { selectedWeek },
            });
        }
    };

    const getScheduleItems = (dayOfWeek: string, period: number, roomName: string) => {
        if (!selectedWeek) return [];

        const startDate = parse(selectedWeek.startDate, 'dd/MM/yyyy', new Date());

        if (isNaN(startDate.getTime())) return [];
        
        console.log(`Finding timetables for day: ${dayOfWeek}, period: ${period}, room: ${roomName}`);
        
        if (timetables.length === 0) {
            console.log("No timetables available to filter");
            return [];
        }

        // Direct mapping between UI day names and API day string values
        const uiToApiDayMap: { [key: string]: string } = {
            'Monday': 'MONDAY',
            'Tuesday': 'TUESDAY',
            'Wednesday': 'WEDNESDAY',
            'Thursday': 'THURSDAY',
            'Friday': 'FRIDAY',
            'Saturday': 'SATURDAY',
            'Sunday': 'SUNDAY'
        };
        
        // Get the exact API day string for this UI day
        const expectedApiDay = uiToApiDayMap[dayOfWeek];
        
        if (!expectedApiDay) {
            console.log(`No API day format mapping found for UI day "${dayOfWeek}"`);
            return [];
        }
        
        console.log(`UI day "${dayOfWeek}" maps to API day string: "${expectedApiDay}"`);

        // Find items that match the exact API day string format
        const matchingItems = timetables.filter(item => {
            if (!item || !item.dayOfWeek || !item.startLessonTime || !item.endLessonTime || !item.room) {
                return false;
            }
            
            // Check if cancelled
            if (Array.isArray(item.cancelDates) && item.cancelDates.some(date => {
                const canceledDate = parse(date, 'dd/MM/yyyy', new Date());
                const daysOffset = daysOfWeek.indexOf(dayOfWeek);
                const currentDayOfWeekDate = addDays(startDate, daysOffset);
                return isSameDay(canceledDate, currentDayOfWeekDate);
            })) {
                return false;
            }
            
            // Direct string comparison with the API's day format
            const dayMatches = item.dayOfWeek === expectedApiDay;
            
            // Check other criteria
            const periodMatches = 
                item.startLessonTime.lessonNumber <= period && 
                item.endLessonTime.lessonNumber >= period;
                
            const roomMatches = item.room.name === roomName;
            
            const matches = dayMatches && periodMatches && roomMatches;
            
            if (matches) {
                console.log(`Found match: API day "${item.dayOfWeek}" matches expected day "${expectedApiDay}" for UI day "${dayOfWeek}", room ${item.room.name}, period ${item.startLessonTime.lessonNumber}-${item.endLessonTime.lessonNumber}`);
            }
            
            return matches;
        });
        
        console.log(`Found ${matchingItems.length} matches for day "${dayOfWeek}"`);
        return matchingItems;
    };

    const getLessonTime = (period: number) => {
        return lessonTimes?.find((lesson) => lesson.lessonNumber === period);
    };

    if (isLoadingLessonTimes || isLoadingTimetables)
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                <CircularProgress />
            </Box>
        );
    if (errorLessonTimes)
        return (
            <Alert severity="error">{t('timetable.scheduleTable.errors.lessonTime',{error:errorLessonTimes})}</Alert>
        );
    if (errorTimetables)
        return <Alert severity="error">{t('timetable.scheduleTable.errors.timetable',{error:errorTimetables})}</Alert>;

    return (
        <Box className="container mx-auto px-3 py-5">
            <Typography variant="h4" align="center" gutterBottom>
                {selectedWeek
                    ? t('timetable.scheduleTable.title',{startDate:selectedWeek.startDate,endDate:selectedWeek.endDate})
                    : t('timetable.scheduleTable.defaultTitle')}
            </Typography>
            <SelectWeek onWeekChange={handleWeekChange} initialWeek={selectedWeek} />
            <Box className="overflow-x-auto mt-4">
                {timetables.length === 0 && !isLoadingTimetables ? (
                    <Alert severity="info">{t('timetable.scheduleTable.noData', 'No timetable data available for the selected week.')}</Alert>
                ) : (
                    <table className="w-full table-fixed border-collapse">
                        <ScheduleHeader daysOfWeek={daysOfWeek} rooms={rooms} />
                        <ScheduleBody
                            rooms={rooms}
                            periods={periods}
                            daysOfWeek={daysOfWeek}
                            timetables={timetables}
                            selectedWeek={selectedWeek}
                            getScheduleItems={getScheduleItems}
                            getLessonTime={getLessonTime}
                            handleCourseClick={handleCourseClick}
                        />
                    </table>
                )}
            </Box>
        </Box>
    );
};

export default ScheduleTable;
