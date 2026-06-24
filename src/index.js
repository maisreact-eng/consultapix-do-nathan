const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');

const apiRoutes = require('./routes/api');
const configRoutes = require('./routes/config');

const app = express();
const PORT = 3333;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', apiRoutes);
app.use('/api', configRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n  PIXCheck rodando em ${url}\n`);
  const cmd = process.platform === 'win32' ? `start ${url}` : process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`;
  exec(cmd);
});
