import "./../styles/cards.css";

import secretariat from "../assets/images/secretariat.png";
import budha from "../assets/images/budha.png";
import bogatha from "../assets/images/bogatha.png";
import charminar from "../assets/images/charminar.png";
import ramappa from "../assets/images/ramappa.png";
import golkonda from "../assets/images/golkonda.png";

function KPICard({ title, value }) {

    const cardConfig = {

        "Total Births": {
            type: "birth",
            subtitle: "Registered Births",
            image: secretariat,
        },

        "Male Births": {
            type: "male",
            subtitle: "Registered Male Births",
            image: charminar,
        },

        "Female Births": {
            type: "female",
            subtitle: "Registered Female Births",
            image: ramappa,
        },

        "Other Births": {
            type: "other",
            subtitle: "Registered Other Births",
            image: golkonda,
        },

        "Total Deaths": {
            type: "death",
            subtitle: "Registered Deaths",
            image: budha,
        },

        "Male Deaths": {
            type: "male",
            subtitle: "Registered Male Deaths",
            image: charminar,
        },

        "Female Deaths": {
            type: "female",
            subtitle: "Registered Female Deaths",
            image: ramappa,
        },

        "Other Deaths": {
            type: "other",
            subtitle: "Registered Other Deaths",
            image: golkonda,
        },

        "Districts": {
            type: "district",
            subtitle: "District Coverage",
            image: bogatha,
        },

    };

    const config = cardConfig[title] || {
        type: "default",
        subtitle: "",
        image: secretariat,
    };

    return (

        <div className={`kpi-card ${config.type}`}>

            {/* Background Image */}

            <div
                className="kpi-image"
                style={{
                    backgroundImage: `url(${config.image})`,
                }}
            />

            {/* Gradient Overlay */}

            <div className="kpi-overlay"></div>

            {/* Decorative Glow */}

            <div className="card-glow"></div>

            {/* Left Accent */}

            <div className="card-accent"></div>

            {/* Shine Effect */}

            <div className="card-shine"></div>

            {/* Content */}

            <div className="kpi-body">

                <div className="kpi-content">

                    <span className="kpi-label">
                        {title}
                    </span>

                    <h2 className="kpi-value">
                        {value}
                    </h2>

                    {config.subtitle && (

                        <p className="kpi-subtitle">

                            {config.subtitle}

                        </p>

                    )}

                </div>

            </div>

        </div>

    );

}

export default KPICard;