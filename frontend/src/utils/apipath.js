export const BASE_URL = import.meta.env.VITE_API_URL;

export const API_PATHS = {
    AUTH:{
        LOGIN: "/api/v1/auth/login",
        REGISTER: "/api/v1/auth/register",
        GET_USER_INFO: "/api/v1/auth/getUser",
        UPDATE_USER: "/api/v1/auth/profile"
    },
    DASHBOARD:{
        GET_DATA: "/api/v1/dashboard",
    },
    INCOME:{
        ADD_INCOME: "/api/v1/income/add",
        DELETE_INCOME: (incomeId) => `/api/v1/income/${incomeId}`,
        GET_ALL_INCOME: "/api/v1/income/get",
        DOWNLOAD_INCOME: "/api/v1/income/downloadexcel",
    },
    EXPENSE:{
        ADD_EXPENSE: "/api/v1/expense/add",
        DELETE_EXPENSE: (expenseId) => `/api/v1/expense/${expenseId}`,
        GET_ALL_EXPENSE: "/api/v1/expense/get",
        DOWNLOAD_EXPENSE: "/api/v1/expense/downloadexcel",
    },
    IMAGE:{
        UPLOAD_IMAGE: "api/v1/auth/upload-image",
    },
};