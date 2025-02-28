interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>
    {children}
  </div>
);import React, { useState } from 'react';

// Define interfaces for type safety
interface FormData {
  workState: string;
  workCity: string;
  vacationDays: number;
  divideInto: number;
  mainPeriodMinDays: number;
  otherPeriodsMinDays: number;
  startDate: string;
  endDate: string;
}

interface VacationPeriod {
  startDate: string;
  endDate: string;
  daysCount: number;
  actualStartDate: string;
  actualEndDate: string;
  actualDaysCount: number;
}

interface SelectOption {
  value: string;
  label: string;
}

interface WarningMessageProps {
  message: string;
}

interface NumberInputFieldProps {
  label: string;
  name: keyof FormData;
  value: number;
  icon: string;
  min?: number;
  tooltip?: string | null;
  errorMessage?: string | null;
}

interface SelectFieldProps {
  label: string;
  name: keyof FormData;
  value: string;
  icon: string;
  options: SelectOption[];
  tooltip?: string | null;
}

interface DateFieldProps {
  label: string;
  name: keyof FormData;
  value: string;
  tooltip?: string | null;
}

interface CalendarMonthProps {
  month: Date;
  startDate: Date;
  endDate: Date;
  dayNames: string[];
  actualStartDate: Date;
  actualEndDate: Date;
}

interface CalendarViewProps {
  startDate: string;
  endDate: string;
  actualStartDate: string;
  actualEndDate: string;
}

