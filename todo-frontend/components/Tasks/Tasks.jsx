import React, { useEffect, useState } from "react";
import axios from "axios";

// Main Tasks component
const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "low",
    due_date: "",
  });

  const token = localStorage.getItem("token");

  // Fetch tasks from API
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.q = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const res = await axios.get("http://localhost:8000/api/tasks/list", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setTasks(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, priorityFilter]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Delete task
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/tasks/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Open modal for add/edit
  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setForm({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date || "",
      });
    } else {
      setEditingTask(null);
      setForm({ title: "", description: "", status: "pending", priority: "low", due_date: "" });
    }
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update task
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        const res = await axios.put(
          `http://localhost:8000/api/tasks/update/${editingTask.id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTasks(tasks.map((t) => (t.id === editingTask.id ? res.data : t)));
      } else {
        const res = await axios.post("http://localhost:8000/api/tasks/create", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks([res.data, ...tasks]);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} min-h-screen`}>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Filters + Add */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded w-full md:w-1/6 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border rounded w-full md:w-1/6 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            + Add Task
          </button>
        </div>

        {/* Tasks Table */}
        {loading ? (
          <p className="text-center">Loading tasks...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                  <th className="py-2 px-4 text-left">Title</th>
                  <th className="py-2 px-4 text-left">Description</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Priority</th>
                  <th className="py-2 px-4 text-left">Due Date</th>
                  <th className="py-2 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No tasks found.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr
                      key={task.id}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="py-2 px-4">{task.title}</td>
                      <td className="py-2 px-4">{task.description}</td>
                      <td className="py-2 px-4 capitalize">{task.status}</td>
                      <td className="py-2 px-4 capitalize">{task.priority}</td>
                      <td className="py-2 px-4">{task.due_date || "-"}</td>
                      <td className="py-2 px-4 text-center space-x-2">
                        <button
                          onClick={() => openModal(task)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6 relative">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                {editingTask ? "Edit Task" : "Add Task"}
              </h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={form.title}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={form.description}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <div className="flex gap-2">
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleFormChange}
                    className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <input
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  >
                    {editingTask ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;