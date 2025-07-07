"use client";

import { useState, useEffect } from "react";

const monthNames = [
	"January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December",
];

const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getMonthData(year: number, month: number) {
	const firstDay = new Date(year, month, 1);
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	let startDay = firstDay.getDay() - 1;
	if (startDay < 0) startDay = 6;

	const weeks: (number | null)[][] = [];
	let day = 1;

	for (let w = 0; w < 6; w++) {
		const week: (number | null)[] = [];
		for (let d = 0; d < 7; d++) {
			if ((w === 0 && d < startDay) || day > daysInMonth) {
				week.push(null);
			} else {
				week.push(day++);
			}
		}
		weeks.push(week);
		if (day > daysInMonth) break;
	}
	return weeks;
}

const yearRange = Array.from({ length: 11 }, (_, i) => 2020 + i);

export default function CalendarWidget({
	notes,
	setNotes,
	onDaySelect,
}: {
	notes: {
		[year: number]: {
			[month: number]: {
				[day: number]: {
					entries: { title: string; description: string }[];
				};
			};
		};
	};
	setNotes: React.Dispatch<React.SetStateAction<typeof notes>>;
	onDaySelect?: (day: number, month: number, year: number) => void;
}) {
	const today = new Date();
	const [month, setMonth] = useState(today.getMonth());
	const [year, setYear] = useState(today.getFullYear());
	const [showYearMenu, setShowYearMenu] = useState(false);
	const [showMonthMenu, setShowMonthMenu] = useState(false);

	const weeks = getMonthData(year, month);

	return (
		<div className="flex flex-col items-center py-6">
			{/* Header */}
			<div className="flex items-center gap-4 mb-4 relative">
				<button
					className="px-3 py-1 rounded bg-purple-100 text-purple-700 font-bold hover:bg-purple-200 dark:bg-purple-800 dark:text-purple-200 dark:hover:bg-purple-700"
					onClick={() => setMonth((m) => (m === 0 ? 11 : m - 1))}
				>
					&lt;
				</button>

				<h1 className="text-2xl font-bold text-purple-900 dark:text-purple-200 flex items-center gap-2">
					{/* Month Dropdown */}
					<div
						className="relative"
						onMouseEnter={() => setShowMonthMenu(true)}
						onMouseLeave={() => setShowMonthMenu(false)}
					>
						<button
							className="px-2 py-1 rounded bg-purple-100 text-purple-800 font-bold hover:bg-yellow-200 dark:bg-purple-800 dark:text-purple-200 dark:hover:bg-purple-700"
							type="button"
						>
							{monthNames[month]} ▼
						</button>
						{showMonthMenu && (
							<div
								className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 border rounded shadow-lg z-10 min-w-[140px] overflow-y-auto"
								style={{ maxHeight: "120px" }}
							>
								{monthNames.map((m, idx) => (
									<div
										key={idx}
										className={`px-4 py-2 cursor-pointer hover:bg-yellow-100 dark:hover:bg-gray-700 text-center ${
											idx === month ? "bg-purple-100 dark:bg-purple-800 font-bold" : ""
										}`}
										onClick={() => {
											setMonth(idx);
											setShowMonthMenu(false);
										}}
									>
										{m}
									</div>
								))}
							</div>
						)}
					</div>

					{/* Year Dropdown */}
					<div
						className="relative"
						onMouseEnter={() => setShowYearMenu(true)}
						onMouseLeave={() => setShowYearMenu(false)}
					>
						<button
							className="px-2 py-1 rounded bg-purple-100 text-purple-800 font-bold hover:bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-200 dark:hover:bg-yellow-700"
							type="button"
						>
							{year} ▼
						</button>
						{showYearMenu && (
							<div
								className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 border rounded shadow-lg z-10 min-w-[90px] overflow-y-auto"
								style={{ maxHeight: "120px" }}
							>
								{yearRange.map((y) => (
									<div
										key={y}
										className={`px-4 py-2 cursor-pointer hover:bg-purple-100 dark:hover:bg-gray-700 text-center ${
											y === year ? "bg-yellow-100 dark:bg-yellow-800 font-bold" : ""
										}`}
										onClick={() => {
											setYear(y);
											setShowYearMenu(false);
										}}
									>
										{y}
									</div>
								))}
							</div>
						)}
					</div>
				</h1>

				<button
					className="px-3 py-1 rounded bg-purple-100 text-purple-700 font-bold hover:bg-purple-200 dark:bg-purple-800 dark:text-purple-200 dark:hover:bg-purple-700"
					onClick={() => setMonth((m) => (m === 11 ? 0 : m + 1))}
				>
					&gt;
				</button>
			</div>

			{/* Calendar Table */}
			<div className="overflow-x-auto">
				<table className="border border-gray-200 dark:border-transparent border-collapse bg-white/80 dark:bg-gray-800/90 rounded-xl shadow-xl">
					<thead>
						<tr>
							{dayLabels.map((label) => (
								<th key={label} className="px-4 py-2 border border-gray-200 dark:border-transparent text-purple-700 dark:text-purple-300 font-semibold text-center">
									{label}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{weeks.map((week, i) => (
							<tr key={i}>
								{week.map((day, j) => {
									const hasNotes = day && notes[year]?.[month]?.[day]?.entries?.length > 0;
									const entryTitles = hasNotes
										? notes[year][month][day].entries
											.filter((e) => e.title.trim() !== "")
											.map((e) => e.title)
										: [];

									return (
										<td
											key={j}
											className="w-28 h-20 border border-gray-200 dark:border-transparent align-top relative cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900" 
											onClick={() => day && onDaySelect?.(day, month, year)}
										>
											<div className="absolute top-1 left-2 text-xs text-gray-700 dark:text-gray-300 font-semibold">
												{day || ""}
											</div>

											{/* Optional Note Titles */}
											{entryTitles.length > 0 && (
												<div
													className="mt-5 px-2 text-xs text-purple-800 dark:text-purple-300 font-semibold overflow-y-auto"
													style={{
														maxHeight: "56px", // fits about 3-4 lines, adjust as needed
														minHeight: "20px",
														scrollbarWidth: "thin",
													}}
												>
													{entryTitles.map((title, idx) => (
														<div key={idx} className="truncate">
															{title}
														</div>
													))}
												</div>
											)}
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
