const express = require('express');
const { Pool } = require('pg'); // mysql2 በ pg ተቀይሯል
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ሰርቨሩ እንዲያነባቸው ፋይሎችን ማገናኘት[cite: 1]
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// PostgreSQL Connection Setup[cite: 1]
const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "postgres", // pgAdmin ተጠቃሚ ስም
    password: process.env.DB_PASSWORD || "1221", // አንተ ያስገባኸው ፓስወርድ
    database: process.env.DB_NAME || "portfolio_db", // pgAdmin ላይ የፈጠርከው ስም
    port: process.env.DB_PORT || 5432,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// Table በራሱ እንዲፈጠር የሚያደርግ ኮድ (PostgreSQL Syntax)[cite: 1]
const createTableQuery = `
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY, -- PostgreSQL ላይ SERIAL ነው የሚሆነው
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

pool.query(createTableQuery, (err) => {
    if (err) {
        console.error("❌ Table መፍጠር አልተቻለም:", err);
    } else {
        console.log("✅ የ 'messages' ሰንጠረዥ በራሱ ተፈጥሯል/ዝግጁ ነው!");
    }
});

// Handle contact form submissions[cite: 1]
app.post('/api/contact', async (req, res) => {
    console.log("API HIT: Received data:", req.body);
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // MySQL ላይ ከነበረው '?' ይልቅ Postgres '$1, $2...' ይጠቀማል[cite: 1]
        const sqlInsert = "INSERT INTO messages (name, email, message) VALUES ($1, $2, $3)";
        await pool.query(sqlInsert, [name, email, message]);
        
        console.log("✅ SUCCESS: Message stored in PostgreSQL!");
        res.status(200).json({ message: "Message sent successfully!" });
    } catch (err) {
        console.error("❌ POSTGRES DATABASE ERROR:", err.message);
        res.status(500).json({ error: "Failed to save message" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));