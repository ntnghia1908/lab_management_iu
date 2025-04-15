import React, {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';
import {CircularProgress, FormControl, InputLabel, MenuItem, Select} from '@mui/material';
import {RootState, useAppDispatch} from '../../state/store';
import {getRangeWeek} from '../../state/Timetable/Reducer';
import {SelectChangeEvent} from "@mui/material/Select";
import calculateWeeks from "../../utils/calculateWeeks";
import {setSelectedWeek} from "../../state/Timetable/Action.ts";
import {endOfDay, isWithinInterval, parse, startOfDay} from 'date-fns';
import {useTranslation} from "react-i18next"; // Import từ date-fns

interface SelectWeekProps {
    onWeekChange: (week: { startDate: string, endDate: string }) => void;
    initialWeek: { startDate: string, endDate: string } | null;
}

const SelectWeek: React.FC<SelectWeekProps> = ({ onWeekChange, initialWeek }) => {
    const {t}=useTranslation();
    const dispatch = useAppDispatch();
    const { weekRange, selectedWeek, isLoading, error } = useSelector((state: RootState) => state.timetable);
    const [weeks, setWeeks] = React.useState<Array<{ startDate: string, endDate: string }>>([]);
    const initialized = useRef(false);

    // Always fetch the current semester's week range when component mounts
    useEffect(() => {
        if (!initialized.current && !weekRange) {
            // Use semester ID 2 as we've confirmed it has data
            dispatch(getRangeWeek({semesterId: 2}))
                .unwrap()
                .then(data => {
                    console.log("Week range fetched successfully:", data);
                })
                .catch(error => {
                    console.error("Error fetching week range:", error);
                    // If error occurs, we'll try to generate some default weeks
                    const today = new Date();
                    const startDate = new Date(today);
                    startDate.setDate(today.getDate() - today.getDay()); // Start from current week's Sunday
                    
                    const lastDate = new Date(startDate);
                    lastDate.setDate(startDate.getDate() + 90); // Show 3 months of weeks
                    
                    // Format to dd/MM/yyyy
                    const firstWeekStart = startDate.toLocaleDateString('en-GB', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                    }).replace(/\//g, '/');
                    
                    const lastWeekEnd = lastDate.toLocaleDateString('en-GB', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                    }).replace(/\//g, '/');
                    
                    // Calculate weeks and set them
                    const calculatedWeeks = calculateWeeks(firstWeekStart, lastWeekEnd);
                    setWeeks(calculatedWeeks);
                    
                    // Select current week
                    const currentWeek = getCurrentWeek(calculatedWeeks);
                    if (currentWeek) {
                        dispatch(setSelectedWeek(currentWeek));
                        onWeekChange(currentWeek);
                    }
                });
            
            initialized.current = true;
        }
    }, [dispatch, weekRange]);

    // Tính toán và thiết lập danh sách tuần khi weekRange thay đổi
    useEffect(() => {
        if (weekRange?.firstWeekStart && weekRange?.lastWeekEnd && weeks.length === 0) {
            const calculatedWeeks = calculateWeeks(weekRange.firstWeekStart, weekRange.lastWeekEnd);
            setWeeks(calculatedWeeks);

            // Nếu có initialWeek từ parent, sử dụng tuần đó, không reset
            if (initialWeek) {
                dispatch(setSelectedWeek(initialWeek)); // Dispatch tuần được truyền từ parent
            } else if (!selectedWeek) {
                // Chọn tuần hiện tại lần đầu khi component mount nếu chưa có tuần nào được chọn
                const currentWeek = getCurrentWeek(calculatedWeeks);
                if (currentWeek) {
                    dispatch(setSelectedWeek(currentWeek));
                    onWeekChange(currentWeek);
                }
            }
        }
    }, [weekRange, weeks, onWeekChange, initialWeek, dispatch, selectedWeek]);

;

    //Tính toán lấy ra tuần hiện tại
    const getCurrentWeek = (weeks: Array<{ startDate: string, endDate: string }>) => {
        const today = new Date();

        return weeks.find(week => {
            const startDate = startOfDay(parse(week.startDate, 'dd/MM/yyyy', new Date()));
            const endDate = endOfDay(parse(week.endDate, 'dd/MM/yyyy', new Date()));


            return isWithinInterval(today, {start: startDate, end: endDate});
        });
    };



    const handleChange = (event: SelectChangeEvent<string>) => {
        const selectedWeekValue = event.target.value as string;
        const [startDate, endDate] = selectedWeekValue.split('--').map(date => date.trim());

        // Always update and trigger a fetch, even if it's the same week
        const newSelectedWeek = { startDate, endDate };
        dispatch(setSelectedWeek(newSelectedWeek));
        onWeekChange(newSelectedWeek); // Always call callback
    };

    // Chuyển selectedWeek thành chuỗi dạng "startDate -- endDate" để khớp với MenuItem value
    let selectedWeekValue = selectedWeek ? `${selectedWeek.startDate} -- ${selectedWeek.endDate}` : '';

    if (!weeks.find(week => `${week.startDate} -- ${week.endDate}` === selectedWeekValue)) {
        selectedWeekValue = '';
    }
    if (isLoading) {
        return <CircularProgress />;
    }

    if (error) {
        return <p>{t('timetable.selectWeek.errors.week')} {error}</p>;
    }

    return (
        <FormControl size="small">
            <InputLabel id="select-week-label">{t('timetable.selectWeek.title')}</InputLabel>
            <Select
                labelId="select-week-label"
                id="select-week"
                value={selectedWeekValue}  // Sử dụng selectedWeekValue với đúng định dạng
                onChange={handleChange}
                label="Select Week"
                variant="outlined"
            >
                {weeks.length > 0 ? (
                    weeks.map((week, index) => (
                        <MenuItem
                            key={index}
                            value={`${week.startDate} -- ${week.endDate}`}  // Sử dụng định dạng này cho value
                            sx={{
                                '&.Mui-selected': {
                                    backgroundColor: '#73f8e7',
                                    fontWeight: 'bold',
                                    color: '#000203',
                                },
                                '&:hover': {
                                    backgroundColor: '#73f8e7',
                                },
                                fontWeight: selectedWeek?.startDate === week.startDate ? 'bold' : 'normal',
                            }}
                        >
                            {t('timetable.selectWeek.content',{index:index+1,startDate:week.startDate,endDate:week.endDate})}
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem disabled>{t('timetable.selectWeek.no_data')}</MenuItem>
                )}
            </Select>
        </FormControl>
    );
};

export default SelectWeek;
