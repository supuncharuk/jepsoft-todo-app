import React from "react";
import Login from "../components/Auth/Login";
import "../src/index.css";

const LoginPage = () => {
  return (
    <div className="bg-gray-100 dark:bg-gray-900">
      <Login />
    </div>
  );
};

export default LoginPage;