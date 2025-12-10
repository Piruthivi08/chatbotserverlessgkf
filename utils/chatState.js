// Simple in-memory session store for chatbot
// This WILL reset when the Netlify function "cold starts"
// but works correctly during active usage.

const sessions = {}; // { sessionId: { intent, step, data } }

function getSession(sessionId) {
  return sessions[sessionId] || null;
}

function saveSession(sessionId, sessionData) {
  sessions[sessionId] = sessionData;
}

function clearSession(sessionId) {
  delete sessions[sessionId];
}

module.exports = { getSession, saveSession, clearSession };
