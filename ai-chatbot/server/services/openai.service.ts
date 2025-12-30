import { buildInterviewerPrompt } from "../prompts/interviewer.prompt";
import { InterviewState, HistoryItem, AiReply, OpenAiResponse } from "../state/interview.state";

export class OpenAiService {
  async getReply(message: string, state: InterviewState): Promise<AiReply> {
    const messages: { role: string; content: string }[] = [
      { role: "system", content: buildInterviewerPrompt(state) },
      ...state.history.map((h: HistoryItem) => ({ role: h.role, content: h.message })),
      ...(message ? [{ role: "user", content: message }] : [])
    ];

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages,
          temperature: 0.3
        })
      });

      const json: OpenAiResponse & { error?: { message: string } } = await res.json();

      // Handle API errors (like rate limit, invalid API key, etc.)
      if (json.error) {
        return {
          message: `OpenAI API Error: ${json.error.message}`,
          questionAnswered: false
        };
      }

      if (!json.choices || !Array.isArray(json.choices) || json.choices.length === 0) {
        return { message: "OpenAI returned no response", questionAnswered: false };
      }

      const content: string = json.choices[0].message?.content ?? "";

      const answered: boolean = content.includes("CountAnswer: YES");
      const cleanedMessage: string = content.replace(/CountAnswer:.*/g, "").trim();

      return { message: cleanedMessage, questionAnswered: answered };
    } catch (err: unknown) {
      // Catch network errors or unexpected issues
      return {
        message: `OpenAI request failed: ${err instanceof Error ? err.message : String(err)}`,
        questionAnswered: false
      };
    }
  }
}

export const openAiService = new OpenAiService();
