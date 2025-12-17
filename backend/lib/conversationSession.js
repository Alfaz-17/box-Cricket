import crypto from 'crypto';

// In-memory session store
const sessions = new Map();

// Session expiry time (5 minutes)
const SESSION_EXPIRY_MS = 5 * 60 * 1000;

/**
 * Generate a unique session ID
 */
export function generateSessionId() {
  return crypto.randomUUID();
}

/**
 * Create or retrieve a session
 */
export function getSession(sessionId) {
  if (!sessionId) return null;
  
  const session = sessions.get(sessionId);
  
  if (!session) return null;
  
  // Check if session has expired
  if (Date.now() - session.lastActivity > SESSION_EXPIRY_MS) {
    sessions.delete(sessionId);
    return null;
  }
  
  return session.context;
}

/**
 * Update session context
 */
export function updateSession(sessionId, context) {
  if (!sessionId) return;
  
  sessions.set(sessionId, {
    context: { ...context },
    lastActivity: Date.now()
  });
}

/**
 * Clear a specific session
 */
export function clearSession(sessionId) {
  if (sessionId) {
    sessions.delete(sessionId);
  }
}

/**
 * Clean up expired sessions (run periodically)
 */
export function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_EXPIRY_MS) {
      sessions.delete(sessionId);
    }
  }
}

// Run cleanup every minute
setInterval(cleanupExpiredSessions, 60 * 1000);