const VacationCalculator: React.FC = () => {
  const [showCalendars, setShowCalendars] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [vacationPeriods, setVacationPeriods] = useState<VacationPeriod[]>([]);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // UI Components
interface FormSectionProps {
  children: React.ReactNode;
  hasBorder?: boolean;
}

const FormSection: React.FC<FormSectionProps> = ({ children, hasBorder = true }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 ${hasBorder ? 'border-b border-gray-200' : ''}`}>
    {children}
  </div>
);

interface SectionTitleProps {
  title: string;
  icon: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, icon }) => (
  <div className="font-medium text-gray-700 mb-3">
    <span className="inline-block mr-2">{icon}</span> {title}
  </div>
);

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, disabled = false, className = '', children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`px-8 py-3 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
      disabled
        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
        : 'bg-indigo-600 text-white hover:bg-indigo-700'
    } ${className}`}
  >
    {children}
  </button>
);

interface TooltipProps {
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text }) => (
  <span
    className="ml-1 text-indigo-600 cursor-help"
    title={text}
  >
    ⓘ
  </span>
);
  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const getCurrentDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getDateOneYearFromNow = (): string => {
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);
    return nextYear.toISOString().split('T')[0];
  };

  // Form state
  const [formData, setFormData] = useState<FormData>({
    workState: '',
    workCity: '',
    vacationDays: 30,
    divideInto: 3,
    mainPeriodMinDays: 14,
    otherPeriodsMinDays: 5,
    startDate: getCurrentDate(),
    endDate: getDateOneYearFromNow(),
  });

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNumberChange = (name: keyof FormData, value: string): void => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    setFormData({
      ...formData,
      [name]: numValue,
    });
  };

  const hasErrors = (): boolean => {
    return (
      new Date(formData.endDate) <= new Date(formData.startDate) ||
      formData.vacationDays <= 0 ||
      formData.divideInto <= 0 ||
      formData.mainPeriodMinDays <= 0 ||
      formData.otherPeriodsMinDays <= 0
    );
  };

  // Main calculation function
  const handleCalculate = (): void => {
    const totalDays = formData.vacationDays;
    const numPeriods = formData.divideInto;
    const mainPeriodMinDays = formData.mainPeriodMinDays;
    const otherPeriodsMinDays = formData.otherPeriodsMinDays;

    // Validate constraints
    if (mainPeriodMinDays + (numPeriods - 1) * otherPeriodsMinDays > totalDays) {
      alert('The constraints for minimum days exceed the total vacation days. Please adjust your settings.');
      return;
    }

    // Calculate how many days we have left after satisfying minimum requirements
    const remainingDays = totalDays - mainPeriodMinDays - (numPeriods - 1) * otherPeriodsMinDays;

    // Distribute remaining days evenly, with a bias towards the main period
    const daysDistribution = Array(numPeriods).fill(0);
    daysDistribution[0] = mainPeriodMinDays;
    for (let i = 1; i < numPeriods; i++) {
      daysDistribution[i] = otherPeriodsMinDays;
    }

    // Add remaining days, with slightly more going to earlier periods
    let daysLeft = remainingDays;
    let i = 0;
    while (daysLeft > 0) {
      daysDistribution[i % numPeriods] += 1;
      daysLeft--;
      i++;
    }

    // Create periods with start and end dates
    const periods: VacationPeriod[] = [];

    // Start from the search range start date
    let currentDate = new Date(formData.startDate);

    for (let i = 0; i < numPeriods; i++) {
      // Find the start date - a Monday would be ideal
      // We skip weekends because we only count workdays in our distribution
      while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        currentDate = addDays(currentDate, 1);
      }

      const startDate = new Date(currentDate);
      const workDaysNeeded = daysDistribution[i];

      // Find the end date by counting work days
      let workDaysCounted = 0;
      let endDate = new Date(startDate);

      while (workDaysCounted < workDaysNeeded) {
        endDate = addDays(endDate, 1);
        // Only count weekdays (Monday-Friday)
        if (endDate.getDay() !== 0 && endDate.getDay() !== 6) {
          workDaysCounted++;
        }
      }

      // Adjust endDate back by 1 day since the loop will go one day too far
      endDate = addDays(endDate, -1);

      // Calculate the ACTUAL consecutive days (including weekends before/after)
      // Find the previous weekend start (Saturday) if we don't start on a weekend
      let actualStartDate = new Date(startDate);
      if (actualStartDate.getDay() !== 0 && actualStartDate.getDay() !== 6) {
        // Go back to the previous Saturday
        const daysToSubtract = (actualStartDate.getDay() === 1) ? 2 : 1 + actualStartDate.getDay();
        actualStartDate = addDays(actualStartDate, -daysToSubtract);
      }

      // Find the next weekend end (Sunday) if we don't end on a weekend
      let actualEndDate = new Date(endDate);
      if (actualEndDate.getDay() !== 0 && actualEndDate.getDay() !== 6) {
        // Go forward to the next Sunday
        const daysToAdd = (actualEndDate.getDay() === 5) ? 2 : 7 - actualEndDate.getDay();
        actualEndDate = addDays(actualEndDate, daysToAdd);
      }

      // Calculate the actual days count (inclusive of start and end date)
      const actualDaysCount = Math.round((actualEndDate.getTime() - actualStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      periods.push({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        daysCount: workDaysNeeded,
        actualStartDate: actualStartDate.toISOString().split('T')[0],
        actualEndDate: actualEndDate.toISOString().split('T')[0],
        actualDaysCount: actualDaysCount
      });

      // Set next start date to day after actual end date plus a buffer (1 week)
      currentDate = addDays(actualEndDate, 8);
    }

    setVacationPeriods(periods);
    setShowCalendars(true);
    setActiveTab(0);
  };

  // Component for warning messages
  const WarningMessage: React.FC<WarningMessageProps> = ({ message }) => {
    return (
      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
        <span className="inline-block mr-2">⚠️</span>
        {message}
      </div>
    );
  };

  // Component for number inputs
  const NumberInputField: React.FC<NumberInputFieldProps> = ({
    label, name, value, icon, min = 0, tooltip = null, errorMessage = null
  }) => {
    const hasError = value <= 0;

    return (
      <div className="space-y-2">
        <label className="block font-medium text-gray-700">
          <span className="inline-block mr-2">{icon}</span> {label}
          {tooltip && <Tooltip text={tooltip} />}
        </label>
        <input
          type="number"
          name={name}
          value={value}
          onChange={(e) => handleNumberChange(name, e.target.value)}
          min={min}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {hasError && errorMessage && <WarningMessage message={errorMessage} />}
      </div>
    );
  };

  // Component for select inputs
  const SelectField: React.FC<SelectFieldProps> = ({
    label, name, value, icon, options, tooltip = null
  }) => {
    return (
      <div className="space-y-2">
        <label className="block font-medium text-gray-700">
          <span className="inline-block mr-2">{icon}</span> {label}
          {tooltip && <Tooltip text={tooltip} />}
        </label>
        <select
          name={name}
          value={value}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  // Component for date inputs
  const DateField: React.FC<DateFieldProps> = ({
    label, name, value, tooltip = null
  }) => {
    return (
      <div className="space-y-2">
        <label className="block text-gray-700">
          {label}
          {tooltip && <Tooltip text={tooltip} />}
        </label>
        <input
          type="date"
          name={name}
          value={value}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    );
  };

  // Component for calendar month display
  const CalendarMonth: React.FC<CalendarMonthProps> = ({
    month, startDate, endDate, dayNames, actualStartDate, actualEndDate
  }) => {
    const monthName = month.toLocaleString('default', { month: 'long' });
    const year = month.getFullYear();
    const daysInMonth = new Date(year, month.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month.getMonth(), 1).getDay();

    // Create array of days in month
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null); // Empty cells for days before the 1st
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return (
      <div className="text-center">
        <h4 className="font-medium mb-2">{monthName} {year}</h4>
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map(day => (
            <div key={day} className="text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}

          {days.map((day, index) => {
            const currentDate = day ? new Date(year, month.getMonth(), day) : null;

            // Check if the day is a work vacation day (only count weekdays: Monday-Friday)
            const isVacationDay = currentDate &&
                                  currentDate >= startDate &&
                                  currentDate <= endDate &&
                                  currentDate.getDay() >= 1 && currentDate.getDay() <= 5; // Monday (1) through Friday (5)

            // Check if the day is a weekend day during vacation period
            const isExtendedDay = currentDate &&
                                  currentDate >= actualStartDate &&
                                  currentDate <= actualEndDate &&
                                  (currentDate.getDay() === 0 || currentDate.getDay() === 6); // Only Sunday (0) or Saturday (6)

            return (
              <div
                key={index}
                className={`text-sm py-1 rounded-full ${
                  !day ? 'text-transparent' :
                  isVacationDay ? 'bg-indigo-500 text-white font-medium' :
                  isExtendedDay ? 'bg-indigo-100 text-indigo-800 font-medium' :
                  'text-gray-700'
                }`}
              >
                {day || '.'}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Component for calendar view
  const CalendarView: React.FC<CalendarViewProps> = ({
    startDate, endDate, actualStartDate, actualEndDate
  }) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const actualStart = new Date(actualStartDate);
    const actualEnd = new Date(actualEndDate);

    // Calculate months to display
    const months: Date[] = [];
    const displayStart = actualStart;
    const displayEnd = actualEnd;
    const currentMonth = new Date(displayStart.getFullYear(), displayStart.getMonth(), 1);
    const lastMonth = new Date(displayEnd.getFullYear(), displayEnd.getMonth(), 1);

    while (currentMonth <= lastMonth) {
      months.push(new Date(currentMonth));
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    // Get day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {months.map((month, monthIndex) => (
            <CalendarMonth
              key={monthIndex}
              month={month}
              startDate={start}
              endDate={end}
              dayNames={dayNames}
              actualStartDate={actualStart}
              actualEndDate={actualEnd}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-indigo-500 rounded-full mr-2"></div>
            <span className="text-sm">Work Days Off</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-indigo-100 rounded-full mr-2"></div>
            <span className="text-sm">Extended Weekend Days</span>
          </div>
        </div>
      </div>
    );
  };

  // Options for select fields
  const countryOptions: SelectOption[] = [
    { value: '', label: 'Select country' },
    { value: 'US', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' }
  ];

  const stateOptions: SelectOption[] = [
    { value: '', label: 'Select state' },
    { value: 'California', label: 'California' },
    { value: 'New York', label: 'New York' },
    { value: 'Texas', label: 'Texas' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 mb-2">Vacation Calculator</h1>
          <p className="text-lg text-gray-600">Plan your vacation considering holidays and work days</p>
        </header>

        <Card className="mb-8">
          {/* Header with minimize button */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Vacation Calculator</h2>
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? '+' : '-'}
            </button>
          </div>

          {/* Calculator content - conditionally shown based on minimized state */}
          {!isMinimized && (
            <div className="p-6">
              {/* Work Country and State */}
              <FormSection>
                <SelectField
                  label="Work Country"
                  name="workState"
                  value={formData.workState}
                  icon="🌎"
                  options={countryOptions}
                  tooltip="Select the country where you work"
                />

                <SelectField
                  label="Work State"
                  name="workCity"
                  value={formData.workCity}
                  icon="🏙️"
                  options={stateOptions}
                  tooltip="Select the state where you work"
                />
              </FormSection>

              {/* Days info */}
              <FormSection>
                <NumberInputField
                  label="Vacation Days"
                  name="vacationDays"
                  value={formData.vacationDays}
                  icon="📆"
                  min={1}
                  tooltip="Total number of vacation days available"
                  errorMessage="Vacation days must be greater than 0"
                />

                <NumberInputField
                  label="Divide into up to"
                  name="divideInto"
                  value={formData.divideInto}
                  icon="🔢"
                  min={1}
                  tooltip="Divide vacation into parts"
                  errorMessage="Number of periods must be at least 1"
                />
              </FormSection>

              {/* Minimum Days Requirements */}
              <FormSection>
                <NumberInputField
                  label="Main period must be at least"
                  name="mainPeriodMinDays"
                  value={formData.mainPeriodMinDays}
                  icon="⏱️"
                  min={1}
                  tooltip="At least one period must have this many consecutive days"
                  errorMessage="Main period length must be at least 1 day"
                />

                <NumberInputField
                  label="Other periods minimum length"
                  name="otherPeriodsMinDays"
                  value={formData.otherPeriodsMinDays}
                  icon="⌛"
                  min={1}
                  tooltip="All other periods must be at least this long"
                  errorMessage="Other periods length must be at least 1 day"
                />
              </FormSection>

              {/* Search Period */}
              <FormSection hasBorder={false}>
                <SectionTitle title="Search Period" icon="🗓️" />
                <div className="col-span-1 md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DateField
                      label="Start Date"
                      name="startDate"
                      value={formData.startDate}
                      tooltip="First date to consider for vacation planning"
                    />
                    <DateField
                      label="End Date"
                      name="endDate"
                      value={formData.endDate}
                      tooltip="Last date to consider for vacation planning"
                    />
                  </div>
                  {new Date(formData.endDate) <= new Date(formData.startDate) && (
                    <WarningMessage message="End date must be after start date" />
                  )}
                </div>
              </FormSection>

              {/* Calculate Button */}
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8">
                <div className="text-indigo-600 font-medium mb-4 sm:mb-0">All set? Let's calculate?</div>
                <Button
                  onClick={handleCalculate}
                  disabled={hasErrors()}
                >
                  Calculate
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Calendar Tabs Display - Shown outside the main container */}
        {showCalendars && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Vacation Periods</h2>

            {/* Tabs */}
            <div className="flex w-full border-b border-gray-200 mb-4">
              {vacationPeriods.map((period, index) => (
                <button
                  key={index}
                  className={`py-2 px-4 font-medium flex-1 text-center ${
                    activeTab === index
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab(index)}
                >
                  Period {index + 1}
                </button>
              ))}
            </div>

            {/* Calendar View */}
            <Card className="p-4">
              {vacationPeriods.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <CalendarView
                    startDate={vacationPeriods[activeTab].startDate}
                    endDate={vacationPeriods[activeTab].endDate}
                    actualStartDate={vacationPeriods[activeTab].actualStartDate}
                    actualEndDate={vacationPeriods[activeTab].actualEndDate}
                  />
                </div>
              )}
            </Card>
          </div>
        )}

        <footer className="text-center text-gray-500 text-sm mt-8 pt-4 border-t border-gray-200">
          Created by <a href="https://github.com/marco-carvalho" className="text-indigo-500 hover:text-indigo-700" target="_blank" rel="noopener noreferrer">Marco Carvalho</a>
        </footer>
      </div>
    </div>
  );
};

export default VacationCalculator;