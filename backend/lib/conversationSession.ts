import crypto from 'crypto';

interface SessionContext {
  [key: string]: any;
}

interface SessionData {
  context: SessionContext;
  lastActivity: number;
}

const sessions = new Map<string, SessionData>();
const SESSION_EXPIRY_MS = 5 * 60 * 1000;

export function generateSessionId(): string {
  return crypto.randomUUID();
}

export function getSession(sessionId?: string): SessionContext | null {
  if (!sessionId) return null;
  
  const session = sessions.get(sessionId);
  if (!session) return null;
  
  if (Date.now() - session.lastActivity > SESSION_EXPIRY_MS) {
    sessions.delete(sessionId);
    return null;
  }
  
  return session.context;
}

export function updateSession(sessionId: string | undefined, context: SessionContext): void {
  if (!sessionId) return;
  
  sessions.set(sessionId, {
    context: { ...context },
    lastActivity: Date.now()
  });
}

export function clearSession(sessionId?: string): void {
  if (sessionId) {
    sessions.delete(sessionId);
  }
}

export function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_EXPIRY_MS) {
      sessions.delete(sessionId);
    }
  }
}

setInterval(cleanupExpiredSessions, 60 * 1000);
