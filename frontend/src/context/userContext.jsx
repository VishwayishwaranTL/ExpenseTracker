import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

    useEffect(() => {
    try {
        const storedUser = localStorage.getItem("user");
        if (storedUser && storedUser !== "undefined") {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        } else {
        localStorage.removeItem("user");
        }
    } catch (err) {
        console.error("Failed to parse user from localStorage:", err.message);
        localStorage.removeItem("user");
    }
    }, []);


    const updateUser = (userData) => {
    if (!userData) {
        console.warn("Tried to update user with undefined data");
        return;
    }
    try {
        const jsonString = JSON.stringify(userData);
        localStorage.setItem("user", jsonString);
        setUser(userData);
    } catch (err) {
        console.error("Failed to stringify userData:", err.message);
    }
    };

  const clearUser = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
