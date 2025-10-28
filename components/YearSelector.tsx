import React from 'react';

interface YearSelectorProps {
    selectedYear: number;
    setSelectedYear: (year: number) => void;
}

export const YearSelector: React.FC<YearSelectorProps> = ({ selectedYear, setSelectedYear }) => {
    const years = [2024, 2023, 2022, 2021];
    return (
        <div className="mb-4">
            <label htmlFor="year-select" className="block text-lg font-medium text-yellow-300 mb-2 text-center">
                Dataset Year
            </label>
            <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
            >
                {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
        </div>
    );
};
