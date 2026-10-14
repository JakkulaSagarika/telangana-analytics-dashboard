import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/page-navigation.css";

function PageNavigation() {

    const navigate = useNavigate();

    return (

        <div className="page-navigation">

            <button
                className="nav-arrow-btn"
                onClick={() => navigate(-1)}
                title="Go Back"
            >
                <FaArrowLeft />
            </button>

            <button
                className="nav-arrow-btn"
                onClick={() => navigate(1)}
                title="Go Forward"
            >
                <FaArrowRight />
            </button>

        </div>

    );

}

export default PageNavigation;