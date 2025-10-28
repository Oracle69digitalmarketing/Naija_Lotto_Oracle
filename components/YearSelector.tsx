import React from 'react';

interface YearSelectorProps {
    selectedYear: number;
    onSelectYear: (year: number) => void;
}

const YearSelector: React.FC<YearSelectorProps> = ({ selectedYear, onSelectYear }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

    return (
        <div className="flex flex-col items-center">
            <label htmlFor="year-select" className="block text-lg font-medium text-green-300 mb-2">
                Select Analysis Year
            </label>
            <div className="relative">
                <select
                    id="year-select"
                    value={selectedYear}
                    onChange={(e) => onSelectYear(parseInt(e.target.value, 10))}
                    className="block w-48 appearance-none bg-gray-700 border border-gray-600 text-white py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-gray-600 focus:border-green-500"
                >
                    {years.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default YearSelector;