const { LLMChain } = require("langchain/chains");
const { PromptTemplate } = require("@langchain/core/prompts");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { initializeAgentExecutorWithOptions } = require("langchain/agents");

class TaskAIAgent {
  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-1.0-pro",
      apiKey: process.env.GOOGLE_API_KEY,
    });

    this.prioritizationTemplate = new PromptTemplate({
      template: `
        Analyze the following tasks and provide prioritization advice:
        Tasks: {tasks}
        Current Date: {currentDate}
        User Preferences: {preferences}

        Please provide:
        1. Prioritized order of tasks
        2. Reasoning for each priority
        3. Suggested timeframes
        4. Any potential dependencies between tasks
        5. Risk factors to consider
      `,
      inputVariables: ["tasks", "currentDate", "preferences"],
    });

    this.reminderTemplate = new PromptTemplate({
      template: `
        Based on the following task and context, suggest optimal reminder times:
        Task: {task}
        Due Date: {dueDate}
        Current Date: {currentDate}
        User's Working Hours: {workingHours}
        Previous Completion Patterns: {completionPatterns}

        Provide:
        1. Recommended reminder schedule
        2. Reasoning for each reminder time
        3. Suggestions for breaking down the task
      `,
      inputVariables: [
        "task",
        "dueDate",
        "currentDate",
        "workingHours",
        "completionPatterns",
      ],
    });
  }

  async analyzePriorities(tasks, userPreferences) {
    const chain = new LLMChain({
      llm: this.model,
      prompt: this.prioritizationTemplate,
    });

    const result = await chain.call({
      tasks: JSON.stringify(tasks),
      currentDate: new Date().toISOString(),
      preferences: JSON.stringify(userPreferences),
    });

    return this.parseAIResponse(result.text);
  }

  async suggestReminders(task, userPreferences) {
    const chain = new LLMChain({
      llm: this.model,
      prompt: this.reminderTemplate,
    });

    const result = await chain.call({
      task: JSON.stringify(task),
      dueDate: task.dueDate,
      currentDate: new Date().toISOString(),
      workingHours: userPreferences.workingHours,
      completionPatterns: JSON.stringify(userPreferences.completionPatterns),
    });

    return this.parseAIResponse(result.text);
  }

  parseAIResponse(response) {
    // Add parsing logic based on your needs
    return {
      suggestions: response,
      parsed: this.extractStructuredData(response),
    };
  }

  extractStructuredData(response) {
    // Add custom parsing logic
    // This is a simple example - enhance based on your needs
    const sections = response.split("\n\n");
    return {
      priorities: sections[0]?.split("\n"),
      reasoning: sections[1]?.split("\n"),
      timeframes: sections[2]?.split("\n"),
      dependencies: sections[3]?.split("\n"),
      risks: sections[4]?.split("\n"),
    };
  }
}

module.exports = new TaskAIAgent();
