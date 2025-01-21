const express = require("express");
const router = express.Router();
const taskAIAgent = require("../services/aiAgent");

router.post("/analyze-priorities", async (req, res) => {
  try {
    const { tasks, preferences } = req.body;
    const analysis = await taskAIAgent.analyzePriorities(tasks, preferences);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/suggest-reminders", async (req, res) => {
  try {
    const { task, preferences } = req.body;
    const suggestions = await taskAIAgent.suggestReminders(task, preferences);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
