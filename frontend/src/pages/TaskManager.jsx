import { useState, useEffect } from "react";
import axios from "axios";
import { useWeb3 } from "../contexts/Web3Context";
import { useAuth } from "../contexts/AuthContext";
import Web3 from "web3";
import AITaskAssistant from "../components/AITaskAssistant";
import { SUPPORTED_NETWORKS, DEFAULT_NETWORK } from "../contracts/networks";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "pending",
  });
  const { user } = useAuth();
  const {
    web3,
    contract,
    account,
    chainId,
    loading: web3Loading,
    error: web3Error,
    connectWallet,
    switchNetwork,
    isNetworkSupported,
  } = useWeb3();
  const [isEditing, setIsEditing] = useState(null);
  const [editTask, setEditTask] = useState({});

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const createTaskHash = (task) => {
    return web3.utils.soliditySha3(
      { t: "string", v: task.title },
      { t: "string", v: task.description },
      { t: "string", v: task.status },
      { t: "uint256", v: new Date(task.dueDate).getTime() },
      { t: "string", v: user._id }
    );
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/tasks`, {
        withCredentials: true,
      });
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch tasks");
      setLoading(false);
    }
  };

  const renderWeb3Status = () => {
    if (!user) {
      return <div className="text-red-600">Please login to connect wallet</div>;
    }

    if (web3Loading) {
      return <div className="text-yellow-600">Connecting to Web3...</div>;
    }

    if (web3Error) {
      return <div className="text-red-600">{web3Error}</div>;
    }

    if (!web3) {
      return (
        <button
          onClick={connectWallet}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Connect Wallet
        </button>
      );
    }

    if (!isNetworkSupported) {
      return (
        <button
          onClick={switchNetwork}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Switch to {SUPPORTED_NETWORKS[DEFAULT_NETWORK].name}
        </button>
      );
    }

    return (
      <div className="text-green-600">
        Connected Account: {account?.slice(0, 6)}...{account?.slice(-4)}
        <br />
        Network: {SUPPORTED_NETWORKS[chainId]?.name}
      </div>
    );
  };

  const handleNewTaskSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Please login first");
      return;
    }

    if (!web3 || !contract || !account) {
      setError("Please connect your wallet");
      return;
    }

    if (!isNetworkSupported) {
      setError(`Please switch to ${SUPPORTED_NETWORKS[DEFAULT_NETWORK].name}`);
      return;
    }
    try {
      await axios.post(`${BACKEND_URL}/tasks`, newTask, {
        withCredentials: true,
      });
      setNewTask({
        title: "",
        description: "",
        dueDate: "",
        status: "pending",
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
      setError("Failed to create task");
    }
  };

  const handleMarkComplete = async (taskId, task) => {
    try {
      if (!web3 || !contract || !account) {
        throw new Error("Web3 not initialized");
      }

      const taskHash = createTaskHash(task);

      // Check if task is already completed on blockchain
      const isCompleted = await contract.methods
        .isTaskCompleted(taskHash)
        .call();
      if (isCompleted) {
        throw new Error("Task already marked as complete on blockchain");
      }

      // Mark task as complete on blockchain
      const tx = await contract.methods.markTaskComplete(taskHash).send({
        from: account,
      });

      if (tx.status) {
        // Update task status in backend
        await axios.put(
          `${BACKEND_URL}/tasks/${taskId}`,
          {
            ...task,
            status: "completed",
            transactionHash: tx.transactionHash,
          },
          {
            withCredentials: true,
          }
        );

        fetchTasks();
      }
    } catch (err) {
      setError(err.message || "Failed to mark task as complete");
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${BACKEND_URL}/tasks/${taskId}`, {
        withCredentials: true,
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
      setError("Failed to delete task");
    }
  };

  const handleEditSubmit = async (e, taskId) => {
    e.preventDefault();
    try {
      if (editTask.status === "completed") {
        await handleMarkComplete(taskId, editTask);
      } else {
        await axios.put(`${BACKEND_URL}/tasks/${taskId}`, editTask, {
          withCredentials: true,
        });
      }
      setIsEditing(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
      setError("Failed to update task");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-200 text-yellow-800";
      case "in-progress":
        return "bg-blue-200 text-blue-800";
      case "completed":
        return "bg-green-200 text-green-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error)
    return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {renderWeb3Status()}

        {/* Add New Task Section */}
        <div className="mb-8 bg-white p-8 rounded-xl shadow-2xl">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Task</h2>
          </div>

          <form onSubmit={handleNewTaskSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                placeholder="Enter task title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                placeholder="Enter task description"
                rows="4"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={newTask.status}
                  onChange={(e) =>
                    setNewTask({ ...newTask, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-150 ease-in-out
                ${
                  !web3 || !contract || !account || !isNetworkSupported
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                }`}
              disabled={!web3 || !contract || !account || !isNetworkSupported}
            >
              Add Task
            </button>
          </form>
        </div>

        {/* Task List Section */}
        <div className="space-y-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>
          </div>

          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white p-6 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              {isEditing === task._id ? (
                // Edit Form
                <form
                  onSubmit={(e) => handleEditSubmit(e, task._id)}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editTask.title}
                      onChange={(e) =>
                        setEditTask({ ...editTask, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editTask.description}
                      onChange={(e) =>
                        setEditTask({
                          ...editTask,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      rows="3"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={editTask.dueDate.split("T")[0]}
                        onChange={(e) =>
                          setEditTask({ ...editTask, dueDate: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={editTask.status}
                        onChange={(e) =>
                          setEditTask({ ...editTask, status: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-150"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(null)}
                      className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-150"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // Task Display
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {task.title}
                    </h3>
                    <p className="text-gray-600 mt-2">{task.description}</p>
                    <div className="mt-4 flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setIsEditing(task._id);
                        setEditTask({
                          ...task,
                          dueDate: task.dueDate.split("T")[0],
                        });
                      }}
                      className="text-indigo-600 hover:text-indigo-700 transition-colors duration-150"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="text-red-600 hover:text-red-700 transition-colors duration-150"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8">
          <AITaskAssistant
            tasks={tasks}
            onUpdatePriorities={(newPriorities) => {
              console.log("New Priorities", newPriorities);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
