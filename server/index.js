import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "./models/User.js";
import Comment from "./models/Comment.js";
import VideoStat from "./models/VideoStat.js";

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: false }));
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// Connect to MongoDB
mongoose
  .connect('mongodb://localhost:27017/youtubeBackend')
  .then(() => console.log('MongoDB connection successful!'))
  .catch(err => {
    console.log('MongoDB connection error:', err);
  });

// Add demo users for testing
async function addDemoUsers() {
  try {
    const demoUsers = [
      { username: "admin", email: "admin@demo.com", password: "admin123" },
      { username: "chillvibes", email: "chill@demo.com", password: "chill123" },
      { username: "sportscentral", email: "sports@demo.com", password: "sports123" },
      { username: "progamer", email: "gamer@demo.com", password: "gamer123" },
      { username: "techbrief", email: "tech@demo.com", password: "tech123" }
    ];

    for (const userData of demoUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const hash = await bcrypt.hash(userData.password, 10);
        const user = new User({
          username: userData.username,
          email: userData.email,
          password: hash
        });
        await user.save();
        console.log(`Demo user added: ${userData.email}`);
      }
    }
    console.log("Demo users initialization completed");
  } catch (error) {
    console.error("Error adding demo users:", error);
  }
}

// Initialize demo users after MongoDB connection
mongoose.connection.once('open', () => {
  addDemoUsers();
});

// Helpers
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}
function auth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const [, token] = hdr.split(" ");
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) return res.status(400).json({ message: "All fields required" });
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: "Email or username already registered" });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hash });
    await user.save();
    
    const token = signToken({ sub: email, username });
    res.json({ token, username, email });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    
    const token = signToken({ sub: email, username: user.username });
    res.json({ token, username: user.username, email });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Example protected endpoint
app.get("/api/me", auth, async (req, res) => {
  try {
    const email = req.user.sub;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ username: user.username, email });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Video stats endpoints
app.get("/api/videos/:id/stats", async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await VideoStat.findOne({ videoId: id });
    res.json({ likes: stats?.likes || 0, dislikes: stats?.dislikes || 0 });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/videos/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await VideoStat.findOneAndUpdate(
      { videoId: id },
      { $inc: { likes: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ likes: stats.likes, dislikes: stats.dislikes });
  } catch (error) {
    console.error("Like error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/videos/:id/dislike", async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await VideoStat.findOneAndUpdate(
      { videoId: id },
      { $inc: { dislikes: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ likes: stats.likes, dislikes: stats.dislikes });
  } catch (error) {
    console.error("Dislike error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Comments CRUD
app.get("/api/videos/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const list = await Comment.find({ videoId: id }).sort({ createdAt: -1 }).lean();
    const mapped = list.map((c) => ({
      id: c._id.toString(),
      videoId: c.videoId,
      author: c.author,
      text: c.text,
      createdAt: c.createdAt
    }));
    res.json(mapped);
  } catch (error) {
    console.error("List comments error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/videos/:id/comments", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ message: "Text required" });
    const email = req.user.sub;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const comment = await Comment.create({
      videoId: id,
      author: user.username,
      email,
      text: text.trim()
    });

    res.status(201).json({
      id: comment._id.toString(),
      videoId: comment.videoId,
      author: comment.author,
      text: comment.text,
      createdAt: comment.createdAt
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/videos/:id/comments/:cid", auth, async (req, res) => {
  try {
    const { id, cid } = req.params;
    const { text } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ message: "Text required" });
    const email = req.user.sub;

    const comment = await Comment.findOne({ _id: cid, videoId: id });
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.email !== email) return res.status(403).json({ message: "Not allowed" });

    comment.text = text.trim();
    await comment.save();

    res.json({
      id: comment._id.toString(),
      videoId: comment.videoId,
      author: comment.author,
      text: comment.text,
      createdAt: comment.createdAt
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/videos/:id/comments/:cid", auth, async (req, res) => {
  try {
    const { id, cid } = req.params;
    const email = req.user.sub;

    const comment = await Comment.findOne({ _id: cid, videoId: id });
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.email !== email) return res.status(403).json({ message: "Not allowed" });

    await comment.deleteOne();
    res.status(204).send();
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user's channel info
app.get("/api/channels", auth, async (req, res) => {
  try {
    const email = req.user.sub;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      channel: {
        name: user.channelName || user.username,
        description: user.channelDescription || "",
        owner: user.username,
        hasChannel: !!user.channelName
      }
    });
  } catch (error) {
    console.error("Get channel error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Channel creation endpoint
app.post("/api/channels", auth, async (req, res) => {
  try {
    console.log("Channel creation request received");
    console.log("Request body:", req.body);
    console.log("User from token:", req.user);
    
    const { name, description } = req.body;
    const email = req.user.sub;
    
    if (!name || !name.trim()) {
      console.log("Channel name validation failed");
      return res.status(400).json({ message: "Channel name is required" });
    }
    
    // Check if user already has a channel
    const user = await User.findOne({ email });
    console.log("Found user:", user ? user.username : "Not found");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update user with channel information
    user.channelName = name.trim();
    user.channelDescription = description || "";
    await user.save();
    
    console.log("Channel created successfully for user:", user.username);
    
    res.json({ 
      message: "Channel created successfully",
      channel: {
        name: user.channelName,
        description: user.channelDescription,
        owner: user.username
      }
    });
  } catch (error) {
    console.error("Channel creation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
