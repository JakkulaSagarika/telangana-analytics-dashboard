import { useEffect, useMemo, useRef, useState } from "react";
import { useRainfall } from "../context/RainfallContext";
import { getYearComparison } from "../services/yearComparisonService";
import rainfallBackground from "../image/rainfall-dashboard-bg.png";

import {
    BarChart,
    Bar,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import "../styles/year-comparison.css";

const DEFAULT_YEARS = [2018, 2019, 2020, 2021, 2022];

const INTENSITY_COLORS = {
    no_rain: "#d8d8e7",
    light: "#9ecae1",
    moderate: "#6aaed6",
    heavy: "#4b8cc2",
    very_heavy: "#3b6fa4",
    extreme: "#2c4d7b",
};

const INTENSITY_THEME_COLORS = [
    INTENSITY_COLORS.light,
    INTENSITY_COLORS.moderate,
    INTENSITY_COLORS.heavy,
    INTENSITY_COLORS.very_heavy,
    INTENSITY_COLORS.extreme,
];

const number = (value, digits = 1) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed.toFixed(digits) : "?";
};

const formatDate = (value) => {
    if (!value) return "?";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatChange = (value) => {
    if (value === null || value === undefined || value === "") return "?";

    const num = Number(value);

    if (!Number.isFinite(num)) return "?";

    const sign = num > 0 ? "+" : "";

    return `${sign}${num.toFixed(1)}%`;
};

const getAvailableYears = (allYears) => {
    const activeYears = DEFAULT_YEARS.filter((year) => allYears.includes(year));

    return activeYears.length ? activeYears : DEFAULT_YEARS.slice(-Math.min(5, allYears.length || 5));
};

function Background() {
    return (
        <div
            className="year-comparison-background"
            style={{ backgroundImage: `url(${rainfallBackground})` }}
        />
    );
}

function SectionTitle({ eyebrow, title, subtitle }) {
    return (
        <div className="year-section-header">
            <div>
                <span>{eyebrow}</span>
                <h3>{title}</h3>
            </div>
            {subtitle && <small>{subtitle}</small>}
        </div>
    );
}

function KpiCard({ label, value, suffix, accent }) {
    return (
        <div className="year-kpi-card">
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{suffix}</small>
            {accent && <div className="kpi-accent" style={{ background: accent }} />}
        </div>
    );
}

function SkeletonCard({ className = "", rows = 3 }) {
    return (
        <div className={`year-card skeleton-card ${className}`}>
            <div className="skeleton-line short" />
            <div className="skeleton-line long" />
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="skeleton-line" />
            ))}
        </div>
    );
}

