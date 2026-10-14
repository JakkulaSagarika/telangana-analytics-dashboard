import axios from "axios";


const API = import.meta.env.VITE_BIRTHDEATH_API_BASE_URL || "/api/birthdeath";


// Dashboard KPI data

export const getDashboardData = async () => {

    const response = await axios.get(
        `${API}/dashboard/`
    );

    return response.data;

};



// Selected district information

export const getDistrictData = async (district) => {

    const response = await axios.get(
        `${API}/district/${district}/`
    );

    return response.data;

};



// Chart data

export const getChartData = async () => {

    const response = await axios.get(
        `${API}/charts/`
    );

    return response.data;

};



// District table data

export const getDistrictTable = async () => {

    const response = await axios.get(
        `${API}/districts/`
    );

    return response.data;

};



// District graph data

export const getDistrictChartData = async () => {

    const response = await axios.get(
        `${API}/charts/`
    );

    return response.data;

};
