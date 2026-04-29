const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

 const app = express();
app.use(cors());
app.use(express.json());


// Serve static files (HTML, CSS, JS, images)
const path = require('path');
app.use(express.static(path.join(__dirname)));

// Optional: Custom homepage route to serve index.html

// Custom homepage route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Welcome API endpoint for backend
app.get('/welcome', (req, res) => {
    res.send('Welcome to the backend!');
});

// Welcome API endpoint for portfolio display
app.get('/api/welcome', (req, res) => {
    res.json({ message: "Welcome to my portfolio backend!" });});




// Route to handle contact form submissions
app.post('/api/contact', (req, res) => {
    // This MUST show up in your terminal if the button is clicked
    console.log("--------------------------------");
    console.log("API HIT: Received data:", req.body);

    const { name, email, message } = req.body;

    // Check if any field is missing
    if (!name || !email || !message) {
        console.log("❌ Error: Missing fields in request body");
        return res.status(400).json({ error: "All fields are required" });
    }

    const sqlInsert = "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)";
    
    db.query(sqlInsert, [name, email, message], (err, result) => {
        if (err) {
            // This will tell us the EXACT MySQL problem (e.g., wrong table name)
            console.error("❌ MYSQL DATABASE ERROR:", err.sqlMessage || err);
            return res.status(500).json({ error: "Failed to save message" });
        }
        console.log("✅ SUCCESS: Message stored in MySQL!");
        res.status(200).json({ message: "Message sent successfully!" });
    });
});
// MySQL Connection
const db = mysql.createConnection({
    // Render ላይ Environment Variables ውስጥ የምታስገባቸው ስሞች ናቸው
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "portfolio-db",
    port: process.env.DB_PORT || 3306
});

// Table በራሱ እንዲፈጠር የሚያደርግ ኮድ
const createTableQuery = `
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

db.query(createTableQuery, (err) => {
    if (err) {
        console.error("Table መፍጠር አልተቻለም:", err);
    } else {
        console.log("የ 'messages' ሰንጠረዥ በራሱ ተፈጥሯል/ዝግጁ ነው!");
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// app.listen(5000, () => console.log("Backend server running on port 5000")); //this is using on local only
