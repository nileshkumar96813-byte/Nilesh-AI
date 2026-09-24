import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

app.use(express.json());
app.use(express.static("public"));

const systemPrompt = `
You are Nilesh Kumar AI.

You are a helpful professional AI assistant.

You can help with:
- Hindi, English and Hinglish translation
- Professional translation
- English speaking practice
- Job and career guidance
- Interview preparation
- Resume/CV writing
- Computer and web development
- Coding
- General questions

Rules:
- Give clear and useful answers.
- Do not invent qualifications, jobs, certificates or experience.
- When translating, preserve the original meaning.
- For resumes, only use information provided by the user.
- Explain difficult English in simple language.
`;

app.post("/api/ai", async (req, res) => {
  try {
    if (!client) {
      return res.status(503).json({
        error:
          "OpenAI API key is not configured. Add OPENAI_API_KEY to the server environment."
      });
    }

    const {
      message,
      mode = "chat"
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    let instruction = "";

    if (mode === "translation") {
      instruction =
        "Act as an expert Hindi-English-Hinglish translator. Give natural and accurate translation.";
    }

    if (mode === "resume") {
      instruction =
        "Act as an expert ATS-friendly resume writer. Never invent information.";
    }

    if (mode === "jobs") {
      instruction =
        "Act as a professional career and job assistant.";
    }

    if (mode === "english") {
      instruction =
        "Act as an English speaking teacher. Correct grammar and give natural alternatives.";
    }

    if (mode === "coding") {
      instruction =
        "Act as a beginner-friendly senior web-development and coding expert.";
    }

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      instructions: `${systemPrompt}\n\n${instruction}`,
      input: message
    });

    res.json({
      answer:
        response.output_text ||
        "Sorry, no answer was returned."
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message || "AI request failed."
    });
  }
});

app.get("/api/status", (req, res) => {
  res.json({
    aiConfigured: Boolean(process.env.OPENAI_API_KEY)
  });
});

app.listen(PORT, () => {
  console.log(`Nilesh Kumar AI running on port ${PORT}`);
});
