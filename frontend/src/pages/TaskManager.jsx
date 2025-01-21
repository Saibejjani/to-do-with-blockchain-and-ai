import { useState, useEffect } from "react";
import axios from "axios";
import { useWeb3 } from "../contexts/Web3Context";
import { useAuth } from "../contexts/AuthContext";
import Web3 from "web3";
import AITaskAssistant from "../components/AITaskAssistant";
import { SUPPORTED_NETWORKS, DEFAULT_NETWORK } from "../contracts/networks";
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
    );
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:8080/tasks", {
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
      await axios.post("http://localhost:8080/tasks", newTask, {
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
          `http://localhost:8080/tasks/${taskId}`,
          {
            ...task,
            status: "completed",
            transactionHash: tx.transactionHash,
          },
          {
            withCredentials: true,
          },
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
      await axios.delete(`http://localhost:8080/tasks/${taskId}`, {
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
      await axios.put(`http://localhost:8080/tasks/${taskId}`, editTask, {
        withCredentials: true,
      });
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
    <div className="container mx-auto px-4 py-8">
      {renderWeb3Status()}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Add New Task</h2>
        <form onSubmit={handleNewTaskSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Title</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Description</label>
            <textarea
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Due Date</label>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) =>
                setNewTask({ ...newTask, dueDate: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Status</label>
            <select
              value={newTask.status}
              onChange={(e) =>
                setNewTask({ ...newTask, status: e.target.value })
              }
              className="w-full p-2 border rounded"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Task
          </button>
        </form>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Your Tasks</h2>
        {tasks.map((task) => (
          <div key={task._id} className="bg-white p-6 rounded-lg shadow-md">
            {isEditing === task._id ? (
              // Edit Form
              <form
                onSubmit={(e) => handleEditSubmit(e, task._id)}
                className="space-y-4"
              >
                <input
                  type="text"
                  value={editTask.title}
                  onChange={(e) =>
                    setEditTask({ ...editTask, title: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
                <textarea
                  value={editTask.description}
                  onChange={(e) =>
                    setEditTask({ ...editTask, description: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
                <input
                  type="date"
                  value={editTask.dueDate.split("T")[0]}
                  onChange={(e) =>
                    setEditTask({ ...editTask, dueDate: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
                <select
                  value={editTask.status}
                  onChange={(e) =>
                    setEditTask({ ...editTask, status: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="space-x-2">
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              // Task Display
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{task.title}</h3>
                    <p className="text-gray-600 mt-2">{task.description}</p>
                    <div className="mt-2 space-x-4">
                      <span className="text-sm text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${getStatusColor(task.status)}`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        setIsEditing(task._id);
                        setEditTask({
                          ...task,
                          dueDate: task.dueDate.split("T")[0],
                        });
                      }}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <AITaskAssistant
        tasks={tasks}
        onUpdatePriorities={(newPriorities) => {
          // Handle priority updates
        }}
      />
    </div>
  );
};

export default TaskManager;
