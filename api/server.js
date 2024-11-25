const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const cors = require("cors");
const OpenAI = require("openai");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

require("dotenv").config();

const app = express();
const server = http.createServer(app);

let endpoint = process.env.ENDPOINT;

const io = socketIo(server, {
  cors: {
    origin: endpoint,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.MY_KEY,
  baseURL: " https://api.pawan.krd/cosmosrp/v1",
});

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

app.post("/api/chatbot", async (req, res) => {
  const { message, history } = req.body;
  console.log("gpt: " + message);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        ...history,
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

//Mongo

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// User schema and model
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

//create user
app.post("/api/users/create", async (req, res) => {
  const { id, username, password } = req.body;

  if (!id || !username || !password) {
    return res
      .status(400)
      .json({ error: "ID, Name, and Password are required" });
  }

  try {
    const existingUser = await User.findOne({ id });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this ID already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ id, username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error creating user: " + error.message });
    console.log(error);
  }
});

// API to validate a user
app.post("/api/users/validate", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and Password are required" });
  }

  try {
    // Find the user by username (not id)
    const user = await User.findOne({ username });

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        return res.status(200).json({ message: "User validated", user });
      } else {
        return res.status(401).json({ error: "Invalid password" });
      }
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error validating user: " + error.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${endpoint}:${PORT}`));
