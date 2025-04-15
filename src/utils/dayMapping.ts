/**
 * Maps numeric day of week values to their string equivalents.
 * The API uses numeric days (0-6) while the UI uses string day names.
 */
export const numericToDayMap: { [key: number]: string } = {
    0: 'MONDAY',
    1: 'TUESDAY', 
    2: 'WEDNESDAY',
    3: 'THURSDAY',
    4: 'FRIDAY',
    5: 'SATURDAY',
    6: 'SUNDAY'
};

/**
 * Maps string day names to their numeric equivalents.
 * Used when converting UI day names to API format.
 */
export const dayToNumericMap: { [key: string]: number } = {
    'MONDAY': 0,
    'TUESDAY': 1,
    'WEDNESDAY': 2,
    'THURSDAY': 3,
    'FRIDAY': 4,
    'SATURDAY': 5,
    'SUNDAY': 6,
    // Add Vietnamese day mappings
    'THỨ HAI': 0,
    'THỨ BA': 1,
    'THỨ TƯ': 2,
    'THỨ NĂM': 3,
    'THỨ SÁU': 4,
    'THỨ BẢY': 5,
    'CHỦ NHẬT': 6,
    // Add English UI day names
    'Monday': 0,
    'Tuesday': 1,
    'Wednesday': 2,
    'Thursday': 3,
    'Friday': 4,
    'Saturday': 5,
    'Sunday': 6
};

/**
 * Maps day names across different languages and formats
 */
export const dayMappings: { [key: string]: string } = {
    // English standard names
    'MONDAY': 'MONDAY',
    'TUESDAY': 'TUESDAY',
    'WEDNESDAY': 'WEDNESDAY',
    'THURSDAY': 'THURSDAY',
    'FRIDAY': 'FRIDAY',
    'SATURDAY': 'SATURDAY',
    'SUNDAY': 'SUNDAY',
    
    // English mixed case
    'Monday': 'MONDAY',
    'Tuesday': 'TUESDAY',
    'Wednesday': 'WEDNESDAY',
    'Thursday': 'THURSDAY',
    'Friday': 'FRIDAY',
    'Saturday': 'SATURDAY',
    'Sunday': 'SUNDAY',
    
    // Vietnamese names
    'THỨ HAI': 'MONDAY',
    'THỨ BA': 'TUESDAY',
    'THỨ TƯ': 'WEDNESDAY',
    'THỨ NĂM': 'THURSDAY',
    'THỨ SÁU': 'FRIDAY',
    'THỨ BẢY': 'SATURDAY',
    'CHỦ NHẬT': 'SUNDAY',
    
    // Short forms
    'MON': 'MONDAY',
    'TUE': 'TUESDAY',
    'WED': 'WEDNESDAY',
    'THU': 'THURSDAY',
    'FRI': 'FRIDAY',
    'SAT': 'SATURDAY',
    'SUN': 'SUNDAY',
    
    // Day numbers as strings
    '0': 'MONDAY',
    '1': 'TUESDAY',
    '2': 'WEDNESDAY',
    '3': 'THURSDAY',
    '4': 'FRIDAY',
    '5': 'SATURDAY',
    '6': 'SUNDAY',
    
    // UI names (first day)
    'FIRST': 'MONDAY',
    'SECOND': 'TUESDAY',
    'THIRD': 'WEDNESDAY',
    'FOURTH': 'THURSDAY',
    'FIFTH': 'FRIDAY',
    'SIXTH': 'SATURDAY',
    'SEVENTH': 'SUNDAY',
    
    // From API formatted days - no spaces
    'THỨHAI': 'MONDAY',
    'THỨBA': 'TUESDAY',
    'THỨTƯ': 'WEDNESDAY',
    'THỨNĂM': 'THURSDAY',
    'THỨSÁU': 'FRIDAY',
    'THỨBẢY': 'SATURDAY',
    'CHỦNHẬT': 'SUNDAY'
};

/**
 * Helper function to convert any day format (number or string) to a consistent string format
 */
export const normalizeDayOfWeek = (day: string | number): string => {
    // Handle numeric values
    if (typeof day === 'number') {
        console.log(`Converting numeric day ${day} to string format`);
        return numericToDayMap[day] || 'UNKNOWN';
    }
    
    // Handle string values
    const upperCaseDay = day.toUpperCase().trim();
    
    // Remove spaces for comparison (for Vietnamese days that might be formatted differently)
    const noSpacesDay = upperCaseDay.replace(/\s+/g, '');
    
    // Check if we have a match with spaces removed
    if (dayMappings[noSpacesDay]) {
        console.log(`Day "${day}" matched without spaces as "${dayMappings[noSpacesDay]}"`);
        return dayMappings[noSpacesDay];
    }
    
    // Check the mapping dictionary with original format
    if (dayMappings[upperCaseDay]) {
        console.log(`Day "${day}" mapped to standard format "${dayMappings[upperCaseDay]}"`);
        return dayMappings[upperCaseDay];
    }
    
    // Check for partial matches (useful for UI localized names)
    for (const [key, value] of Object.entries(dayMappings)) {
        if (upperCaseDay.includes(key) || key.includes(upperCaseDay)) {
            console.log(`Partial match: Day "${day}" mapped to standard format "${value}"`);
            return value;
        }
    }
    
    console.log(`No mapping found for day "${day}", using as-is`);
    return upperCaseDay;
};

/**
 * Determines if two day values match, regardless of their format
 */
export const areDaysMatching = (day1: string | number, day2: string | number): boolean => {
    const normalizedDay1 = normalizeDayOfWeek(day1);
    const normalizedDay2 = normalizeDayOfWeek(day2);
    
    console.log(`Comparing days: "${day1}" (normalized: "${normalizedDay1}") and "${day2}" (normalized: "${normalizedDay2}")`);
    
    // Direct match?
    if (normalizedDay1 === normalizedDay2) {
        console.log(`Days match! "${normalizedDay1}" === "${normalizedDay2}"`);
        return true;
    }
    
    // Fall back to numeric comparison for cases where one is a number and one is a string
    const numericDay1 = typeof day1 === 'number' ? day1 : dayToNumericMap[normalizedDay1];
    const numericDay2 = typeof day2 === 'number' ? day2 : dayToNumericMap[normalizedDay2];
    
    // If we can convert both to numbers, compare them
    if (numericDay1 !== undefined && numericDay2 !== undefined) {
        const numericMatch = numericDay1 === numericDay2;
        console.log(`Numeric comparison: ${numericDay1} === ${numericDay2} = ${numericMatch}`);
        return numericMatch;
    }
    
    console.log(`Days do not match: "${normalizedDay1}" !== "${normalizedDay2}"`);
    return false;
}; 