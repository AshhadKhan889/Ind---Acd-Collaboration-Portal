import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Fade,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const defaultSuggestions = [
  "How do I apply for an opportunity?",
  "What should I update in my profile?",
  "How can industry partners post opportunities?",
];

const DomainChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "intro",
      role: "assistant",
      text: "Hi! I'm your collaboration assistant. Ask me about applying to opportunities, completing profiles, managing postings, or using the forum.",
      suggestions: defaultSuggestions,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const toggleOpen = useCallback(() => {
    setOpen((prev) => !prev);
    setTimeout(() => {
      if (!open && inputRef.current) {
        inputRef.current.focus();
      }
    }, 200);
  }, [open]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, open]);

  const historyPayload = useMemo(
    () =>
      messages.map(({ role, text }) => ({
        role,
        text,
      })),
    [messages]
  );

  const resetConversation = useCallback(() => {
    setMessages([
      {
        id: "intro",
        role: "assistant",
        text: "Conversation reset. Ask me anything about opportunities, profiles, dashboards, or collaborations on this platform.",
        suggestions: defaultSuggestions,
      },
    ]);
    setError("");
    setInput("");
  }, []);

  const handleSend = useCallback(
    async (overrideText) => {
      const rawText =
        typeof overrideText === "string" && overrideText.length
          ? overrideText
          : input;
      const trimmed = rawText.trim();
      if (!trimmed || loading) {
        return;
      }

      const userMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        text: trimmed,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setError("");
      setLoading(true);

      try {
        const response = await axios.post("http://localhost:5000/api/chatbot", {
          message: trimmed,
          history: historyPayload,
        });

        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            text: response.data?.reply ?? "I'm here to help with the platform.",
            suggestions: response.data?.suggestions ?? [],
            topic: response.data?.topic,
            relevance: response.data?.relevance,
          },
        ]);
      } catch (err) {
        setError("I couldn't reach the assistant service. Please try again.");
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-error-${Date.now()}`,
            role: "assistant",
            text: "I couldn't reach the assistant service. Please try again shortly.",
            suggestions: defaultSuggestions,
            topic: "connection-error",
            relevance: "none",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [historyPayload, input, loading]
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleQuickPrompt = useCallback(
    (prompt) => {
      setInput(prompt);
      setTimeout(() => {
        handleSend(prompt);
      }, 0);
    },
    [handleSend]
  );

  const renderMessage = (message) => {
    const isAssistant = message.role === "assistant";
    return (
      <Box
        key={message.id}
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          flexDirection: isAssistant ? "row" : "row-reverse",
        }}
      >
        <Avatar
          sx={{
            bgcolor: isAssistant ? "primary.main" : "secondary.main",
            width: 32,
            height: 32,
            fontSize: 14,
          }}
        >
          {isAssistant ? "AI" : "You"}
        </Avatar>
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            maxWidth: "75%",
            bgcolor: isAssistant ? "grey.100" : "primary.main",
            color: isAssistant ? "text.primary" : "primary.contrastText",
            borderRadius: 3,
            borderTopLeftRadius: isAssistant ? 0 : 24,
            borderTopRightRadius: isAssistant ? 24 : 0,
            border: isAssistant ? "1px solid #e0e0e0" : "none",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          <Typography variant="body2">{message.text}</Typography>
          {isAssistant && message.suggestions && message.suggestions.length > 0 && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Try asking:
              </Typography>
              <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {message.suggestions.slice(0, 3).map((suggestion) => (
                  <Chip
                    key={`${message.id}-suggestion-${suggestion}`}
                    label={suggestion}
                    size="small"
                    onClick={() => handleQuickPrompt(suggestion)}
                    sx={{ bgcolor: "background.paper" }}
                  />
                ))}
              </Box>
            </>
          )}
        </Paper>
      </Box>
    );
  };

  return (
    <>
      <Tooltip title={open ? "Close assistant" : "Ask platform assistant"} placement="left">
        <IconButton
          color="primary"
          onClick={toggleOpen}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            bgcolor: "white",
            boxShadow: 3,
            "&:hover": { bgcolor: "grey.50" },
            zIndex: 1400,
          }}
        >
          {open ? <CloseIcon /> : <ChatIcon />}
        </IconButton>
      </Tooltip>

      <Fade in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 92,
            right: 24,
            width: { xs: "90vw", sm: 360 },
            maxHeight: 520,
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
            zIndex: 1400,
          }}
        >
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Collaboration Assistant
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Focused on this platform only
              </Typography>
            </Box>
            <IconButton size="small" color="inherit" onClick={resetConversation}>
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box
            ref={containerRef}
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              bgcolor: "background.default",
            }}
          >
            {messages.map((message) => renderMessage(message))}
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                <CircularProgress size={20} />
              </Box>
            )}
          </Box>

          {error && (
            <Typography variant="caption" color="error" sx={{ px: 2, pb: 0.5 }}>
              {error}
            </Typography>
          )}

          <Divider />

          <Box sx={{ p: 1.5, display: "flex", gap: 1, alignItems: "flex-end" }}>
            <TextField
              inputRef={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about opportunities, profiles..."
              multiline
              maxRows={4}
              fullWidth
              size="small"
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Fade>
    </>
  );
};

export default DomainChatbot;

