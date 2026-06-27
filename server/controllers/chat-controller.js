import Message from "../model/message-schema.js";

// Fetch chat history for a specific user room
export const getChatHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "UserId is required" });
        }

        const messages = await Message.find({ userId }).sort({ timestamp: 1 });
        return res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getChatHistory controller:", error);
        return res.status(500).json({ message: error.message });
    }
};

// Fetch list of all active chats with their latest message info for Admin support list
export const getActiveChats = async (req, res) => {
    try {
        const activeChats = await Message.aggregate([
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: "$userId",
                    lastMessage: { $first: "$text" },
                    lastSender: { $first: "$sender" },
                    timestamp: { $first: "$timestamp" }
                }
            },
            { $sort: { timestamp: -1 } }
        ]);

        return res.status(200).json(activeChats);
    } catch (error) {
        console.error("Error in getActiveChats controller:", error);
        return res.status(500).json({ message: error.message });
    }
};
