import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://mrtomatosam.github.io').split(',').map(value => value.trim()).filter(Boolean);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'stx-security-server' });
});

app.get('/api/authorize-admin', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const isAdmin = user.user_metadata?.role === 'admin';

  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.json({ ok: true, user: { id: user.id, email: user.email, role: user.user_metadata?.role } });
});

app.use((error, _req, res, _next) => {
  if (error && error.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  return res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`STX security server running on http://localhost:${port}`);
});
