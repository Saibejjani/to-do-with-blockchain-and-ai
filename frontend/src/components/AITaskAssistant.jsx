import React, { useState } from "react";
import axios from "axios";

const AITaskAssistant = ({ tasks, onUpdatePriorities }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [reminderSuggestions, setReminderSuggestions] = useState({});
  const [error, setError] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  const userPreferences = {
    workingHours: "9:00-17:00",
    completionPatterns: {
      preferredTimes: ["morning", "afternoon"],
      typicalDuration: "2 hours",
    },
    priorities: {
      urgency: "high",
      importance: "medium",
    },
  };

  const getAIAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://localhost:8080/ai/analyze-priorities",
        {
          tasks,
          preferences: userPreferences,
        },
        { withCredentials: true },
      );
      setAnalysis(response.data);
    } catch (err) {
      setError("Failed to get AI analysis");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestedReminders = async (task) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://localhost:8080/ai/suggest-reminders",
        {
          task,
          preferences: userPreferences,
        },
        { withCredentials: true },
      );
      setReminderSuggestions((prev) => ({
        ...prev,
        [task._id]: response.data,
      }));
      setActiveTask(task._id);
    } catch (err) {
      setError("Failed to get reminder suggestions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">AI Task Assistant</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <div className="space-y-4">
        <button
          onClick={getAIAnalysis}
          disabled={loading}
          className={`w-full px-4 py-2 rounded ${
            loading ? "bg-gray-300" : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {loading ? "Analyzing..." : "Analyze Tasks"}
        </button>

        {/* Task List with Reminder Suggestions */}
        <div className="mt-4 space-y-4">
          {tasks.map((task) => (
            <div key={task._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{task.title}</h3>
                <button
                  onClick={() => getSuggestedReminders(task)}
                  disabled={loading}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Get Reminder Suggestions
                </button>
              </div>

              {/* Show reminder suggestions if available for this task */}
              {reminderSuggestions[task._id] && activeTask === task._id && (
                <div className="bg-blue-50 p-3 rounded mt-2">
                  <h4 className="font-medium text-sm mb-2">
                    Reminder Suggestions
                  </h4>
                  <div className="text-sm space-y-1">
                    {reminderSuggestions[task._id].suggestions
                      ?.split("\n")
                      .map((suggestion, index) => (
                        <div key={index} className="text-gray-700">
                          {suggestion}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Existing Analysis Display */}
        {analysis && (
          <div className="mt-4 space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium mb-2">Priority Analysis</h3>
              <div className="space-y-2">
                {analysis.parsed.priorities.map((priority, index) => (
                  <div key={index} className="text-sm">
                    {priority}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium mb-2">Suggested Timeframes</h3>
              <div className="space-y-2">
                {analysis.parsed.timeframes.map((timeframe, index) => (
                  <div key={index} className="text-sm">
                    {timeframe}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium mb-2">Dependencies & Risks</h3>
              <div className="space-y-2">
                {analysis.parsed.dependencies.map((dependency, index) => (
                  <div key={index} className="text-sm">
                    {dependency}
                  </div>
                ))}
                {analysis.parsed.risks.map((risk, index) => (
                  <div key={index} className="text-sm text-red-600">
                    {risk}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITaskAssistant;
