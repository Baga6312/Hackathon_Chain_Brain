import express from "express";
import cors from "cors";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: process.env.PG_DB,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// ── Auth ──────────────────────────────────────────
app.post("/api/register", async (req, res) => {
  const { email, password, display_name } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name`,
      [email, hash, display_name]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email, display_name: user.display_name } });
});

// ── Batch Logs ────────────────────────────────────
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

app.post("/api/batch-logs", authMiddleware, async (req: any, res) => {
  const batches = req.body;
  try {
    for (const b of batches) {
      await pool.query(
        `INSERT INTO batch_logs (
          batch_id, user_id, algae_type, algae_name, origin, quality_score,
          success_rate, defect_rate, biomass_kg, protein, lipid, carbohydrate,
          toxicity, contamination, co2_absorbed, o2_produced, nitrate, salinity,
          water_temp, pollution_index, block_hash, blockchain_status,
          block_number, lab_signature, batch_timestamp
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25
        )`,
        [
          b.id, req.user.id, b.algaeType, b.algaeName, b.origin, b.qualityScore,
          b.successRate, b.defectRate, b.biomassKg, b.protein, b.lipid, b.carbohydrate,
          b.toxicity, b.contamination, b.co2Absorbed, b.o2Produced, b.nitrate, b.salinity,
          b.waterTemp, b.pollutionIndex, b.blockHash, b.blockchainStatus,
          b.blockNumber, b.labSignature, b.timestamp,
        ]
      );
    }
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3001, () => console.log("API running on http://localhost:3001"));