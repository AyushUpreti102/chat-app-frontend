import axios from "../api";

export const login = async (usernameOREmail, password) => {
  try {
    return await axios.post("/auth/login", {
      usernameOREmail,
      password,
    });
  } catch (error) {
    console.log("Error while login", error.message);
    return { error };
  }
};

export const register = async (username, email, password) => {
  try {
    return await axios.post("/auth/signup", {
      username,
      email,
      password,
    });
  } catch (error) {
    console.log("Error while login", error.message);
    return { error };
  }
};

export const logout = () => {
  localStorage.removeItem("user");
  location.reload();
};
