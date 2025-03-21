import React, { useEffect, useState } from "react";
import Holidays, { HolidaysTypes } from "date-holidays";

const hd = new Holidays();

interface Holiday {
  date: Date;
  name: string;
}

interface FormData {
  workCountry: string;
  workState: string;
  vacationDays: number;
  divideInto: number;
  mainPeriodMinDays: number;
  otherPeriodsMinDays: number;
  startDate: Date;
  endDate: Date;
}

interface VacationPeriod {
  startDate: Date;
  endDate: Date;
  usedStartDate: Date;
  usedEndDate: Date;
  daysCount: number;
}

interface SelectOption {
  value: string | undefined;
  label: string;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface FormSectionProps {
  children: React.ReactNode;
  hasBorder?: boolean;
}

interface TooltipProps {
  text: string;
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
  tooltip: string;
  errorMessage?: string | null;
}

interface SelectFieldProps {
  label: string;
  name: keyof FormData;
  value: string;
  icon: string;
  options: SelectOption[];
  tooltip: string;
}

interface DateFieldProps {
  label: string;
  name: keyof FormData;
  value: Date;
  tooltip: string;
}

interface CalendarMonthProps {
  month: Date;
  startDate: Date;
  endDate: Date;
  usedStartDate: Date;
  usedEndDate: Date;
  dayNames: string[];
}

interface CalendarViewProps {
  startDate: Date;
  endDate: Date;
  usedStartDate: Date;
  usedEndDate: Date;
  daysCount: number;
}

const VacationCalculator: React.FC = () => {
  const [showCalendars, setShowCalendars] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [vacationPeriods, setVacationPeriods] = useState<VacationPeriod[]>([]);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  const Card: React.FC<CardProps> = ({ children, className = "" }) => (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {children}
    </div>
  );

  const FormSection: React.FC<FormSectionProps> = ({
    children,
    hasBorder = true,
  }) => (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 ${
        hasBorder ? "border-b border-gray-200" : ""
      }`}
    >
      {children}
    </div>
  );

  const Tooltip: React.FC<TooltipProps> = ({ text }) => (
    <span className="ml-1 text-indigo-600 cursor-help" title={text}>
      ⓘ
    </span>
  );

  const getCurrentDate = (): Date => {
    return new Date();
  };

  const getDateOneYearFromNow = (): Date => {
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);
    return nextYear;
  };

  const [formData, setFormData] = useState<FormData>({
    workCountry: "BR",
    workState: "",
    vacationDays: 30,
    divideInto: 3,
    mainPeriodMinDays: 14,
    otherPeriodsMinDays: 5,
    startDate: getCurrentDate(),
    endDate: getDateOneYearFromNow(),
  });

  useEffect(() => {
    const holidayCalendar = hd;
    holidayCalendar.init(formData.workCountry, formData.workState);

    const startYear = formData.startDate.getFullYear();
    const endYear = formData.endDate.getFullYear();

    const holidayList: Holiday[] = [];

    for (let year = startYear; year <= endYear; year++) {
      const yearHolidays = holidayCalendar.getHolidays(year);

      yearHolidays.forEach((h: HolidaysTypes.Holiday) => {
        const start = new Date(h.start);
        const end = new Date(h.end);

        const currentDate = new Date(start);
        while (currentDate < end) {
          holidayList.push({
            date: new Date(currentDate),
            name: h.name,
          });

          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
    }

    setHolidays(holidayList);
  }, [
    formData.endDate,
    formData.startDate,
    formData.workCountry,
    formData.workState,
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNumberChange = (name: keyof FormData, value: string): void => {
    const numValue = value === "" ? 0 : parseInt(value, 10);
    setFormData({
      ...formData,
      [name]: numValue,
    });
  };

  const hasErrors = (): boolean => {
    if (formData.endDate <= formData.startDate) return true;
    if (formData.vacationDays <= 0) return true;
    if (formData.divideInto <= 0) return true;
    if (formData.mainPeriodMinDays <= 0) return true;
    if (formData.otherPeriodsMinDays <= 0) return true;
    return false;
  };

  const isHoliday = (date: Date): boolean => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    return holidays.some((holiday) => {
      const holidayDate = new Date(holiday.date);
      holidayDate.setHours(0, 0, 0, 0);
      return holidayDate.getTime() === normalizedDate.getTime();
    });
  };

  const isWeekendOrHoliday = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6 || isHoliday(date);
  };

  const handleCalculate = (): void => {
    const {
      vacationDays,
      divideInto,
      mainPeriodMinDays,
      otherPeriodsMinDays,
      startDate,
    } = formData;

    const minimumDaysRequired =
      mainPeriodMinDays + (divideInto - 1) * otherPeriodsMinDays;

    if (minimumDaysRequired > vacationDays) {
      const maxPossiblePeriods =
        Math.floor((vacationDays - mainPeriodMinDays) / otherPeriodsMinDays) +
        1;
      setFormData({
        ...formData,
        divideInto: maxPossiblePeriods,
      });
      return;
    }

    const remainingDays = vacationDays - minimumDaysRequired;

    const daysDistribution = Array(divideInto).fill(0);
    daysDistribution[0] = mainPeriodMinDays;
    for (let i = 1; i < divideInto; i++) {
      daysDistribution[i] = otherPeriodsMinDays;
    }

    let daysLeft = remainingDays;
    let i = 0;
    while (daysLeft > 0) {
      daysDistribution[i % divideInto] += 1;
      daysLeft--;
      i++;
    }

    const periods: VacationPeriod[] = [];
    let currentStartDate = new Date(startDate);

    const calculateExtraStartDate = (vacationStartDate: Date): Date => {
      const extraStartDate = new Date(vacationStartDate);
      const tempDate = new Date(vacationStartDate);
      tempDate.setDate(tempDate.getDate() - 1);

      while (isWeekendOrHoliday(tempDate)) {
        extraStartDate.setDate(extraStartDate.getDate() - 1);
        tempDate.setDate(tempDate.getDate() - 1);
      }

      return extraStartDate;
    };

    const calculateExtraEndDate = (vacationEndDate: Date): Date => {
      const extraEndDate = new Date(vacationEndDate);
      const tempDate = new Date(vacationEndDate);
      tempDate.setDate(tempDate.getDate() + 1);

      while (isWeekendOrHoliday(tempDate)) {
        extraEndDate.setDate(extraEndDate.getDate() + 1);
        tempDate.setDate(tempDate.getDate() + 1);
      }

      return extraEndDate;
    };

    const checkForOverlaps = (
      startDate: Date,
      endDate: Date,
      existingPeriods: VacationPeriod[],
      minGapBetweenPeriods: number
    ): boolean => {
      const bufferStartDate = new Date(startDate);
      bufferStartDate.setDate(bufferStartDate.getDate() - minGapBetweenPeriods);

      const bufferEndDate = new Date(endDate);
      bufferEndDate.setDate(bufferEndDate.getDate() + minGapBetweenPeriods);

      for (const period of existingPeriods) {
        if (
          (bufferStartDate <= period.endDate && bufferEndDate >= period.startDate)
        ) {
          return true;
        }
      }

      return false;
    };

    const calculateTotalDaysOff = (period: VacationPeriod): number => {
      const totalDays = Math.floor(
        (period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

      return totalDays;
    };

    const findBestAvailablePeriod = (
      startDate: Date,
      existingPeriods: VacationPeriod[],
      daysCount: number,
      minGapBetweenPeriods: number = 3,
      maxDaysToCheck: number = 120
    ): VacationPeriod => {
      const currentDate = new Date(startDate);
      const candidatePeriods: { period: VacationPeriod; totalDaysOff: number }[] = [];
      const maxSearchDate = new Date(startDate);
      maxSearchDate.setDate(maxSearchDate.getDate() + maxDaysToCheck);

      while (currentDate <= maxSearchDate) {
        if (
          currentDate.getDay() !== 0 &&
          currentDate.getDay() !== 6 &&
          !isHoliday(currentDate)
        ) {
          const vacationStartDate = new Date(currentDate);
          const vacationEndDate = new Date(vacationStartDate);
          vacationEndDate.setDate(vacationStartDate.getDate() + daysCount - 1);

          const extraStartDate = calculateExtraStartDate(vacationStartDate);
          const extraEndDate = calculateExtraEndDate(vacationEndDate);

          const overlaps = checkForOverlaps(
            extraStartDate,
            extraEndDate,
            existingPeriods,
            minGapBetweenPeriods
          );

          if (!overlaps) {
            const period: VacationPeriod = {
              startDate: extraStartDate,
              endDate: extraEndDate,
              usedStartDate: vacationStartDate,
              usedEndDate: vacationEndDate,
              daysCount: daysCount
            };

            const totalDaysOff = calculateTotalDaysOff(period);
            candidatePeriods.push({ period, totalDaysOff });
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (candidatePeriods.length === 0) {
        throw new Error("Could not find any valid vacation period within the search range");
      }

      candidatePeriods.sort((a, b) => {
        if (b.totalDaysOff !== a.totalDaysOff) {
          return b.totalDaysOff - a.totalDaysOff;
        }

        const diffA = Math.abs(a.period.usedStartDate.getTime() - startDate.getTime());
        const diffB = Math.abs(b.period.usedStartDate.getTime() - startDate.getTime());
        return diffA - diffB;
      });

      return candidatePeriods[0].period;
    };

    for (let i = 0; i < divideInto; i++) {
      const daysTarget = daysDistribution[i];

      const optimalPeriod = findBestAvailablePeriod(
        currentStartDate,
        periods,
        daysTarget,
        3
      );

      periods.push(optimalPeriod);

      currentStartDate = new Date(optimalPeriod.endDate);
      currentStartDate.setDate(currentStartDate.getDate() + 120);
    }

    setVacationPeriods(periods);
    setShowCalendars(true);
    setActiveTab(0);
  };

  const WarningMessage: React.FC<WarningMessageProps> = ({ message }) => {
    return (
      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
        <span className="inline-block mr-2">⚠️</span>
        {message}
      </div>
    );
  };

  const NumberInputField: React.FC<NumberInputFieldProps> = ({
    label,
    name,
    value,
    icon,
    min = 0,
    tooltip = null,
    errorMessage = null,
  }) => {
    const hasError = value <= 0;

    return (
      <div className="space-y-2">
        <label className="block text-gray-700">
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

  const SelectField: React.FC<SelectFieldProps> = ({
    label,
    name,
    value,
    icon,
    options,
    tooltip = null,
  }) => {
    return (
      <div className="space-y-2">
        <label className="block text-gray-700">
          <span className="inline-block mr-2">{icon}</span> {label}
          {tooltip && <Tooltip text={tooltip} />}
        </label>
        <select
          name={name}
          value={value}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const DateField: React.FC<DateFieldProps> = ({
    label,
    name,
    value,
    tooltip = null,
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
          value={value.toISOString().split("T")[0]}
          onChange={(e) => {
            const newDate = new Date(e.target.value);
            setFormData({
              ...formData,
              [name]: newDate,
            });
          }}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    );
  };

  const CalendarMonth: React.FC<CalendarMonthProps> = ({
    month,
    startDate,
    endDate,
    usedStartDate,
    usedEndDate,
    dayNames,
  }) => {
    const monthName = month.toLocaleString("default", { month: "long" });
    const year = month.getFullYear();
    const daysInMonth = new Date(year, month.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month.getMonth(), 1).getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const isWeekend = (date: Date): boolean => {
      const day = date.getDay();
      return day === 0 || day === 6;
    };

    const isHolidayDate = (date: Date): boolean => {
      return isHoliday(date);
    };

    const getHolidayName = (date: Date): string => {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      const holiday = holidays.find((h) => {
        const holidayDate = new Date(h.date);
        holidayDate.setHours(0, 0, 0, 0);
        return holidayDate.getTime() === normalizedDate.getTime();
      });

      return holiday ? holiday.name : "";
    };

    return (
      <div className="text-center">
        <h4 className="mb-2">
          {monthName} {year}
        </h4>
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map((day) => (
            <div key={day} className="text-xs text-gray-500 py-1">
              {day}
            </div>
          ))}

          {days.map((day, index) => {
            if (!day) {
              return (
                <div key={index} className="text-transparent py-1">
                  .
                </div>
              );
            }

            const currentDate = new Date(year, month.getMonth(), day);
            currentDate.setHours(0, 0, 0, 0);

            const vacationStart = new Date(usedStartDate);
            vacationStart.setHours(0, 0, 0, 0);

            const vacationEnd = new Date(usedEndDate);
            vacationEnd.setHours(0, 0, 0, 0);

            const fullStart = new Date(startDate);
            fullStart.setHours(0, 0, 0, 0);

            const fullEnd = new Date(endDate);
            fullEnd.setHours(0, 0, 0, 0);

            const currentTime = currentDate.getTime();
            const isVacationDay =
              currentTime >= vacationStart.getTime() &&
              currentTime <= vacationEnd.getTime();

            const isExtraDay =
              ((currentTime >= fullStart.getTime() &&
                currentTime < vacationStart.getTime()) ||
                (currentTime > vacationEnd.getTime() &&
                  currentTime <= fullEnd.getTime())) &&
              (isWeekend(currentDate) || isHolidayDate(currentDate));

            const showHolidayIcon = isHolidayDate(currentDate);
            const holidayName = showHolidayIcon
              ? getHolidayName(currentDate)
              : "";

            let className = "text-sm py-1 ";
            if (isVacationDay) {
              className += "rounded-full bg-indigo-500 text-white font-medium";
            } else if (isExtraDay) {
              className +=
                "rounded-full bg-indigo-100 text-indigo-800 font-medium";
            }

            return (
              <div key={index} className={className} title={holidayName}>
                {day} {showHolidayIcon && <span>🏝️</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const CalendarView: React.FC<CalendarViewProps> = ({
    startDate,
    endDate,
    usedStartDate,
    usedEndDate,
    daysCount,
  }) => {
    const months: Date[] = [];
    const displayStart = startDate;
    const displayEnd = endDate;
    const currentMonth = new Date(
      displayStart.getFullYear(),
      displayStart.getMonth(),
      1
    );
    const lastMonth = new Date(
      displayEnd.getFullYear(),
      displayEnd.getMonth(),
      1
    );

    while (currentMonth <= lastMonth) {
      months.push(new Date(currentMonth));
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const usedDays = daysCount;

    let totalDays = 0;

    const currentDate = new Date(startDate);
    const endDateValue = new Date(endDate);

    currentDate.setHours(0, 0, 0, 0);
    endDateValue.setHours(0, 0, 0, 0);

    while (currentDate <= endDateValue) {
      totalDays++;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const extraDays = totalDays - usedDays;

    const formatDate = (date: Date): string => {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    return (
      <div>
        <div className="bg-indigo-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-center">
            <div className="bg-white p-2 rounded shadow-sm">
              <div className="text-xs text-gray-500">Start</div>
              <div>{formatDate(usedStartDate)}</div>
            </div>
            <div className="bg-white p-2 rounded shadow-sm">
              <div className="text-xs text-gray-500">End</div>
              <div>{formatDate(usedEndDate)}</div>
            </div>
            <div className="bg-white p-2 rounded shadow-sm">
              <div className="text-xs text-gray-500">Vacation Days</div>
              <div>{usedDays}</div>
            </div>
            <div className="bg-white p-2 rounded shadow-sm">
              <div className="text-xs text-gray-500">Extra Days</div>
              <div>{extraDays}</div>
            </div>
            <div className="bg-white p-2 rounded shadow-sm">
              <div className="text-xs text-gray-500">Total Days</div>
              <div>{totalDays}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {months.map((month, monthIndex) => (
            <CalendarMonth
              key={monthIndex}
              month={month}
              startDate={startDate}
              endDate={endDate}
              usedStartDate={usedStartDate}
              usedEndDate={usedEndDate}
              dayNames={dayNames}
            />
          ))}
        </div>

        <div className="flex items-center justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-indigo-500 rounded-full mr-2"></div>
            <span className="text-sm">Vacation Days</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-indigo-100 rounded-full mr-2"></div>
            <span className="text-sm">Extra Days</span>
          </div>
        </div>
      </div>
    );
  };

  const countryOptions: SelectOption[] = Object.entries(hd.getCountries())
    .map(([code, name]) => ({
      value: code,
      label: name as string,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const stateOptions: SelectOption[] = formData.workCountry
    ? [
        { value: undefined, label: "-" },
        ...Object.entries(hd.getStates(formData.workCountry) || {})
          .map(([code, name]) => ({
            value: code,
            label: name as string,
          }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-indigo-600 mb-2">
            Vacation Calculator
          </div>
          <div className="text-lg text-gray-600">
            Plan your vacation considering holidays and work days
          </div>
        </div>

        <Card className="mb-8">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <div className="text-lg text-gray-800">Vacation Calculator</div>
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform duration-300 ease-in-out transform"
              style={{
                transform: isMinimized ? "rotate(0deg)" : "rotate(180deg)",
              }}
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? "+" : "−"}
            </button>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isMinimized ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
            }`}
          >
            <div className="p-6">
              <FormSection>
                <SelectField
                  label="Work Country"
                  name="workCountry"
                  value={formData.workCountry}
                  icon="🌎"
                  options={countryOptions}
                  tooltip="Select the country where you work"
                />

                <SelectField
                  label="Work State"
                  name="workState"
                  value={formData.workState}
                  icon="🏙️"
                  options={stateOptions}
                  tooltip="Select the state where you work"
                />
              </FormSection>

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

              <FormSection hasBorder={false}>
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
                  {formData.endDate <= formData.startDate && (
                    <WarningMessage message="End date must be after start date" />
                  )}
                </div>
              </FormSection>

              <div className="flex flex-col sm:flex-row justify-between items-center mt-8">
                <div className="text-indigo-600 mb-4 sm:mb-0">
                  All set? Let's calculate?
                </div>
                <button
                  type="button"
                  onClick={handleCalculate}
                  disabled={hasErrors()}
                  className={`px-8 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    hasErrors()
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  Calculate
                </button>
              </div>
            </div>
          </div>
        </Card>

        {showCalendars && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Your Vacation Periods
            </h2>

            <div className="flex w-full border-b border-gray-200 mb-4">
              {vacationPeriods.map((period, index) => (
                <button
                  key={index}
                  className={`py-2 px-4 flex-1 text-center ${
                    activeTab === index
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab(index)}
                >
                  Period {index + 1} ({period.daysCount} days)
                </button>
              ))}
            </div>

            <Card className="p-4">
              {vacationPeriods.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <CalendarView
                    startDate={vacationPeriods[activeTab].startDate}
                    endDate={vacationPeriods[activeTab].endDate}
                    usedStartDate={vacationPeriods[activeTab].usedStartDate}
                    usedEndDate={vacationPeriods[activeTab].usedEndDate}
                    daysCount={vacationPeriods[activeTab].daysCount}
                  />
                </div>
              )}
            </Card>
          </div>
        )}

        <div className="text-center text-gray-500 text-sm mt-8 pt-4 border-t border-gray-200">
          Created by{" "}
          <a
            href="https://github.com/marco-carvalho"
            className="text-indigo-500 hover:text-indigo-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            Marco Carvalho
          </a>
        </div>
      </div>
    </div>
  );
};

export default VacationCalculator;
