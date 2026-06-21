import Product from "../model/product-schema.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const chatWithAI = async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ message: "Invalid chat history" });
        }

        // Fetch products to give AI context on the inventory
        const products = await Product.find();
        const productContext = products.map(p => 
            `- ${p.title.longTitle} (ID: ${p.id}): Price is ₹${p.price.cost} (MRP ₹${p.price.mrp}). Stock left: ${p.quantity}. Description: ${p.description || "N/A"}`
        ).join("\n");

        const systemInstruction = `You are a helpful and polite AI Shopping Assistant for the Flipkart Clone store. 
A user is chatting with you. Your goal is to guide them and recommend products from our inventory.
Here is our current inventory:
${productContext}

Guidelines:
1. ONLY recommend products that exist in our inventory above.
2. If a product is out of stock (Stock left is 0), warn the user and recommend an alternative.
3. Keep your answers concise, engaging, and professional.
4. Try to output clean markdown (e.g., bullet points for comparisons).
5. Always quote the prices in INR (₹).`;

        const userMessage = messages[messages.length - 1]?.content || "";

        // Check for Gemini API key
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
            console.log("Gemini API key not configured or set to placeholder. Falling back to local rules engine.");
            return res.status(200).json({ reply: getMockAIResponse(userMessage, products) });
        }

        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            // Use gemini-1.5-flash as it is widely available and fast
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                systemInstruction: systemInstruction
            });

            // Map frontend message format to Gemini chat history format
            // Frontend: [{ role: 'user'/'bot', content: '...' }]
            // Gemini expects: role: 'user' or 'model'
            let history = messages.slice(0, -1).map(msg => ({
                role: msg.role === 'bot' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            // Gemini requires the first message in the chat history to be from 'user'
            const firstUserIdx = history.findIndex(msg => msg.role === 'user');
            if (firstUserIdx !== -1) {
                history = history.slice(firstUserIdx);
            } else {
                history = [];
            }

            const chat = model.startChat({
                history: history
            });

            const result = await chat.sendMessage(userMessage);
            const responseText = result.response.text();

            return res.status(200).json({ reply: responseText });
        } catch (apiError) {
            console.error("Gemini API direct call failed, activating smart mockup mode:", apiError);
            return res.status(200).json({ reply: getMockAIResponse(userMessage, products) });
        }

    } catch (error) {
        console.error("Error in AI Chat controller:", error);
        return res.status(500).json({ message: error.message });
    }
};

