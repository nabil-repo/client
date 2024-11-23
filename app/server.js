const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const cors = require("cors");
const authRoutes = require("../app/routes/auth");
const OpenAI = require("openai");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey:
    "pk-wJYNiXMGSFZNVIUTgmQzpYvnGmrLHmrrZFoDpJMMUzudfSWz",
    baseURL:' https://api.pawan.krd/cosmosrp/v1'
});

// MongoDB connection
// mongoose.connect("mongodb+srv://nabilaaaman:nabilaman@cluster0.wydqa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {

// })
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.error('MongoDB connection error:', err));

// Socket.IO for real-time communication
// io.on("connection", (socket) => {
//   const id = socket.handshake.query.id;
//   socket.join(id);

//   socket.on("send-msg", ({ recipients, text }) => {
//     recipients.forEach((recipient) => {
//       const newRecipents = recipients.filter((r) => r !== recipient);
//       newRecipents.push(id);
//       socket.broadcast.to(recipient).emit("recive-message", {
//         recipients: newRecipents,
//         sender: id,
//         text,
//       });
//       console.log(recipient+": "+text)
//     });
//   });
// });

io.on("connection", (socket) => {
  const id = socket.handshake.query.id;
  socket.join(id);

  socket.on("send-msg", ({ recipients, text }) => {
    recipients.forEach((recipient) => {
      // Avoid sending the message back to the sender
      if (recipient !== id) {
        const newRecipients = recipients.filter((r) => r !== recipient);
        newRecipients.push(id); // Add sender to the list of recipients
        socket.broadcast.to(recipient).emit("recive-message", {
          recipients: newRecipients,
          sender: id,
          text,
        });
        console.log(`${id} sent a message to ${recipient}: ${text}`);
      }
    });
  });
});

// Auth routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

app.post("/api/chatbot", async (req, res) => {
  const { message, history } = req.body; // History can help maintain conversation context
  console.log("gpt: "+message)
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use "gpt-4" if available
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        ...history, // Include previous messages in the conversation
        { role: "user", content: message },
      ],
    });

    const reply = response.choices[0].message.content;  
    res.json({ response: reply });
  } catch (error) {
    console.error("Error communicating with ChatGPT:", error);
    res.status(500).json({ error: "Failed to fetch ChatGPT response" });
  }
});
