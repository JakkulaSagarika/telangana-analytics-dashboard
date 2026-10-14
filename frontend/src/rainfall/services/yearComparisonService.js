import apiClient from "../api/apiClient";

export const getYearComparison = async (years, signal) => {
    const response = await apiClient.get(
        "/year-comparison/",
        {
            params: { years: years.join(",") },
            signal,
        }
    );

    return response.data;
};
