const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const publicDir = path.join(__dirname, 'public');

app.use(express.json());
app.use(express.static(publicDir));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'study-planner' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Study Planner is running at http://localhost:${PORT}`);
  });
}

module.exports = app;
