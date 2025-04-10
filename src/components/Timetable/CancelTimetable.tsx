import React, { useEffect, useState, useCallback } from "react";
import {
    Button,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Typography,
    Paper, Box,

} from '@mui/material';
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from '../../state/store';
import { fetchTimetableByDate, cancelTimetable } from "../../state/Timetable/Reducer";
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';
import CustomAlert from "../Support/CustomAlert";
import LoadingIndicator from "../Support/LoadingIndicator";
import {useTranslation} from "react-i18next";


const CancelTimetable: React.FC = () => {
    const {t}=useTranslation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { timetableDate, isLoading, error } = useSelector((state: RootState) => state.timetable);
    const [cancelDate, setCancelDate] = useState<string>('');
    const [selectedTimetable, setSelectedTimetable] = useState<number | null>(null);

    // Snackbar state managed by CustomAlert
    const [alert, setAlert] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({
        open: false,
        message: "",
        severity: "success",
    });

    // Fetch timetables when cancelDate changes
    useEffect(() => {
        if (cancelDate) {
            dispatch(fetchTimetableByDate({ date: cancelDate }));
        }
    }, [cancelDate, dispatch]);

    // Handle cancellation of timetable
    const handleCancel = useCallback(async () => {
        if (selectedTimetable) {
            const selectedTimetableDetails = timetableDate.find(t => t.id === selectedTimetable);

            if (selectedTimetableDetails) {
                const formattedCancelDate = format(new Date(cancelDate), 'dd/MM/yyyy');

                const result = await dispatch(cancelTimetable({
                    cancelDate: formattedCancelDate,
                    startLesson: selectedTimetableDetails.startLesson,
                    roomName: selectedTimetableDetails.room.name,
                    timetableId: selectedTimetableDetails.id
                }));

                if (cancelTimetable.fulfilled.match(result)) {
                    setAlert({
                        open: true,
                        message: t('timetable.cancelTimetable.success.cancel'),
                        severity: 'success',
                    });
                    navigate("/timetable/by-week");
                } else {
                    setAlert({
                        open: true,
                        message: t('timetable.cancelTimetable.errors.cancel'),
                        severity: 'error',
                    });
                }
            }
        } else {
            setAlert({
                open: true,
                message: t('timetable.cancelTimetable.errors.default'),
                severity: 'error',
            });
        }
    }, [selectedTimetable, timetableDate, cancelDate, dispatch, navigate]);

    // Close alert
    const handleCloseAlert = useCallback(() => {
        setAlert(prev => ({ ...prev, open: false }));
    }, []);

    return (
        <Box p={3}>
            {/* Loading Indicator */}
            <LoadingIndicator open={isLoading} />

            <Paper elevation={3} sx={{ padding: 4, maxWidth: 600, margin: '0 auto' }}>
                <Typography variant="h4" gutterBottom align="center">
                    {t('timetable.cancelTimetable.title')}
                </Typography>

                {/* Date Selection */}
                <FormControl fullWidth margin="normal">
                    <TextField
                        label={t('timetable.cancelTimetable.dateCancel')}
                        type="date"
                        value={cancelDate}
                        onChange={(e) => setCancelDate(e.target.value)}
                        slotProps={{
                            inputLabel:{
                            shrink: true,
                        }}}

                        variant="outlined"
                    />
                </FormControl>

                {/* Timetable Selection */}
                {cancelDate && (
                    <>
                        {isLoading ? (
                            <Typography variant="body1" align="center">
                                {t('timetable.cancelTimetable.loading')}
                            </Typography>
                        ) : error ? (
                            <Typography variant="body1" color="error" align="center">
                                {error}
                            </Typography>
                        ) : timetableDate.length > 0 ? (
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="timetable-select-label">{t('timetable.cancelTimetable.course')}</InputLabel>
                                <Select
                                    labelId="timetable-select-label"
                                    value={selectedTimetable ?? ''}
                                    label={t('timetable.cancelTimetable.course')}
                                    onChange={(e) => setSelectedTimetable(Number(e.target.value))}
                                >
                                    {timetableDate.map((timetable) => (
                                        <MenuItem key={timetable.id} value={timetable.id}>
                                            {t('timetable.cancelTimetable.menu_item',{name:timetable.courses[0]?.name || 'NA',room:timetable.room?.name || 'N/A',startLesson:timetable.startLesson })}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : (
                            <Typography variant="body1" align="center">
                                {t('timetable.cancelTimetable.no_data')}
                            </Typography>
                        )}
                    </>
                )}

                {/* Cancel Button */}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCancel}
                    fullWidth
                    disabled={!cancelDate}
                    sx={{ mt: 3,
                        '&.Mui-disabled': {
                            color: 'rgba(255, 255, 255, 0.7)',
                            backgroundColor: 'rgba(25, 118, 210, 0.5)',
                        },}}
                >
                    {t('timetable.cancelTimetable.cancel_button')}
                </Button>
            </Paper>

            {/* Custom Alert */}
            <CustomAlert
                open={alert.open}
                message={alert.message}
                severity={alert.severity}
                onClose={handleCloseAlert}
            />
        </Box>
    );

};

export default CancelTimetable;
