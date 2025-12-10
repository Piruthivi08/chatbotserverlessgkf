// netlify/functions/chatbot.js
const connectDB = require("./utils/db");
const response = require("./utils/response");
const fetch = global.fetch || require("node-fetch"); // Netlify Node 18 has global fetch; fallback for local older envs
const { getSession, saveSession, clearSession } = require("../../utils/chatState");

// Base URL for internal API calls. Netlify sets process.env.URL in the deployed environment.
const API_BASE = process.env.API_URL || process.env.URL || "http://localhost:8888";

exports.handler = async (event) => {
  try {
    await connectDB();

    if (event.httpMethod !== "POST") {
      return response(405, { message: "Method Not Allowed" });
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const { message, sessionId } = body;

    if (!message || !sessionId) {
      return response(400, { message: "message and sessionId required" });
    }

    // Load or initialize session
    let session = getSession(sessionId) || { intent: null, step: 0, data: {} };

    const text = String(message).toLowerCase().trim();
    let botResponse = "";

    // Helper to call internal APIs (POST)
    async function apiPost(path, data) {
      const url = `${API_BASE}${path}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // try to parse json; return object or throw
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        // include any message returned by the internal API
        throw new Error(json?.message || `API POST ${path} failed with status ${res.status}`);
      }
      return json;
    }

    // -----------------------
    // Appointment flow
    // -----------------------
    async function handlePatientFlow(text) {
      switch (session.step) {
        case 1:
          session.data.name = text;
          session.step = 2;
          return "Great! What is your age?";
        case 2:
          session.data.age = Number(text);
          session.step = 3;
          return "What is your gender? (male / female / other)";
        case 3:
          session.data.gender = text;
          session.step = 4;
          return "Please enter your phone number.";
        case 4:
          session.data.phone = text;
          session.step = 5;
          return "Please enter your email (or type 'skip').";
        case 5:
          if (text !== "skip") session.data.email = text;
          session.step = 6;
          return "Please describe the reason for your appointment.";
        case 6:
          session.data.message = text;
          session.step = 7;
          return `
Here is your appointment summary:

• Name: ${session.data.name}
• Age: ${session.data.age}
• Gender: ${session.data.gender}
• Phone: ${session.data.phone}
• Email: ${session.data.email ?? "Not provided"}
• Reason: ${session.data.message}

Type **confirm** to book or **cancel** to restart.
          `;
        case 7:
          if (text === "confirm") {
            const result = await apiPost("/api/appointments", session.data);
            clearSession(sessionId);
            return `✅ Appointment booked!\nID: ${result?.appointment?._id || result?.appointmentId || "N/A"}`;
          }
          if (text === "cancel") {
            clearSession(sessionId);
            return "Appointment cancelled.";
          }
          return "Please type **confirm** or **cancel**.";
        default:
          session.step = 1;
          return "What is your full name?";
      }
    }

    // -----------------------
    // Internship / Volunteering flow
    // -----------------------
    async function handleProgramFlow(text) {
      switch (session.step) {
        case 1:
          if (!["internship", "volunteering"].includes(text)) {
            return "Please type **internship** or **volunteering**.";
          }
          session.data.programType = text;
          session.step = 2;
          return "Your name?";
        case 2:
          session.data.name = text;
          session.step = 3;
          return "Your age?";
        case 3:
          session.data.age = Number(text);
          session.step = 4;
          return "Your phone number?";
        case 4:
          session.data.phone = text;
          session.step = 5;
          return `
Summary:
• Name: ${session.data.name}
• Age: ${session.data.age}
• Phone: ${session.data.phone}
• Applying For: ${session.data.programType}
Type **confirm** or **cancel**.
          `;
        case 5:
          if (text === "confirm") {
            const result = await apiPost("/api/internship", session.data);
            clearSession(sessionId);
            return `✅ Application submitted!\nID: ${result?.application?._id || "N/A"}`;
          }
          if (text === "cancel") {
            clearSession(sessionId);
            return "Cancelled.";
          }
          return "Please type confirm or cancel.";
        default:
          session.step = 1;
          return "Are you applying for internship or volunteering?";
      }
    }

    // -----------------------
    // Adoption flow
    // -----------------------
    async function handleAdoptionFlow(text) {
      switch (session.step) {
        case 1:
          session.data.name = text;
          session.step = 2;
          return "Your phone number?";
        case 2:
          session.data.phone = text;
          session.step = 3;
          return "Your email?";
        case 3:
          session.data.email = text;
          session.step = 4;
          return "Your address? (or type skip)";
        case 4:
          if (text !== "skip") session.data.address = text;
          session.step = 5;
          return "Any message or reason? (or skip)";
        case 5:
          if (text !== "skip") session.data.message = text;
          session.step = 6;
          return `
Summary:
• Name: ${session.data.name}
• Phone: ${session.data.phone}
• Email: ${session.data.email}
• Address: ${session.data.address ?? "Not provided"}
• Message: ${session.data.message ?? "Not provided"}

Type **confirm** or **cancel**.
          `;
        case 6:
          if (text === "confirm") {
            const result = await apiPost("/api/adoption", session.data);
            clearSession(sessionId);
            return `✅ Enquiry submitted!\nID: ${result?.enquiry?._id || "N/A"}`;
          }
          if (text === "cancel") {
            clearSession(sessionId);
            return "Cancelled.";
          }
          return "Please type confirm or cancel.";
        default:
          session.step = 1;
          return "Your full name?";
      }
    }

    // -----------------------
    // MedRep flow
    // -----------------------
    async function handleMedRepFlow(text) {
      switch (session.step) {
        case 1:
          session.data.companyName = text;
          session.step = 2;
          return "Representative name?";
        case 2:
          session.data.repName = text;
          session.step = 3;
          return "Email?";
        case 3:
          session.data.email = text;
          session.step = 4;
          return "Phone number?";
        case 4:
          session.data.phone = text;
          session.step = 5;
          return "Products?";
        case 5:
          session.data.productList = text;
          session.step = 6;
          return "Preferred date (YYYY-MM-DD)?";
        case 6:
          session.data.preferredDate = text;
          session.step = 7;
          return "Preferred time?";
        case 7:
          session.data.preferredTime = text;
          session.step = 8;
          return "Any notes? (or skip)";
        case 8:
          if (text !== "skip") session.data.notes = text;
          session.step = 9;
          return `
Summary:
• Company: ${session.data.companyName}
• Rep: ${session.data.repName}
• Email: ${session.data.email}
• Phone: ${session.data.phone}
• Products: ${session.data.productList}
• Date: ${session.data.preferredDate}
• Time: ${session.data.preferredTime}
• Notes: ${session.data.notes ?? "None"}

Type confirm or cancel.
          `;
        case 9:
          if (text === "confirm") {
            const result = await apiPost("/api/medrep", session.data);
            clearSession(sessionId);
            return `✅ Visit request submitted!\nID: ${result?.visit?._id || "N/A"}`;
          }
          if (text === "cancel") {
            clearSession(sessionId);
            return "Cancelled.";
          }
          return "Please type confirm or cancel.";
        default:
          session.step = 1;
          return "Company name?";
      }
    }

    // -----------------------
    // Intent detection (when no intent set)
    // -----------------------
    if (!session.intent) {
      if (text.includes("appointment")) {
        session.intent = "appointment";
        session.step = 1;
        saveSession(sessionId, session);
        return response(200, { botResponse: "Sure! What's your name?" });
      }

      if (text.includes("intern") || text.includes("volunteer")) {
        session.intent = "program";
        session.step = 1;
        saveSession(sessionId, session);
        return response(200, { botResponse: "Internship or volunteering?" });
      }

      if (text.includes("adopt")) {
        session.intent = "adoption";
        session.step = 1;
        saveSession(sessionId, session);
        return response(200, { botResponse: "Your full name?" });
      }

      if (text.includes("medical rep") || text.includes("pharma")) {
        session.intent = "medrep";
        session.step = 1;
        saveSession(sessionId, session);
        return response(200, { botResponse: "Company name?" });
      }

      // Default greeting
      return response(200, {
        botResponse: `
Hello! I can help you with:

• Book Appointment  
• Internship / Volunteering  
• Adoption Enquiry  
• Medical Representative Visit  

What would you like to do?
        `.trim(),
      });
    }

    // Route to the correct flow
    switch (session.intent) {
      case "appointment":
        botResponse = await handlePatientFlow(text);
        break;
      case "program":
        botResponse = await handleProgramFlow(text);
        break;
      case "adoption":
        botResponse = await handleAdoptionFlow(text);
        break;
      case "medrep":
        botResponse = await handleMedRepFlow(text);
        break;
      default:
        botResponse = "Sorry, I didn't understand that.";
        break;
    }

    // Save session and return response
    saveSession(sessionId, session);
    return response(200, { botResponse });
  } catch (error) {
    console.error("Chatbot error:", error);
    return response(500, { message: "Chatbot internal error", error: error.message });
  }
};
