import { useRef, useState } from "react";

import { useRainfall } from "../context/RainfallContext";

import "../styles/dashboard.css";

import RainfallCalendar from "../components/RainfallCalendar";
import DailyRainfallPanel from "../components/DailyRainfallPanel";


function Dashboard() {

    const { selectedYear } = useRainfall();

    const [selectedDate, setSelectedDate] = useState(null);

    const dailyPanelRef = useRef(null);


    const handleDateSelect = (date) => {

        console.log(
            "Selected date:",
            date,
            "Year:",
            selectedYear
        );

        setSelectedDate(date);

        setTimeout(() => {

            if (dailyPanelRef.current) {

                dailyPanelRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });

            }

        }, 150);

    };


    return (

        <div className="dashboard-page">

            {/* ==================================================
                BACKGROUND
            ================================================== */}

            <div className="dashboard-background"></div>


            {/* ==================================================
                CONTENT
            ================================================== */}

            <div className="dashboard-content">


                {/* ==================================================
                    INTRO
                ================================================== */}

                <section className="dashboard-intro">

                    <div>

                        <p className="section-eyebrow">
                            TELANGANA RAINFALL ANALYTICS
                        </p>

                        <h2>
                            Rainfall Overview
                        </h2>

                        <p className="dashboard-description">
                            Explore rainfall, humidity and
                            mandal-level patterns across
                            Telangana during {selectedYear}.
                        </p>

                    </div>


                    <div className="dashboard-year">
                        {selectedYear}
                    </div>

                </section>


                {/* ==================================================
                    RAINFALL CALENDAR
                ================================================== */}

                <section className="dashboard-card calendar-card">

                    <RainfallCalendar
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                    />

                </section>


                {/* ==================================================
                    DAILY RAINFALL ANALYSIS
                ================================================== */}

                <section
                    ref={dailyPanelRef}
                    className="dashboard-card daily-card"
                    id="daily-rainfall-analysis"
                >

                    <DailyRainfallPanel
                        selectedDate={selectedDate}
                    />

                </section>


            </div>

        </div>

    );

}


export default Dashboard;