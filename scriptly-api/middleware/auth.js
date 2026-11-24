import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Global anon client used for initial token verification
// Providing 'ws' for the realtime transport ensures cross-version compatibility on Node.js
const baseSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

/**
 * Authentication Middleware:
 * Verifies Supabase JWT token and attaches user information + authenticated Supabase client to req.
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    // 1. Verify token with Supabase Auth
    const { data: { user }, error } = await baseSupabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    // 2. Attach user to request
    req.user = user;
    req.token = token;

    // 3. Create a Supabase client that forwards the user's token so Row Level Security (RLS) applies
    req.userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      realtime: { transport: ws },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }
}
