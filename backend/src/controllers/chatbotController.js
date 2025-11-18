const { getChatbotResponse } = require("../services/chatbotService");

const normalizeHistory = (history) => {
  if (!Array.isArray(history)) {
    return [];
  }
  return history
    .filter(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.role === "string" &&
        typeof item.text === "string"
    )
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      text: item.text.trim(),
    }))
    .filter((item) => item.text.length);
};

const handleChat = async (req, res) => {
  const { message, history } = req.body || {};

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      message:
        "Please provide a `message` string so the assistant can respond.",
    });
  }

  try {
    const normalizedHistory = normalizeHistory(history);
    const response = await getChatbotResponse(message, normalizedHistory);

    return res.json({
      reply: response.reply,
      topic: response.topic,
      relevance: response.relevance,
      suggestions: response.suggestions,
    });
  } catch (error) {
    console.error("Error in chatbot controller:", error);
    return res.status(500).json({
      message: "An error occurred while processing your request. Please try again.",
      reply: "I'm experiencing technical difficulties. Please try again in a moment.",
      topic: "error",
      relevance: "none",
      suggestions: [
        "How do I apply for an opportunity?",
        "Where can I track my applications?",
        "How do comments work?",
      ],
    });
  }
};

module.exports = {
  handleChat,
};

