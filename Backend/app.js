// app.js
const express = require("express");
const app = express();

// Rate limiter (in-memory)
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;
const clientMap = new Map();
app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  let entry = clientMap.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    entry = { count: 1, start: now };
    clientMap.set(ip, entry);
  } else {
    entry.count++;
  }
  if (entry.count > MAX_REQUESTS) {
    return res.status(429).json({ error: "Too many requests" });
  }
  next();
});

app.use(express.json());
app.use("/configure-mock", require("./routes/mockConfig"));
app.use(require("./middleware/mockDispatcher"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "No mock configured for this request" });
});
// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// Only start server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}

module.exports = app;
