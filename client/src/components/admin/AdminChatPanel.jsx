import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    List, 
    ListItemButton, 
    ListItemText, 
    Avatar, 
    Divider, 
    TextField, 
    IconButton, 
    Stack 
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import PersonIcon from "@mui/icons-material/Person";

const AdminChatPanel = () => {
    const [activeChats, setActiveChats] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    
    const socketRef = useRef(null);
    const chatEndRef = useRef(null);

    // Initialize socket connection and load active threads
    useEffect(() => {
        const backendUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
        socketRef.current = io(backendUrl);

        const fetchActiveChats = async () => {
            try {
                const response = await axios.get("http://localhost:8000/api/chat/active");
                setActiveChats(response.data);
            } catch (error) {
                console.error("Error fetching active chats list:", error);
            }
        };
        fetchActiveChats();

        // Listen for new messages alerts to dynamically update active list order
        socketRef.current.on("new-message-alert", (msg) => {
            fetchActiveChats(); // Reload active list to show latest message preview
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    // Listen for incoming messages for selected user room
    useEffect(() => {
        if (!selectedUser || !socketRef.current) return;

        // Join selected user's support room
        socketRef.current.emit("join-room", { userId: selectedUser });

        // Load historical chat logs
        const fetchHistory = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/chat/history/${selectedUser}`);
                setMessages(response.data);
            } catch (error) {
                console.error("Error loading chat history:", error);
            }
        };
        fetchHistory();

        // Register room message listener
        socketRef.current.on("receive-message", (msg) => {
            if (msg.userId === selectedUser) {
                setMessages((prev) => [...prev, msg]);
            }
        });

        return () => {
            socketRef.current.off("receive-message");
        };
    }, [selectedUser]);

    // Scroll to bottom helper
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputText.trim() || !selectedUser || !socketRef.current) return;

        const messageData = {
            userId: selectedUser,
            sender: "admin",
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

    return (
        <Box sx={{ p: 3, height: "calc(100vh - 120px)" }}>
            <Paper elevation={3} sx={{ height: "100%", borderRadius: 3, overflow: "hidden" }}>
                <Grid container sx={{ height: "100%" }}>
                    
                    {/* Left Pane: Customer Queue */}
                    <Grid item xs={12} md={4} sx={{ borderRight: "1px solid rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", height: "100%" }}>
                        <Box sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                Live Support Inbox 💬
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Click on any customer to respond
                            </Typography>
                        </Box>
                        <Divider />
                        
                        <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
                            {activeChats.length === 0 ? (
                                <Typography variant="body2" color="textSecondary" sx={{ p: 3, textAlign: "center" }}>
                                    No active support chats found.
                                </Typography>
                            ) : (
                                <List disablePadding>
                                    {activeChats.map((chat) => (
                                        <ListItemButton 
                                            key={chat._id} 
                                            selected={selectedUser === chat._id}
                                            onClick={() => setSelectedUser(chat._id)}
                                            sx={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
                                        >
                                            <Avatar sx={{ mr: 2, bgcolor: "#2874f0" }}>
                                                <PersonIcon />
                                            </Avatar>
                                            <ListItemText 
                                                primary={chat._id} 
                                                secondary={chat.lastMessage}
                                                primaryTypographyProps={{ fontWeight: selectedUser === chat._id ? "bold" : "normal" }}
                                                secondaryTypographyProps={{ 
                                                    noWrap: true,
                                                    style: { fontWeight: chat.lastSender !== "admin" ? "bold" : "normal" }
                                                }}
                                            />
                                        </ListItemButton>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </Grid>

                    {/* Right Pane: Live Support Workspace */}
                    <Grid item xs={12} md={8} sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                        {selectedUser ? (
                            <>
                                {/* Workspace Header */}
                                <Box sx={{ p: 2, bgcolor: "#2874f0", color: "white", display: "flex", alignItems: "center" }}>
                                    <Avatar sx={{ mr: 2, bgcolor: "rgba(255,255,255,0.2)" }}>
                                        <SupportAgentIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                                            Chat with {selectedUser}
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                            Live Support Thread
                                        </Typography>
                                    </Box>
                                </Box>
                                <Divider />

                                {/* Chat Logs */}
                                <Box sx={{ flexGrow: 1, p: 3, overflowY: "auto", bgcolor: "#f9fbfd", display: "flex", flexDirection: "column", gap: 1.5 }}>
                                    {messages.map((msg, index) => {
                                        const isAdmin = msg.sender === "admin";
                                        return (
                                            <Box 
                                                key={index} 
                                                sx={{ 
                                                    alignSelf: isAdmin ? "flex-end" : "flex-start",
                                                    maxWidth: "70%",
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    bgcolor: isAdmin ? "#2874f0" : "white",
                                                    color: isAdmin ? "white" : "black",
                                                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                                    border: isAdmin ? "none" : "1px solid rgba(0,0,0,0.06)"
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

                                {/* Workspace Message Input Footer */}
                                <Box sx={{ p: 2, borderTop: "1px solid rgba(0,0,0,0.08)", bgcolor: "white" }}>
                                    <Stack direction="row" spacing={2}>
                                        <TextField
                                            fullWidth
                                            placeholder="Type your response to the customer..."
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: 4
                                                }
                                            }}
                                        />
                                        <IconButton 
                                            color="primary" 
                                            disabled={!inputText.trim()} 
                                            onClick={handleSendMessage}
                                            sx={{ 
                                                bgcolor: "#2874f0", 
                                                color: "white", 
                                                width: 50,
                                                height: 50,
                                                "&:hover": { bgcolor: "#1b5ec2" },
                                                "&.Mui-disabled": { bgcolor: "rgba(0,0,0,0.04)" }
                                            }}
                                        >
                                            <SendIcon />
                                        </IconButton>
                                    </Stack>
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1, bgcolor: "#f9f9f9" }}>
                                <Typography variant="body1" color="textSecondary">
                                    Select a customer from the inbox list to open chat workspace.
                                </Typography>
                            </Box>
                        )}
                    </Grid>

                </Grid>
            </Paper>
        </Box>
    );
};

export default AdminChatPanel;