function YearComparison() {
    const { availableYears } = useRainfall();

    const yearOptions = useMemo(
        () => getAvailableYears(availableYears),
        [availableYears]
    );

    const [selectedYears, setSelectedYears] = useState([]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [retryCount, setRetryCount] = useState(0);
    const [spellYear, setSpellYear] = useState(null);
    const [selectionNotice, setSelectionNotice] = useState("");
    const initialLoadCompletedRef = useRef(false);

    useEffect(() => {
        if (availableYears.length && selectedYears.length === 0) {
            setSelectedYears(yearOptions);
        }
    }, [availableYears, selectedYears.length, yearOptions]);

    useEffect(() => {
        if (!selectedYears.length) return;

        setSpellYear((current) => {
            if (current && selectedYears.includes(current)) {
                return current;
            }

            return selectedYears[selectedYears.length - 1];
        });
    }, [selectedYears]);

    const selectedYearsKey = selectedYears.join(",");

    useEffect(() => {
        if (selectedYears.length < 2 || !availableYears.length || initialLoadCompletedRef.current) {
            return;
        }

        const controller = new AbortController();

        const loadData = async () => {
            try {
                setLoading(true);
                setError("");
                setSelectionNotice("");

                const result = await getYearComparison(selectedYears, controller.signal);

                if (!controller.signal.aborted) {
                    setData(result);
                    initialLoadCompletedRef.current = true;
                }
            } catch (err) {
                const message = String(err?.message || "").toLowerCase();
                const isAbort =
                    err?.name === "AbortError" ||
                    err?.name === "CanceledError" ||
                    err?.code === "ERR_CANCELED" ||
                    message.includes("canceled") ||
                    message.includes("aborted");

                if (isAbort) {
                    return;
                }

                console.error("Year comparison error:", err);
                setError(err.message || "Unable to load year comparison data.");
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            controller.abort();
        };
    }, [availableYears.length, selectedYears, retryCount]);

    const toggleYear = (year) => {
        setSelectedYears((current) => {
            if (current.includes(year)) {
                if (current.length <= 2) {
                    setSelectionNotice("Minimum 2 years required for comparison.");
                    return current;
                }

                setSelectionNotice("");
                return current.filter((item) => item !== year);
            }

            if (current.length >= 5) {
                return current;
            }

            setSelectionNotice("");
            return [...current, year].sort((a, b) => a - b);
        });
    };

    const selectedYearSet = useMemo(() => new Set(selectedYears), [selectedYears]);

    const summaryRows = useMemo(
        () => (data?.summary || []).filter((item) => selectedYearSet.has(item.year)),
        [data, selectedYearSet]
    );

    const monthlyTrend = useMemo(
        () => {
            const source = data?.monthly_trend || [];

            if (!source.length) return [];

            return source.map((entry) => {
                const filteredEntry = { month: entry.month, month_name: entry.month_name };

                selectedYears.forEach((year) => {
                    filteredEntry[String(year)] = Number(entry[String(year)] || 0);
                });

                return filteredEntry;
            });
        },
        [data, selectedYears]
    );

    const combinedWettestMonth = useMemo(() => {
        const source = data?.monthly_trend || [];

        if (!source.length) return [];

        return Array.from({ length: 12 }, (_, index) => {
            const monthIndex = index + 1;
            const monthEntry = source.find((item) => Number(item.month) === monthIndex) || {
                month_name: "",
            };

            let total = 0;

            selectedYears.forEach((year) => {
                total += Number(monthEntry[String(year)] || 0);
            });

            return {
                month: monthIndex,
                month_name: monthEntry.month_name || "",
                rainfall_mm: Number(total.toFixed(1)),
            };
        });
    }, [data, selectedYears]);

    const wettestMonths = useMemo(
        () => (data?.wettest_months || []).filter((item) => selectedYearSet.has(item.year)),
        [data, selectedYearSet]
    );

    const highestRainfallDays = useMemo(
        () => (data?.highest_rainfall_days || []).filter((item) => selectedYearSet.has(item.year)),
        [data, selectedYearSet]
    );

    const intensityDistribution = useMemo(
        () => (data?.intensity_distribution || []).filter((item) => selectedYearSet.has(item.year)),
        [data, selectedYearSet]
    );

    const drySpells = useMemo(
        () => (data?.dry_spells || []).filter((item) => selectedYearSet.has(item.year)),
        [data, selectedYearSet]
    );

    const wetSpells = useMemo(
        () => (data?.wet_spells || []).filter((item) => selectedYearSet.has(item.year)),
        [data, selectedYearSet]
    );

    const consistencyMetrics = useMemo(
        () => (data?.consistency?.metrics || []).filter((item) => selectedYearSet.has(item.year)),
        [data, selectedYearSet]
    );

    const consistency = useMemo(() => {
        const sorted = [...consistencyMetrics].sort((a, b) => Number(a.cv || 0) - Number(b.cv || 0));

        return {
            most_consistent_year: sorted[0]?.year || null,
            most_variable_year: sorted[sorted.length - 1]?.year || null,
            metrics: consistencyMetrics,
        };
    }, [consistencyMetrics]);

    const yoyChartData = useMemo(() => {
        const selectedSummary = [...summaryRows].sort((a, b) => Number(a.year) - Number(b.year));

        return selectedSummary
            .map((item, index) => {
                if (index === 0) {
                    return {
                        year: item.year,
                        change_pct: null,
                        previous_year: null,
                    };
                }

                const previous = selectedSummary[index - 1];
                const previousTotal = Number(previous.total_rainfall || 0);
                const currentTotal = Number(item.total_rainfall || 0);

                return {
                    year: item.year,
                    change_pct: previousTotal ? Number((((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1)) : 0,
                    previous_year: previous.year,
                };
            })
            .filter((item) => item.change_pct !== null && item.change_pct !== undefined);
    }, [summaryRows]);

    const annualRainfall = data?.annual_rainfall || [];
    const rainyDryDays = data?.rainy_dry_days || [];
    const yearStory = useMemo(() => {
        if (!summaryRows.length) return [];

        const stories = [];

        const wettestYear = summaryRows.reduce((best, item) =>
            Number(item.total_rainfall || 0) > Number(best.total_rainfall || 0) ? item : best
        );

        const driestYear = summaryRows.reduce((best, item) =>
            Number(item.total_rainfall || 0) < Number(best.total_rainfall || 0) ? item : best
        );

        const combinedWettestMonthRecord = [...combinedWettestMonth].reduce((best, item) =>
            Number(item.rainfall_mm || 0) > Number(best.rainfall_mm || 0) ? item : best
        );

        const highestDayRecord = [...highestRainfallDays].reduce((best, item) =>
            Number(item.rainfall_mm || 0) > Number(best.rainfall_mm || 0) ? item : best
        );

        const longestDry = drySpells.reduce((best, item) =>
            Number(item.days || 0) > Number(best.days || 0) ? item : best
        );

        const longestWet = wetSpells.reduce((best, item) =>
            Number(item.days || 0) > Number(best.days || 0) ? item : best
        );

        const mostConsistent = [...consistencyMetrics].sort((a, b) => Number(a.cv || 0) - Number(b.cv || 0))[0];

        stories.push(
            `${wettestYear.year} was the wettest selected year, receiving ${wettestYear.total_rainfall} mm of rainfall.`
        );

        if (combinedWettestMonthRecord) {
            stories.push(
                `${combinedWettestMonthRecord.month_name} recorded the highest combined rainfall across the selected years with ${combinedWettestMonthRecord.rainfall_mm} mm.`
            );
        }

        if (highestDayRecord) {
            stories.push(
                `${highestDayRecord.year} recorded the highest single-day rainfall on ${highestDayRecord.date} with ${highestDayRecord.rainfall_mm} mm.`
            );
        }

        if (longestDry) {
            stories.push(
                `${longestDry.year} had the longest dry spell at ${longestDry.days} days from ${longestDry.start_date} to ${longestDry.end_date}.`
            );
        }

        if (longestWet) {
            stories.push(
                `${longestWet.year} had the longest wet spell at ${longestWet.days} days from ${longestWet.start_date} to ${longestWet.end_date}.`
            );
        }

        if (mostConsistent) {
            stories.push(
                `${mostConsistent.year} was the most consistent year, with a coefficient of variation of ${mostConsistent.cv}%.`
            );
        }

        if (driestYear) {
            stories.push(
                `${driestYear.year} was the driest selected year, receiving ${driestYear.total_rainfall} mm.`
            );
        }

        return stories.slice(0, 5);
    }, [combinedWettestMonth, consistencyMetrics, drySpells, highestRainfallDays, summaryRows, wetSpells]);

    const wettestYear = useMemo(() => {
        if (!summaryRows.length) return null;
        return summaryRows.reduce((best, item) =>
            Number(item.total_rainfall || 0) > Number(best.total_rainfall || 0)
                ? item
                : best
        );
    }, [summaryRows]);

    const driestYear = useMemo(() => {
        if (!summaryRows.length) return null;
        return summaryRows.reduce((best, item) =>
            Number(item.total_rainfall || 0) < Number(best.total_rainfall || 0)
                ? item
                : best
        );
    }, [summaryRows]);

    const combinedWettestMonthRecord = useMemo(() => {
        if (!combinedWettestMonth.length) return null;

        return combinedWettestMonth.reduce((best, item) =>
            Number(item.rainfall_mm || 0) > Number(best.rainfall_mm || 0)
                ? item
                : best
        );
    }, [combinedWettestMonth]);

    const internalSpellData = useMemo(() => {
        if (!drySpells.length || !wetSpells.length || !spellYear) {
            return [];
        }

        const dry = drySpells.find((item) => item.year === spellYear) || {
            year: spellYear,
            days: 0,
            start_date: null,
            end_date: null,
        };

        const wet = wetSpells.find((item) => item.year === spellYear) || {
            year: spellYear,
            days: 0,
            start_date: null,
            end_date: null,
        };

        return [
            {
                name: "Dry Spell",
                value: Number(dry.days || 0),
                start_date: dry.start_date,
                end_date: dry.end_date,
            },
            {
                name: "Wet Spell",
                value: Number(wet.days || 0),
                start_date: wet.start_date,
                end_date: wet.end_date,
            },
        ];
    }, [drySpells, wetSpells, spellYear]);

    const consistencyPieData = useMemo(() => {
        if (!consistency.metrics || !consistency.metrics.length) return [];

        return consistency.metrics
            .filter((item) => selectedYears.includes(item.year))
            .map((item) => ({
                name: String(item.year),
                value: Number(item.cv || 0),
                year: item.year,
                metric: "Coefficient of Variation",
                metricValue: number(item.cv, 1),
            }));
    }, [consistency.metrics, selectedYears]);

    const chartLegend = selectedYears;

    const intensityChartData = useMemo(() => {
        if (!intensityDistribution.length) return [];

        return intensityDistribution.map((item) => {
            const total = [
                item.no_rain,
                item.light,
                item.moderate,
                item.heavy,
                item.very_heavy,
                item.extreme,
            ].reduce((sum, value) => sum + Number(value || 0), 0);

            const normalized = { year: item.year };

            ["no_rain", "light", "moderate", "heavy", "very_heavy", "extreme"].forEach((key) => {
                normalized[key] = total ? (Number(item[key] || 0) / total) * 100 : 0;
            });

            return normalized;
        });
    }, [intensityDistribution]);

    const spellPieColors = ["#9ecae1", "#6aaed6"];

    const showSkeleton = selectedYears.length >= 2 && !data && !error;

    return (
        <div className="year-comparison-page">
            <Background />

            <main className="year-comparison-content">
                <header className="year-comparison-header">
                    <div className="year-comparison-title-wrap">
                        <p className="year-comparison-eyebrow">YEAR COMPARISON</p>
                        <h1>Year Comparison</h1>
                        <p className="year-comparison-subtitle">
                            Compare rainfall patterns and behaviour across selected years
                        </p>
                    </div>

                    <div className="year-selector-card">
                        <div className="year-selector-top">
                            <span>SELECT YEARS</span>
                            <small>
                                {selectedYears.length < 2
                                    ? "Please select at least 2 years to compare."
                                    : `Selected ${selectedYears.length} of ${yearOptions.length}`}
                            </small>
                        </div>

                        <div className="year-pill-group">
                            {yearOptions.map((year) => {
                                const active = selectedYears.includes(year);

                                return (
                                    <button
                                        key={year}
                                        type="button"
                                        className={`year-pill ${active ? "active" : ""}`}
                                        onClick={() => toggleYear(year)}
                                    >
                                        {year}
                                    </button>
                                );
                            })}
                        </div>

                        {selectionNotice && (
                            <small className="year-selection-note">{selectionNotice}</small>
                        )}
                    </div>
                </header>

                {error && (
                    <div className="year-comparison-error">
                        <strong>Unable to load year comparison.</strong>
                        <p>{error}</p>
                        <button type="button" onClick={() => setRetryCount((count) => count + 1)}>
                            Retry
                        </button>
                    </div>
                )}

                {showSkeleton && (
                    <>
                        <div className="year-kpi-grid">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <SkeletonCard key={index} />
                            ))}
                        </div>

                        <div className="year-two-column summary-grid">
                            <SkeletonCard className="chart-skeleton" rows={6} />
                            <SkeletonCard className="chart-skeleton" rows={6} />
                        </div>

                        <div className="year-card full-width-card skeleton-full">
                            <div className="skeleton-line short" />
                            <div className="skeleton-line long" />
                            <div className="skeleton-chart-large" />
                        </div>
                    </>
                )}

                {data && (
                    <>
                        <section className="year-kpi-grid">
                            <KpiCard
                                label="WETTEST YEAR"
                                value={wettestYear ? wettestYear.year : "?"}
                                suffix={wettestYear ? `${number(wettestYear.total_rainfall)} mm` : "mm"}
                                accent="#6aaed6"
                            />
                            <KpiCard
                                label="DRIEST YEAR"
                                value={driestYear ? driestYear.year : "?"}
                                suffix={driestYear ? `${number(driestYear.total_rainfall)} mm` : "mm"}
                                accent="#9ecae1"
                            />
                            <KpiCard
                                label="WETTEST MONTH"
                                value={combinedWettestMonthRecord ? combinedWettestMonthRecord.month_name : "?"}
                                suffix={combinedWettestMonthRecord ? `${number(combinedWettestMonthRecord.rainfall_mm)} mm` : "mm"}
                                accent="#4b8cc2"
                            />
                        </section>

                        <section className="year-two-column summary-grid">
                            <div className="year-card year-summary-card">
                                <SectionTitle
                                    eyebrow="YEAR OVERVIEW"
                                    title="Year Comparison Summary"
                                />

                                <div className="table-scroll-wrapper compact-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Year</th>
                                                <th>Total Rainfall</th>
                                                <th>Rainy Days</th>
                                                <th>Dry Days</th>
                                                <th>Wettest Month</th>
                                                <th>Highest Rainfall</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {summaryRows.map((item) => (
                                                <tr key={item.year}>
                                                    <td>{item.year}</td>
                                                    <td>{number(item.total_rainfall)} mm</td>
                                                    <td>{item.rainy_days}</td>
                                                    <td>{item.dry_days}</td>
                                                    <td>{item.wettest_month?.month_name || "?"}</td>
                                                    <td>
                                                        {item.highest_rainfall_day?.rainfall_mm
                                                            ? `${number(item.highest_rainfall_day.rainfall_mm)} mm`
                                                            : "?"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="year-card">
                                <SectionTitle
                                    eyebrow="EXTREME RAINFALL"
                                    title="Highest Rainfall Day"
                                />

                                <div className="chart-wrapper compact-chart-wrapper">
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={highestRainfallDays}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                                            <XAxis dataKey="year" stroke="#dfeaf7" />
                                            <YAxis stroke="#dfeaf7" />
                                            <Tooltip
                                                formatter={(value) => [`${number(value)} mm`, "Rainfall"]}
                                                contentStyle={chartTooltipStyle}
                                            />
                                            <Bar dataKey="rainfall_mm" radius={[8, 8, 0, 0]}>
                                                {highestRainfallDays.map((entry, index) => (
                                                    <Cell key={`${entry.year}-bar`} fill={getIntensityThemeColor(index)} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </section>

                        <section className="year-two-column main-layout">
                            <div className="year-main-column">
                                <div className="year-card trend-card">
                                    <SectionTitle
                                        eyebrow="MAIN MONTHLY TREND"
                                        title="Monthly Rainfall Trend"
                                    />
                                    <div className="chart-wrapper trend-chart-wrapper">
                                        <ResponsiveContainer width="100%" height={330}>
                                            <LineChart data={monthlyTrend} margin={{ top: 6, right: 8, bottom: 8, left: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                                                <XAxis dataKey="month_name" stroke="#dfeaf7" tickLine={false} axisLine={false} />
                                                <YAxis stroke="#dfeaf7" tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    formatter={(value) => [`${number(value)} mm`, "Rainfall"]}
                                                    contentStyle={chartTooltipStyle}
                                                    labelStyle={{ color: "#2b2446", fontWeight: 700 }}
                                                    itemStyle={{ color: "#2c2a3f", fontWeight: 600 }}
                                                />
                                                <Legend
                                                    verticalAlign="bottom"
                                                    align="center"
                                                    iconType="circle"
                                                    wrapperStyle={{ paddingTop: 6, fontSize: "0.76rem" }}
                                                />
                                                {chartLegend.map((year, index) => (
                                                    <Line
                                                        key={year}
                                                        type="monotone"
                                                        dataKey={String(year)}
                                                        stroke={getIntensityThemeColor(index)}
                                                        strokeWidth={2}
                                                        dot={{ r: 2 }}
                                                        activeDot={{ r: 4 }}
                                                        name={String(year)}
                                                    />
                                                ))}
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="year-card compact-card">
                                    <SectionTitle
                                        eyebrow="YEAR-OVER-YEAR"
                                        title="Year-over-Year Change"
                                    />

                                    <div className="chart-wrapper compact-chart-wrapper">
                                        <ResponsiveContainer width="100%" height={220}>
                                            <BarChart data={yoyChartData} margin={{ top: 8, right: 8, bottom: 16, left: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                                                <XAxis dataKey="year" stroke="#dfeaf7" tickLine={false} axisLine={false} />
                                                <YAxis stroke="#dfeaf7" tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    formatter={(value) => [formatChange(value), "Change"]}
                                                    contentStyle={chartTooltipStyle}
                                                    labelStyle={{ color: "#2b2446", fontWeight: 700 }}
                                                    itemStyle={{ color: "#2c2a3f", fontWeight: 600 }}
                                                />
                                                <Bar dataKey="change_pct" radius={[8, 8, 0, 0]}>
                                                    {yoyChartData.map((entry) => (
                                                        <Cell
                                                            key={`${entry.year}-change`}
                                                            fill={Number(entry.change_pct || 0) >= 0 ? INTENSITY_COLORS.heavy : INTENSITY_COLORS.light}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            <div className="year-side-stack">
                                <div className="year-card compact-card">
                                    <SectionTitle
                                        eyebrow="SPELL ANALYSIS"
                                        title="Dry vs Wet Spell"
                                        subtitle={`Longest continuous dry and wet periods for ${spellYear || selectedYears[selectedYears.length - 1]}`}
                                    />

                                    <div className="year-inline-selector">
                                        {selectedYears.map((year) => (
                                            <button
                                                key={year}
                                                type="button"
                                                className={`year-inline-pill ${spellYear === year ? "active" : ""}`}
                                                onClick={() => setSpellYear(year)}
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="chart-wrapper pie-wrapper">
                                        <ResponsiveContainer width="100%" height={170}>
                                            <PieChart>
                                                <Pie
                                                    data={internalSpellData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    innerRadius={38}
                                                    outerRadius={62}
                                                    paddingAngle={3}
                                                    stroke="rgba(255,255,255,0.25)"
                                                >
                                                    {internalSpellData.map((entry, index) => (
                                                        <Cell key={`${entry.name}-cell`} fill={spellPieColors[index % spellPieColors.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    content={<SpellTooltip />}
                                                    cursor={{ fill: "transparent" }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="compact-stat-row">
                                        {internalSpellData.map((item, index) => (
                                            <div key={item.name} className="compact-stat-item">
                                                <span style={{ color: spellPieColors[index % spellPieColors.length] }}>
                                                    {item.name}
                                                </span>
                                                <strong>{item.value} days</strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="year-card compact-card">
                                    <SectionTitle
                                        eyebrow="RAINFALL CONSISTENCY"
                                        title="Rainfall Consistency"
                                    />

                                    <div className="chart-wrapper pie-wrapper">
                                        <ResponsiveContainer width="100%" height={170}>
                                            <PieChart>
                                                <Pie
                                                    data={consistencyPieData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    innerRadius={38}
                                                    outerRadius={62}
                                                    paddingAngle={3}
                                                    stroke="rgba(255,255,255,0.25)"
                                                >
                                                    {consistencyPieData.map((entry, index) => (
                                                        <Cell key={`${entry.year}-cell`} fill={getIntensityThemeColor(index)} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    content={<ConsistencyTooltip />}
                                                    cursor={{ fill: "transparent" }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="compact-stat-row compact-stat-row-two">
                                        <div className="compact-stat-item">
                                            <span>Most Consistent</span>
                                            <strong>{consistency.most_consistent_year || "?"}</strong>
                                        </div>
                                        <div className="compact-stat-item">
                                            <span>Most Variable</span>
                                            <strong>{consistency.most_variable_year || "?"}</strong>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </section>

                        <section className="year-two-column">
                            <div className="year-card">
                                <SectionTitle
                                    eyebrow="WETTEST MONTH"
                                    title="Wettest Month by Selected Year"
                                />

                                <div className="chart-wrapper compact-chart-wrapper">
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={wettestMonths} layout="vertical" margin={{ left: 20, right: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                                            <XAxis type="number" stroke="#dfeaf7" />
                                            <YAxis type="category" dataKey="year" stroke="#dfeaf7" width={44} />
                                            <Tooltip
                                                formatter={(value) => [`${number(value)} mm`, "Rainfall"]}
                                                contentStyle={chartTooltipStyle}
                                            />
                                            <Bar dataKey="rainfall_mm" radius={[0, 8, 8, 0]}>
                                                {wettestMonths.map((entry, index) => (
                                                    <Cell key={`${entry.year}-wettest`} fill={getIntensityThemeColor(index)} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="year-card">
                                <SectionTitle
                                    eyebrow="RAINFALL INTENSITY"
                                    title="Rainfall Intensity Comparison"
                                />

                                <div className="chart-wrapper compact-chart-wrapper">
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={intensityChartData} margin={{ top: 8, right: 8, bottom: 26, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                                            <XAxis dataKey="year" stroke="#dfeaf7" tickLine={false} axisLine={false} />
                                            <YAxis stroke="#dfeaf7" unit="%" tickLine={false} axisLine={false} />
                                            <Tooltip
                                                formatter={(value) => [`${number(value, 1)}%`, "Share"]}
                                                contentStyle={chartTooltipStyle}
                                                labelStyle={{ color: "#2b2446", fontWeight: 700 }}
                                                itemStyle={{ color: "#2c2a3f", fontWeight: 600 }}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                align="center"
                                                wrapperStyle={{ paddingTop: 6, fontSize: "0.76rem" }}
                                            />
                                            {["no_rain", "light", "moderate", "heavy", "very_heavy", "extreme"].map((key) => (
                                                <Bar
                                                    key={key}
                                                    dataKey={key}
                                                    stackId="intensity"
                                                    name={INTENSITY_LABELS[key]}
                                                    fill={INTENSITY_COLORS[key]}
                                                />
                                            ))}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </section>

                        <section className="year-two-column">
                            <div className="year-card">
                                <SectionTitle
                                    eyebrow="WETTEST MONTH ACROSS YEARS"
                                    title="Wettest Month Across Selected Years"
                                />

                                <div className="insight-card-body">
                                    <div className="insight-kicker">
                                        {combinedWettestMonthRecord ? combinedWettestMonthRecord.month_name : "?"}
                                    </div>
                                    <div className="insight-value">
                                        {combinedWettestMonthRecord ? `${number(combinedWettestMonthRecord.rainfall_mm)} mm` : "?"}
                                    </div>
                                </div>

                                <div className="chart-wrapper compact-chart-wrapper">
                                    <ResponsiveContainer width="100%" height={180}>
                                        <BarChart data={combinedWettestMonth}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                                            <XAxis dataKey="month_name" stroke="#dfeaf7" />
                                            <YAxis stroke="#dfeaf7" />
                                            <Tooltip
                                                formatter={(value) => [`${number(value)} mm`, "Rainfall"]}
                                                contentStyle={chartTooltipStyle}
                                            />
                                            <Bar dataKey="rainfall_mm" radius={[8, 8, 0, 0]} fill="#6aaed6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="year-card">
                                <SectionTitle
                                    eyebrow="YEAR STORY"
                                    title="Automatic Year Story"
                                />
                                <div className="year-story-grid">
                                    {yearStory.map((story, index) => (
                                        <div key={`${story}-${index}`} className="year-story-item">
                                            <div className="year-story-icon">
                                                {index === 0 ? "🌧" : index === 1 ? "📅" : index === 2 ? "☀" : index === 3 ? "📈" : "📊"}
                                            </div>
                                            <div className="year-story-text">{story}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

const chartTooltipStyle = {
    background: "rgba(255,255,255,0.96)",
    border: "1px solid rgba(108,77,255,0.15)",
    borderRadius: "12px",
    color: "#2a2345",
    boxShadow: "0 12px 24px rgba(38, 34, 56, 0.15)",
    padding: "8px 10px",
    labelStyle: { color: "#2a2345", fontWeight: 700 },
    itemStyle: { color: "#2a2345", fontWeight: 600 },
};

const getYearColor = (year) => {
    const palette = ["#6C4DFF", "#8E72FF", "#4A6FE8", "#9BA8FF", "#A9C6FF"];

    const index = DEFAULT_YEARS.indexOf(Number(year));
    return palette[index] || palette[0];
};

const getIntensityThemeColor = (index) => {
    return INTENSITY_THEME_COLORS[index % INTENSITY_THEME_COLORS.length];
};

const INTENSITY_LABELS = {
    no_rain: "No Rain",
    light: "Light",
    moderate: "Moderate",
    heavy: "Heavy",
    very_heavy: "Very Heavy",
    extreme: "Extreme",
};

function SpellTooltip({ active, payload }) {
    if (!active || !payload || !payload.length) {
        return null;
    }

    const item = payload[0].payload;

    return (
        <div className="chart-tooltip">
            <strong>{item.name}</strong>
            <div>{item.value} days</div>
            <div>Start: {formatDate(item.start_date)}</div>
            <div>End: {formatDate(item.end_date)}</div>
        </div>
    );
}

function ConsistencyTooltip({ active, payload }) {
    if (!active || !payload || !payload.length) {
        return null;
    }

    const item = payload[0].payload;

    return (
        <div className="chart-tooltip">
            <strong>{item.year}</strong>
            <div>{item.metricValue}%</div>
            <div>{item.metric}</div>
        </div>
    );
}

export default YearComparison;
