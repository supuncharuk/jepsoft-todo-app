import React from "react";
import Tasks from "../components/Tasks/Tasks";
import "../src/index.css";

const Dashboard = () => {
  return (
    <div className="bg-gray-100 dark:bg-gray-900">
      <Tasks />
    </div>
  );
};

export default Dashboard;