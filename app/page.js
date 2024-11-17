'use client';
import './globals.css';
import { Box, Button, Stack, TextField, Typography, CircularProgress } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import SendIcon from '@mui/icons-material/Send';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Welcome to Cro! Your AI diabetes chatbot. How can I assist you today?",
    },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);
    const userMessage = message;
    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: userMessage }]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I apologize, but I've encountered an error. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box
      className="scrollbar-custom"
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: `linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6))`,
        fontFamily: 'Orbitron, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        color: '#ffffff',
        margin: 0,
        padding: 0,
      }}
    >
      <Stack
        direction={'column'}
        sx={{
          width: '100%',
          height: '100%',
          maxWidth: '600px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)',
          bgcolor: '#1e1e1e',
          backdropFilter: 'blur(15px)',
          border: '1px solid #00bcd4',
          p: 3,
          spacing: 2,
          position: 'relative',
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            color: '#00bcd4',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0, 255, 255, 0.5)',
            letterSpacing: '2px',
            borderBottom: '2px solid #00bcd4',
            paddingBottom: '10px',
          }}
        >
          Cro: Your AI Diabetes Assistant
        </Typography>
        <Stack
          direction={'column'}
          spacing={2}
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            padding: 2,
            '&::-webkit-scrollbar': {
              width: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#00bcd4',
              borderRadius: '10px',
            },
          }}
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: msg.role === 'assistant' ? 'flex-start' : 'flex-end',
                animation: 'fadeIn 0.5s ease',
              }}
            >
              <Box
                sx={{
                  bgcolor: msg.role === 'assistant' ? '#333' : '#00bcd4',
                  color: '#ffffff',
                  borderRadius: '12px',
                  p: 2,
                  maxWidth: '80%',
                  boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)',
                  wordBreak: 'break-word',
                }}
              >
                {msg.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Box
          component="form"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mt: 2,
            backgroundColor: '#1e1e1e',
            padding: 1,
            borderRadius: '12px',
            border: '1px solid #00bcd4',
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={4}
            variant="outlined"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            sx={{
              bgcolor: '#333',
              borderRadius: '12px',
              input: { color: '#ffffff' },
              '& fieldset': { borderColor: '#00bcd4' },
              '&:hover fieldset': { borderColor: '#00bcd4' },
              '&.Mui-focused fieldset': { borderColor: '#00bcd4' },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            endIcon={isLoading ? <CircularProgress size={24} /> : <SendIcon />}
            onClick={sendMessage}
            sx={{ height: '100%', borderRadius: '12px', bgcolor: '#00bcd4', '&:hover': { bgcolor: '#0097a7' } }}
          >
            Send
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
