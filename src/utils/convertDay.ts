import { useTranslation } from "react-i18next";
import { normalizeDayOfWeek } from "./dayMapping";

const useConvertDayOfWeek = () => {
    const { t } = useTranslation();

    const convertDayOfWeek = (dayOfWeek: string | number): string => {
        // Normalize the day to a consistent string format
        const normalizedDay = normalizeDayOfWeek(dayOfWeek);
        
        // Log the conversion for debugging
        console.log(`Converting day: ${dayOfWeek} (normalized: ${normalizedDay})`);
        
        // Translate the normalized day
        return t(`days.${normalizedDay}`, { defaultValue: normalizedDay });
    };

    return { convertDayOfWeek };
};

export default useConvertDayOfWeek;
