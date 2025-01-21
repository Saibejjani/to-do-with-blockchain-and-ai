import React, { useState } from "react";
import axios from "axios";

const AITaskAssistant = ({ tasks, onUpdatePriorities }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

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
      return response.data;
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
