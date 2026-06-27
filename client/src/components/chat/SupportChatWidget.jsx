import React, { useState, useEffect, useRef, useContext } from "react";
import io from "socket.io-client";
import axios from "axios";
import { 
    Box, 
    Fab, 
    Paper, 
    Typography, 
    TextField, 
    IconButton, 
    Stack, 
    Avatar, 
    Badge 
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { DataContext } from "../../context/dataprovider";

const SupportChatWidget = () => {
    const { account } = useContext(DataContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);
    
    const socketRef = useRef(null);
    const chatEndRef = useRef(null);

    // Socket connection setup
    useEffect(() => {
        if (!account) return;

        // Connect to backend Socket.io
        const backendUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
        socketRef.current = io(backendUrl);

        // Join user's personal chat room (identified by username)
        socketRef.current.emit("join-room", { userId: account });

        // Load historical chat logs
        const fetchChatLogs = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/chat/history/${account}`);
                setMessages(response.data);
            } catch (error) {
                console.error("Error loading chat logs:", error);
            }
        };
        fetchChatLogs();

        // Listen for new messages
        socketRef.current.on("receive-message", (messageData) => {
            setMessages((prev) => [...prev, messageData]);
            
            // If the chat widget is closed, increase unread badge count
            if (!isOpen) {
                setUnreadCount((prev) => prev + 1);
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [account, isOpen]);

    // Scroll to bottom helper
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleToggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setUnreadCount(0); // Reset unread count when opened
        }
    };

    const handleSendMessage = () => {
        if (!inputText.trim() || !socketRef.current) return;

        const messageData = {
            userId: account,
            sender: account,
            text: inputText.trim()
        };

        // Emit message to Socket.io server
        socketRef.current.emit("send-message", messageData);
        setInputText("");
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    // Do not show widget if user is not logged in or is the admin
    if (!account || account === "admin" || account === "Admin") {
        return null;
    }

    return (
        <Box sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
            {/* Floating Action Button */}
            {!isOpen && (
                <Badge badgeContent={unreadCount} color="error" overlap="circular">
                    <Fab 
                        color="primary" 
                        onClick={handleToggleChat}
                        sx={{ bgcolor: "#2874f0", "&:hover": { bgcolor: "#1b5ec2" } }}
                    >
                        <ChatIcon />
                    </Fab>
                </Badge>
            )}

            {/* Chat Box Popup */}
            {isOpen && (
                <Paper 
                    elevation={10} 
                    sx={{ 
                        width: 320, 
                        height: 430, 
                        display: "flex", 
                        flexDirection: "column",
                        borderRadius: 3, 
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.1)"
                    }}
                >
                    {/* Header */}
                    <Box 
                        sx={{ 
                            p: 2, 
                            bgcolor: "#2874f0", 
                            color: "white", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "space-between" 
                        }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 32, height: 32 }}>
                                <SupportAgentIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                                    ShopSphere Support
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                    Online • Live Chat
                                </Typography>
                            </Box>
                        </Stack>
                        <IconButton size="small" onClick={handleToggleChat} sx={{ color: "white" }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Messages Body */}
                    <Box 
                        sx={{ 
                            flexGrow: 1, 
                            p: 2, 
                            overflowY: "auto", 
                            bgcolor: "#f5f7fa",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1
                        }}
                    >
                        {messages.length === 0 && (
                            <Box sx={{ text: "center", mt: 4, px: 2 }}>
                                <Typography variant="body2" color="textSecondary" align="center">
                                    Hello! How can we help you today? Send a message and our support admin will reply instantly.
                                </Typography>
                            </Box>
                        )}
                        
                        {messages.map((msg, index) => {
                            const isMe = msg.sender === account;
                            return (
                                <Box 
                                    key={index} 
                                    sx={{ 
                                        alignSelf: isMe ? "flex-end" : "flex-start",
                                        maxWidth: "75%",
                                        p: 1.25,
                                        borderRadius: 2,
                                        bgcolor: isMe ? "#2874f0" : "white",
                                        color: isMe ? "white" : "black",
                                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                        border: isMe ? "none" : "1px solid rgba(0,0,0,0.05)"
                                    }}
                                >
                                    <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                                        {msg.text}
                                    </Typography>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            display: "block", 
                                            textAlign: "right", 
                                            fontSize: "0.65rem",
                                            opacity: 0.6,
                                            mt: 0.5
                                        }}
                                    >
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </Box>
                            );
                        })}
                        <div ref={chatEndRef} />
                    </Box>

                    {/* Message Input Footer */}
                    <Box sx={{ p: 1.5, borderTop: "1px solid rgba(0,0,0,0.08)", bgcolor: "white" }}>
                        <Stack direction="row" spacing={1}>
                            <TextField
                                size="small"
                                fullWidth
                                variant="outlined"
                                placeholder="Type your message..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 5
                                    }
                                }}
                            />
                            <IconButton 
                                color="primary" 
                                disabled={!inputText.trim()} 
                                onClick={handleSendMessage}
                                sx={{ bgcolor: "#2874f0", color: "white", "&:hover": { bgcolor: "#1c5ebf" }, "&.Mui-disabled": { bgcolor: "rgba(0,0,0,0.04)" } }}
                            >
                                <SendIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default SupportChatWidget;