// Fallback Mock AI Engine
function getMockAIResponse(message, products) {
    const text = message.toLowerCase();

    // 1. Help / Greeting
    if (text.includes("hello") || text.includes("hi") || text.includes("hey") || text.includes("help")) {
        return `Hello! I am your AI Shopping Assistant. I can help you choose the best products from our catalog. 

Currently, we have:
- 📱 Smartwatches
- 🔌 Kettle & sandwich makers
- 🏋️ Resistance bands & fitness gear
- ✂️ Trimmers & hair dryers
- 🌀 Portable fans

What are you looking for today?`;
    }

    // 2. Trimmers / Hair dryer
    if (text.includes("trimmer") || text.includes("dryer") || text.includes("grooming") || text.includes("hair")) {
        const item = products.find(p => p.id === 'product5');
        if (item) {
            return `I highly recommend our **${item.title.longTitle}**!
- **Price**: ₹${item.price.cost} (MRP ₹${item.price.mrp}) - ${item.price.discount} Off!
- **Stock Status**: ${item.quantity > 0 ? `In Stock (Only ${item.quantity} left!)` : "Out of Stock"}
- **Description**: Professional hair dryer to help you groom quickly.
            
Would you like me to guide you on how to add this to your cart?`;
        }
    }

    // 3. Kettle
    if (text.includes("kettle") || text.includes("tea") || text.includes("kitchen") || text.includes("water")) {
        const item = products.find(p => p.id === 'product1');
        if (item) {
            return `We have the **${item.title.longTitle}** in our catalog:
- **Price**: ₹${item.price.cost} (MRP ₹${item.price.mrp})
- **Stock status**: ${item.quantity > 0 ? "In Stock" : "Out of Stock"}
- **Best For**: Travel, quick boiling, and hostels.
            
You can find it by clicking on the Home page grid!`;
        }
    }

    // 4. Watch
    if (text.includes("watch") || text.includes("smartwatch") || text.includes("time") || text.includes("fitness watch")) {
        const item = products.find(p => p.id === 'product4');
        if (item) {
            return `Check out our best seller smartwatch: **${item.title.longTitle}**!
- **Price**: ₹${item.price.cost} (MRP: ₹${item.price.mrp})
- **Features**: Android/iOS compatible, premium build quality, health tracking.
- **Stock left**: ${item.quantity} pieces in inventory.

It has a discount of **${item.price.discount}** today!`;
        }
    }

    // 5. Out of stock test
    if (text.includes("resistance") || text.includes("fitness") || text.includes("band") || text.includes("product3")) {
        const item = products.find(p => p.id === 'product3');
        if (item) {
            return `We have the **${item.title.longTitle}** (Price: ₹${item.price.cost}), but unfortunately, it is currently **OUT OF STOCK** 🔴. 
            
As an alternative, would you be interested in our **Molife Sense Smart Watch** for tracking your fitness instead?`;
        }
    }

    // 6. Generic product query
    if (text.includes("recommend") || text.includes("suggest") || text.includes("best") || text.includes("buy")) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        return `Here is a popular product recommendation for you: **${randomProduct.title.longTitle}**!
- **Price**: ₹${randomProduct.price?.cost} (Discount: ${randomProduct.price?.discount})
- **Stock left**: ${randomProduct.quantity} units.

Would you like to know more about this product?`;
    }

    // Default response
    return `I'm not sure if we have that exact item, but here are some of our top categories:
- **Smart Watches**: Molife Sense 500
- **Kitchen Appliances**: Pigeon Electric Kettle, SmartBuy Sandwich Maker
- **Personal Care**: Nova Hair Dryer
- **Fitness Accessories**: AJRO Resistance Tube

Type any of the above categories to learn more! (Note: Gemini API is running in offline/mock mode. Set GEMINI_API_KEY in your server's .env file to enable live reasoning!)`;
}

// Translate Review Controller (Using Gemini to translate customer feedback dynamically)
export const translateReview = async (req, res) => {
    try {
        const { text, targetLang = "English" } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Text is required for translation" });
        }

        // Check for Gemini API key configuration
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
            console.log("Gemini API key not configured. Falling back to local mock translator.");
            return res.status(200).json({ translatedText: getMockTranslation(text, targetLang) });
        }

        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                systemInstruction: `You are an expert translator. Translate the following user shopping review into ${targetLang}. Return ONLY the translated text. Do not add any extra explanations, greetings or conversational filler text.`
            });

            const result = await model.generateContent(text);
            const responseText = result.response.text().trim();

            return res.status(200).json({ translatedText: responseText });
        } catch (apiError) {
            console.error("Gemini API call failed during translation, activating mockup mode:", apiError);
            return res.status(200).json({ translatedText: getMockTranslation(text, targetLang) });
        }

    } catch (error) {
        console.error("Error in Translate controller:", error);
        return res.status(500).json({ message: error.message });
    }
};

// Fallback Mock Translation Engine for common phrases
function getMockTranslation(text, targetLang) {
    const lowerText = text.toLowerCase().trim();
    
    if (lowerText.includes("bohot hi acha") || lowerText.includes("bahut accha") || lowerText.includes("bohot accha")) {
        return "Very good product. Highly recommended! (Demo Mode)";
    }
    if (lowerText.includes("charging fast") || lowerText.includes("fast charging")) {
        return "Charging is very fast and the battery backup is good. (Demo Mode)";
    }
    if (lowerText.includes("kharab") || lowerText.includes("bekar") || lowerText.includes("mubaq")) {
        return "Worst product, completely useless. Do not buy it. (Demo Mode)";
    }
    if (lowerText.includes("paisawasool") || lowerText.includes("paisa vasool")) {
        return "Complete value for money! (Demo Mode)";
    }
    if (lowerText.includes("delivery fast")) {
        return "Super-fast delivery, got it within a day. (Demo Mode)";
    }

    return `[Mock Translation to ${targetLang}]: ${text} (Configure GEMINI_API_KEY in backend .env to enable live translation!)`;
}
