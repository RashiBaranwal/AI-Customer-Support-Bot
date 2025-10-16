Video Link: https://drive.google.com/file/d/1UQnh1CLMwtoAAb5jKs4oXMRCBEyZUShu/view?usp=drive_link

GitHub Repo Link: https://github.com/RashiBaranwal/AI-Customer-Support-Bot

PDF Link : https://drive.google.com/file/d/1D3Z8x0ty82KzX97UJxrkXT-hLZ5RwKd9/view?usp=sharing

# 🤖 AI Customer Support Bot

An **AI-powered Customer Support Bot** built with:
- **Frontend:** React 19  
- **Backend:** Express.js  
- **Database:** MongoDB  
- **LLM:** Google Gemini  

This bot can:
- Answer FAQs accurately  
- Maintain **conversation memory (session context)**  
- Simulate **escalation/handoff** when the query cannot be resolved  

---

## 🧠 Overview

This repository provides a full-stack implementation of an AI-driven customer support system for **Acme Corp**.  
The AI assistant (SupportBot) answers user questions, manages sessions, and triggers escalation workflows when needed.

---

## 📘 Prompt Documentation

This section documents the **prompt engineering** logic used for the Gemini LLM integration.

---

### 🧩 1 — System Prompt (High-Level Behavior)

You are SupportBot, an AI customer support assistant for Acme Corp. Your goals:

1. Provide helpful, concise answers to user FAQs based on the dataset and conversation context.  
2. Ask clarifying questions only when necessary.  
3. If you cannot answer, propose an escalation and create a structured `escalation_ticket` object containing key details.  
4. Always be polite and professional. Keep responses short (1–3 sentences) for FAQs, longer when explaining steps.  
5. When asked, produce an actionable summary of the session in JSON.  
6. Do not hallucinate product features. If unsure, say “I don’t have that information” and suggest ways to escalate.  

---

### 💬 2 — FAQ Answering Prompt Template

Used when a user asks a question that matches an FAQ.

```json
{
  "type": "faq_answer",
  "answer": "...",
  "confidence": 0.0-1.0,
  "source_faq_ids": ["faq_12"],
  "follow_up_question": null | "..."
}

```

### ❓ 3 — Clarifying Question Template
When the LLM needs more details:
```json
{
  "type": "clarifying",
  "question": "...",
  "expected_fields": ["order_id", "platform", "screenshot"]
}
```
### 🚨 4 — Escalation / Handoff Prompt Template
When the issue requires human intervention:

```json
{
  "type": "escalation",
  "ticket": {
    "title": "Short descriptive title",
    "priority": "low|medium|high",
    "user_id": "...",
    "session_id": "...",
    "summary": "One-paragraph summary of the issue",
    "attachments": ["screenshot_base64" | "url"],
    "logs": ["last_5_messages"],
    "suggested_owner": "billing_team|technical_team",
    "created_at": "ISO8601"
  },
  "agent_message": "Suggested message for human agent",
  "user_message": "Short message to send to the user explaining escalation",
  "escalation_reason": "Why automatic escalation was triggered"
}
```
### 🧾 5 — Conversation Summary Prompt
When the session ends or the agent requests a summary:
```json
{
  "type": "summary",
  "session_id": "...",
  "duration_seconds": 0,
  "user_intent": "...",
  "resolved": true|false,
  "highlights": ["..."],
  "final_recommendation": "..."
}
```

### ⚙️ 6 — Prompting Parameters & Hints
| Parameter | Recommended Value | Notes |
| :--- | :--- | :--- |
| **Temperature** | 0.0–0.3 | Factual answers |
| **Temperature** | 0.5 | Friendly paraphrases |
| **Max Tokens** | 512 | Safe for JSON |
| **Top-p** | 0.9 | Optional |
| **Logit Bias** | Favor $\{\, \}, :, ,$ | Improves JSON output |

✅ Always instruct the model to return JSON only for easy parsing.

### 🧩 7 — Few-Shot Examples
Example 1 — Simple FAQ

FAQ:
```json
{"id":"faq_01","q":"How do I reset my password?","a":"Click ‘Forgot password’ on the login page and follow the instructions. You’ll receive an email with a reset link."}
```
User:
"I forgot my password."

Response:

```json
{"type":"faq_answer","answer":"Click ‘Forgot password’ on the login page and follow the instructions. You’ll receive an email with a reset link.","confidence":0.98,"source_faq_ids":["faq_01"],"follow_up_question":null}
```
Example 2 — Escalation Suggestion

User:
"My invoice shows a charge I don't recognize."
```json
{
  "type": "escalation",
  "ticket": { ... },
  "agent_message": "Please investigate transaction #12345 and refund if fraudulent",
  "user_message": "We've escalated this to billing. Expect a reply within 24 hours.",
  "escalation_reason": "possible_fraud_low_confidence"
}

```
### 🖥️ Backend Integration Notes
API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/llm/respond` | `POST` | Calls Gemini LLM |
| `/api/chat/start` | `POST` | Create new session |
| `/api/chat/:sessionId/message` | `POST` | Send user message |
| `/api/chat/:sessionId/history` | `GET` | Retrieve chat history |
| `/api/chat/:sessionId/escalate` | `POST` | Manually escalate |

Example Backend Request to LLM:

```json
{
  "system_prompt": "<system prompt string>",
  "user_prompt": "<complete assembled prompt>",
  "context": {"conversation_history": [...], "faq_snippet": [...], "session_id": "..."},
  "temperature": 0.0
}
```
Response Handling:

Validate that the LLM returns valid JSON

Retry up to 2 times with Return valid JSON only if parsing fails

Save both raw and parsed responses in MongoDB

### 🧮 Session Memory
-> Store conversations in MongoDB sessions collection
-> TTL (Time-To-Live):
    -> Active: 90 days
    -> Archive: 365 days
-> Include last 8 messages + key metadata for LLM context
### 🗄️ MongoDB Data Schema

| Collection | Fields |
| :--- | :--- |
| `sessions` | `{ _id, session_id, user_id, messages[], status }` |
| `faqs` | `{ _id, faq_id, question, answer, tags[] }` |
| `escalations` | `{ _id, ticket_id, session_id, title, priority, summary, created_at, owner, status }` |
| `users` | `{ _id, user_id, name, email }` |

### ⚡ Running Locally
Frontend
```json
cd frontend
pnpm install
pnpm dev

```

Backend
```json
cd backend
pnpm install
pnpm dev

```
Database

Start MongoDB locally or use MongoDB Atlas, then set the URI in .env:

```json
MONGO_URI=<your_mongo_connection_string>

```
### 🧰 Prompt Helper Example

```json
const assemblePrompt = ({sessionId, history, faqSnippet, userQuestion}) => `
System: ${SYSTEM_PROMPT}

Context:
session_id: ${sessionId}
conversation_history: ${history}

FAQ SNIPPET:
${faqSnippet}

User question:
"${userQuestion}"

Return JSON...
`;

```
### 🧭 Best Practices & Monitoring

```json
Use deterministic settings (temp=0) for structured outputs

Log all LLM inputs & outputs

Maintain a human-review queue for escalations

Evaluate with a test set of expected queries

Track metrics:

Response latency

Session resolution rate

Escalation rate

User satisfaction (CSAT)
```
### 🔒 Security & Privacy

Never store PII in free-text logs
Use hashed or structured fields for sensitive data
Rotate API keys regularly
Comply with GDPR/CCPA data retention and deletion policies

### Tech Stack: React 19 • Express • MongoDB • Gemini LLM
