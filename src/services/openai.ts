import Groq from 'groq-sdk';
import config from '../config';
import { ReviewComment } from '../types';

const groq = new Groq({ apiKey: config.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a senior software engineer reviewing a pull request.
Analyse the diff and return a JSON object with a "comments" array.
Each comment must have:
  - path: the file path (string)
  - line: the line number in the diff (number)
  - body: your review comment (string, concise and actionable)
Focus only on: bugs, security issues, performance problems, bad practices.
Skip style and formatting issues.
Return ONLY valid JSON in this exact shape:
{ "comments": [{ "path": "...", "line": 1, "body": "..." }] }
No markdown, no explanation, just the JSON object.`;

export async function reviewDiff(diff: string): Promise<ReviewComment[]> {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Review this diff:\n\n${diff}` }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = response.choices[0].message.content ?? '{}';
  const parsed = JSON.parse(content);
  return Array.isArray(parsed) ? parsed : parsed.comments ?? [];
}