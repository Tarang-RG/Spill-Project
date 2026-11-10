import api from "./api";

export const registerUser = async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await api.post("/auth/login", credentials);

    const data = response.data;

    localStorage.setItem("token", data.token);
    localStorage.setItem(
        "user",
        JSON.stringify({
            userId: data.userId,
            fullName: data.fullName,
            email: data.email,
        })
    );

    return data;
};

export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};
export const getCurrentUser = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};