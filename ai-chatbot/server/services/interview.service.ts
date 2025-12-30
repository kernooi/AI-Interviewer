import { InterviewState, InterviewStage, AiReply } from "../state/interview.state";
import { openAiService } from "./openai.service";

class InterviewService {
  private static state = new InterviewState();

  async handleMessage(userMessage = ""): Promise<string> {
    const state = InterviewService.state;

    if (state.ended) {
      return "The interview has ended. Thank you.";
    }

    const lower = userMessage.toLowerCase();
    if (lower.includes("next stage") || lower.includes("skip")) {
      state.currentStage++;
      state.questionsAskedInStage = 0;
      const prompt = this.getStagePrompt(state.currentStage);
      state.history.push({ role: "assistant", message: prompt });
      return prompt;
    }

    const aiReply: AiReply = await openAiService.getReply(userMessage, state);

    if (userMessage) {
      state.history.push({ role: "user", message: userMessage });
    }

    state.history.push({ role: "assistant", message: aiReply.message });

    if (aiReply.questionAnswered) {
      state.questionsAskedInStage++;
    }

    this.advanceStageIfNeeded(state);

    if (aiReply.message.includes("INTERVIEW_ENDED")) {
      state.ended = true;
      return aiReply.message.replace("INTERVIEW_ENDED", "").trim() +
        "\n\nThank you. The interview has concluded.";
    }

    return aiReply.message;
  }

  private advanceStageIfNeeded(state: InterviewState) {
    const limits = [1, 3, 1, 1];

    if (state.questionsAskedInStage >= limits[state.currentStage]) {
      state.currentStage++;
      state.questionsAskedInStage = 0;
    }
  }

  private getStagePrompt(stage: InterviewStage): string {
    switch (stage) {
      case InterviewStage.Introduction:
        return "Hello! Could you briefly introduce yourself?";
      case InterviewStage.SkillsExperience:
        return "Can you describe your skills and relevant experience?";
      case InterviewStage.Expectations:
        return "What are your salary expectations?";
      case InterviewStage.CandidateQuestions:
        return "Do you have any questions for us?";
      default:
        return "";
    }
  }
}

export const interviewService = new InterviewService();
