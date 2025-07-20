const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ensure broadcasts directory exists
const broadcastsDir = path.join(__dirname, 'broadcasts');
if (!fs.existsSync(broadcastsDir)) {
  fs.mkdirSync(broadcastsDir);
}

// Handle POST request to save broadcast data
app.post('/api/broadcast', (req, res) => {
  try {
    const data = req.body;
    // Read existing files to determine next number
    const files = fs.readdirSync(broadcastsDir);
    const numbers = files
      .filter(file => file.startsWith('load') && file.endsWith('.json'))
      .map(file => parseInt(file.replace('load', '').replace('.json', ''), 10))
      .filter(num => !isNaN(num));
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNumber = maxNumber + 1;
    const fileName = `load${nextNumber}.json`;
    const filePath = path.join(broadcastsDir, fileName);

    // Save data to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.json({ success: true, fileName });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({ success: false, error: 'Failed to save broadcast' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
