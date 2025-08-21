import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { Pool } from "pg";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.post("/conversation", async (req, res) => {
  try {
    const result = await pool.query(
      "INSERT INTO conversations DEFAULT VALUES RETURNING id, created_at"
    );
    res.json({ conversation: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Conversation creation failed" });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    if (!conversationId || !message)
      return res.status(400).json({ error: "conversationId ve message gerekli" });

    await pool.query(
      "INSERT INTO messages (conversation_id, role, content) VALUES ($1, 'user', $2)",
      [conversationId, message]
    );

    const ficRes = await pool.query("SELECT id, title, author, tags, summary, description, url, cover_url, created_at FROM fics;");
    const ficList = ficRes.rows;

    const systemPrompt = `
    Sen bir fiction öneri asistanısın.
    Sadece aşağıdaki listeden öneriler yapabilirsin.
    Liste: ${JSON.stringify(ficList)}
    Konuşma boyunca kullanıcının ne istediğini hatırla.
    Her öneriyi şu formatta ver:
      (id: <fic_id>)
      **Başlık:** ...
      **Yazar:** ...
      **Özet:** ...
      **URL:** ...
    `;

    const msgRes = await pool.query(
      "SELECT role, content FROM messages WHERE conversation_id=$1 ORDER BY created_at DESC LIMIT 25",
      [conversationId]
    );
    const recentMessages = msgRes.rows.reverse(); 

    const inputText = [
      systemPrompt,
      ...recentMessages.map(msg => `${msg.role}: ${msg.content}`),
      `user: ${message}`
    ].join("\n").toString();


    const model = genAI.getGenerativeModel({ model: "gemma-3n-e4b-it" });
    const result = await model.generateContent(inputText);

    const aiReply = result.response.text() || "AI cevap üretemedi.";

    await pool.query(
      "INSERT INTO messages (conversation_id, role, content) VALUES ($1, 'assistant', $2)",
      [conversationId, aiReply]
    );

    res.json({ reply: aiReply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI request failed" });
  }
});

app.get("/fics", async (req, res) => {
  try {
    const { tags } = req.query; 
    let query = "SELECT * FROM fics WHERE is_completed = $1";
    let params = [true];

    if (tags) {
      const tagArray = tags.split(",");
      query += " AND tags && $1::text[]"; 
      params = [true, tagArray];
    }

    const result = await pool.query(query, params);
    res.json({ fics: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fic fetch failed" });
  }
});

app.get("/fics/list", async (req, res) => {
  const ids = req.query.ids ? req.query.ids.split(",") : [];
  if (ids.length === 0) return res.json([]);
  const result = await pool.query(
    "SELECT id, title, author, summary, url FROM fics WHERE id = ANY($1::int[])",
    [ids]
  );
  res.json(result.rows);
});


app.post("/fics/create", async (req, res) => {
  try {
    const {
      title,
      author,
      tags,
      summary,
      description,
      url,
      cover_url,
      is_completed,
    } = req.body;

    const insertQuery = `
      INSERT INTO fics 
        (title, author, tags, summary, description, url, cover_url, is_completed)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *;
    `;

    const values = [
      title,
      author,
      tags || null,         
      summary,
      description,
      url,
      cover_url || null,
      is_completed || false,
    ];

    const result = await pool.query(insertQuery, values);
    res.json({ success: true, fic: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, error: "Bu başlık ve yazar adıyla bir fiction zaten mevcut." });
    }
    console.error(err);
    res.status(500).json({ success: false, error: "Fic creation failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
