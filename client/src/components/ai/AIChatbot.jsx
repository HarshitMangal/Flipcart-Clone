import React, { useState, useRef, useEffect, useContext } from 'react';
import { Box, Paper, Typography, TextField, IconButton, Fab, Zoom, Chip, Avatar, styled } from '@mui/material';
import { SmartToy, Close, Send, Forum } from '@mui/icons-material';
import axios from 'axios';
import { DataContext } from '../../context/dataprovider';

// Styled Components for Premium Aesthetics
const ChatFab = styled(Fab)`
    position: fixed;
    bottom: 25px;
    right: 25px;
    background: linear-gradient(135deg, #2874f0 0%, #1e56b3 100%);
    color: white;
    z-index: 9999;
    box-shadow: 0px 4px 20px rgba(40, 116, 240, 0.4);
    &:hover {
        background: linear-gradient(135deg, #1e56b3 0%, #17448f 100%);
        transform: scale(1.05);
    }
    transition: all 0.2s ease-in-out;
`;

const ChatWindow = styled(Paper)`
    position: fixed;
    bottom: 95px;
    right: 25px;
    width: 380px;
    height: 500px;
    display: flex;
    flex-direction: column;
    border-radius: 16px;
    overflow: hidden;
    z-index: 9999;
    box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(224, 224, 224, 0.8);
    background: #ffffff;
`;

const ChatHeader = styled(Box)`
    background: #2874f0;
    color: white;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
`;

const MessageList = styled(Box)`
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background-color: #f7f9fc;
`;

const MessageBubble = styled(Box)(({ isBot }) => ({
    alignSelf: isBot ? 'flex-start' : 'flex-end',
    maxWidth: '75%',
    backgroundColor: isBot ? '#ffffff' : '#2874f0',
    color: isBot ? '#333333' : '#ffffff',
    padding: '10px 14px',
    borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    fontSize: '13.5px',
    lineHeight: '1.4',
    wordBreak: 'break-word',
    border: isBot ? '1px solid #eef2f6' : 'none',
    whiteSpace: 'pre-wrap'
}));

const InputArea = styled(Box)`
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-top: 1px solid #eef2f6;
    background-color: #ffffff;
`;

const ChipsWrapper = styled(Box)`
    display: flex;
    gap: 8px;
    padding: 8px 12px;
    overflow-x: auto;
    background-color: #f7f9fc;
    border-top: 1px solid #eef2f6;
    &::-webkit-scrollbar {
        display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
`;

const TypingIndicator = styled(Typography)`
    font-size: 11px;
    color: #878787;
    margin-left: 10px;
    font-style: italic;
    display: flex;
    align-items: center;
    gap: 4px;
`;

const AIChatbot = () => {
    const { isLoginOpen } = useContext(DataContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', content: "Hi! 👋 I am your ShopSphere AI Assistant. Ask me anything about our products, deals, or recommendations!" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const messageEndRef = useRef(null);

    const quickQueries = [
        "Suggest a smartwatch ⌚",
        "Compare appliances 🔌",
        "Show gym/fitness bands 🏋️",
        "Best hair dryer ✂️"
    ];

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (textToSend) => {
        const queryText = textToSend || input;
        if (!queryText.trim()) return;

        // Add user message
        const updatedMessages = [...messages, { role: 'user', content: queryText }];
        setMessages(updatedMessages);
        setInput('');
        setIsTyping(true);

        try {
            const response = await axios.post('http://localhost:8000/api/chat', {
                messages: updatedMessages
            });

            setMessages(prev => [...prev, { role: 'bot', content: response.data.reply }]);
        } catch (error) {
            console.error("Failed to fetch AI response:", error);
            setMessages(prev => [...prev, { 
                role: 'bot', 
                content: "Oops! I ran into an issue connecting to my server. Please make sure the backend is running and try again!" 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <Box>
            {/* Floating FAB trigger */}
            {!isLoginOpen && (
                <ChatFab onClick={toggleChat} aria-label="chat">
                    {isOpen ? <Close /> : <Forum />}
                </ChatFab>
            )}

            {/* Chat Dialog Widget */}
            <Zoom in={isOpen && !isLoginOpen}>
                <ChatWindow elevation={6}>
                    {/* Header */}
                    <ChatHeader>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ bgcolor: 'white', width: 32, height: 32 }}>
                                <SmartToy sx={{ color: '#2874f0' }} />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                    ShopSphere AI Assistant
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#cce0ff', fontSize: '10px' }}>
                                    Powered by Gemini
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton size="small" onClick={toggleChat} sx={{ color: 'white' }}>
                            <Close fontSize="small" />
                        </IconButton>
                    </ChatHeader>

                    {/* Message List */}
                    <MessageList>
                        {messages.map((msg, index) => (
                            <MessageBubble key={index} isBot={msg.role === 'bot'}>
                                {msg.content}
                            </MessageBubble>
                        ))}
                        {isTyping && (
                            <TypingIndicator>
                                <SmartToy fontSize="inherit" /> AI is thinking...
                            </TypingIndicator>
                        )}
                        <div ref={messageEndRef} />
                    </MessageList>

                    {/* Quick Queries Suggestion */}
                    <ChipsWrapper>
                        {quickQueries.map((query, index) => (
                            <Chip 
                                key={index} 
                                label={query} 
                                size="small" 
                                onClick={() => handleSend(query)}
                                sx={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '1px solid #e0e0e0',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: '#e6f0ff',
                                        borderColor: '#2874f0'
                                    }
                                }} 
                            />
                        ))}
                    </ChipsWrapper>

                    {/* Input Field Area */}
                    <InputArea>
                        <TextField
                            placeholder="Ask me something..."
                            size="small"
                            fullWidth
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            disabled={isTyping}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '20px',
                                    backgroundColor: '#f1f3f6',
                                    fontSize: '13.5px',
                                    '& fieldset': { border: 'none' }
                                }
                            }}
                        />
                        <IconButton 
                            color="primary" 
                            onClick={() => handleSend()} 
                            disabled={!input.trim() || isTyping}
                            sx={{ 
                                backgroundColor: input.trim() ? '#2874f0' : 'transparent',
                                color: input.trim() ? '#ffffff' : '#ccc',
                                '&:hover': {
                                    backgroundColor: input.trim() ? '#1e56b3' : 'transparent',
                                }
                            }}
                        >
                            <Send fontSize="small" />
                        </IconButton>
                    </InputArea>
                </ChatWindow>
            </Zoom>
        </Box>
    );
};

export default AIChatbot;
