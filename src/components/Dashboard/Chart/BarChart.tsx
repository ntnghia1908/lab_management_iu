import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Bar } from "react-chartjs-2";
import {
    TextField,
    Box,
    Typography,
    CircularProgress,
    TablePagination,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
} from "@mui/material";
import { format, isValid } from "date-fns";
import { SelectChangeEvent } from "@mui/material/Select";
import { RootState, useAppDispatch } from "../../../state/store.ts";
import { getUsageTimeUsers } from "../../../state/Dashboard/Reducer.ts";


// Chart.js registration (ensure Chart.js is properly registered)
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Title,
} from "chart.js";
import {useTranslation} from "react-i18next";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Title
);

// Constants for chart appearance
const CHART_BACKGROUND_COLOR = "rgba(54, 162, 235, 0.6)";
const MAX_USAGE_TIME_COLOR = "rgba(255, 99, 132, 0.5)";
const MAX_USAGE_TIME_BORDER_COLOR = "rgba(255, 99, 132, 1)";
const MAX_USAGE_TIME = 240; // 4 hours in minutes

// Utility function to format time in seconds to hours and minutes
const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
};

// Define the shape of the filter parameters
interface FilterParams {
    date: string;
    role: string;
    page: number;
    size: number;
}

const BarChart: React.FC = () => {
    const {t}=useTranslation();
    const dispatch = useAppDispatch();
    const { usageTimeUsers, isLoading, error, totalElements } = useSelector(
        (state: RootState) => state.usage
    );

    const [filters, setFilters] = useState<FilterParams>({
        date: "",
        role: "",
        page: 0,
        size: 10,
    });

    // Fetch data whenever filters change
    useEffect(() => {
        const { date, role, page, size } = filters;
        if (date && role) {
            dispatch(getUsageTimeUsers({ date, role, page, size }));
        }
    }, [filters, dispatch]);

    // Handlers for filter changes
    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilters((prev) => ({ ...prev, date: event.target.value, page: 0 }));
    };

    const handleRoleChange = (event: SelectChangeEvent<string>) => {
        setFilters((prev) => ({ ...prev, role: event.target.value, page: 0 }));
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setFilters((prev) => ({ ...prev, page: newPage }));
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const newSize = parseInt(event.target.value, 10);
        setFilters((prev) => ({ ...prev, size: newSize, page: 0 }));
    };

    // Memoize chart data to prevent unnecessary recalculations
    const barChartData = useMemo(() => {
        return {
            labels: usageTimeUsers.map((user) => user.username),
            datasets: [
                {
                    label: t('dashboard.barchart.label1'),
                    data: usageTimeUsers.map((user) => Math.floor(user.totalUsageTime / 60)),
                    backgroundColor: CHART_BACKGROUND_COLOR,
                    type: "bar", // Ensure type is "bar"
                },
                {
                    label: t('dashboard.barchart.label2'),
                    data: usageTimeUsers.map(() => MAX_USAGE_TIME),
                    backgroundColor: MAX_USAGE_TIME_COLOR,
                    type: "line",
                    borderColor: MAX_USAGE_TIME_BORDER_COLOR,
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                },
            ],
        };
    }, [usageTimeUsers]);

    // Memoize chart options
    const chartOptions = useMemo(() => {
        const formattedDate = isValid(new Date(filters.date))
            ? format(new Date(filters.date), "dd/MM/yyyy")
            : "";

        return {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const { datasetIndex, dataIndex } = context;
                            if (datasetIndex === 0) {
                                const totalSeconds = usageTimeUsers[dataIndex]?.totalUsageTime || 0;
                                return (t('dashboard.barchart.usageTime',{time:formatTime(totalSeconds)}));
                            }
                            if (datasetIndex === 1) {
                                return (t('dashboard.barchart.maximum',{time:MAX_USAGE_TIME}));
                            }
                            return "";
                        },
                    },
                },
                legend: {
                    position: "top" as const,
                },
                title: {
                    display: true,
                    text: formattedDate
                        ? (t('dashboard.barchart.text1',{date:formattedDate,role:filters.role}))
                        : t('dashboard.barchart.text2'),
                },
            },
            scales: {
                y: {
                    ticks: {
                        stepSize: 60, // Step size in minutes
                    },
                    title: {
                        display: true,
                        text: t('dashboard.barchart.label1'),
                    },
                    suggestedMax: MAX_USAGE_TIME + 60,
                },
            },
        };
    }, [filters.date, filters.role, usageTimeUsers]);

    // Determine if data should be displayed
    const shouldDisplayData = filters.date && filters.role && usageTimeUsers.length > 0;

    return (
        <Box ml={3}>
            {/* Filters */}
            <Typography variant="h5" className="pb-7">
                {t('dashboard.barchart.title')}
            </Typography>
            <Box mb={2} display="flex" flexWrap="wrap" gap={2}>
                <TextField
                    label={t('dashboard.barchart.date')}
                    type="date"
                    value={filters.date}
                    onChange={handleDateChange}
                    slotProps={{
                        inputLabel:{
                        shrink: true,
                    }}}
                    sx={{ minWidth: 200 }}
                />
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel id="role-label">{t('dashboard.barchart.role')}</InputLabel>
                    <Select
                        labelId="role-label"
                        value={filters.role}
                        label={t('dashboard.barchart.role')}
                        onChange={handleRoleChange}
                    >
                        <MenuItem value="">
                            <em>{t('dashboard.barchart.none')}</em>
                        </MenuItem>
                        <MenuItem value="STUDENT">{t('dashboard.barchart.student')}</MenuItem>
                        <MenuItem value="TEACHER">{t('dashboard.barchart.teacher')}</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Loading State */}
            {isLoading && (
                <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                    <CircularProgress />
                </Box>
            )}

            {/* Error or No Data Message */}
            {!isLoading && (error || (!shouldDisplayData && filters.date && filters.role)) && (
                <Box textAlign="center" mt={2}>
                    <Typography color="textSecondary" variant="h6">
                        {error
                            ? t('dashboard.barchart.errors.error')
                            : t('dashboard.barchart.errors.default')}
                    </Typography>
                </Box>
            )}

            {/* Bar Chart */}
            {!isLoading && shouldDisplayData && (
                <Bar data={barChartData} options={chartOptions} />
            )}

            {/* Pagination */}
            {!isLoading && shouldDisplayData && (
                <Box mt={2} display="flex" justifyContent="center">
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={totalElements}
                        rowsPerPage={filters.size}
                        page={filters.page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage={t("pagination.rowsPerPage")}
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}
        </Box>
    );
};

export default BarChart;
