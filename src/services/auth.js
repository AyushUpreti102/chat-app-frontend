import axios from "../api";
import { useUserStore } from "src/stores/userStore";

export const login = async (usernameOREmail, password) => {
  try {
    const response = await axios.post("/auth/login", {
      usernameOREmail,
      password,
    });

    return response.data;
  } catch (error) {
    console.log("Error while login", error.message);
    throw error?.response?.data || error;
  }
};

export const register = async (username, email, password) => {
  try {
    const response = await axios.post(
      "/auth/signup",
      {
        username,
        email,
        password,
      },
      {
        withCredentials: false,
      },
    );

    return response.data;
  } catch (error) {
    console.log("Error while login", error.message);
    throw error?.response?.data || error;
  }
};

export const checkAuth = async () => {
  const userStore = useUserStore();
  try {
    const { data } = await axios.get("/auth/me");
    userStore.setIsAuthenticated(data.isAuth);
    userStore.setUser(data.user);
    return data.isAuth;
  } catch {
    return false;
  }
};

export const logout = async () => {
  try {
    await axios.post("/auth/logout");
  } catch (e) {
    console.error("Logout error", e);
  }
};
