import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { getPracticeDetail, listPractice, submitPracticeAttempt } from "./practice.service";

const getStatusFromError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return 500;
  }

  if (error.message === "Practice not found") {
    return 404;
  }

  if (
    error.message === "Invalid score payload" ||
    error.message === "Correct count cannot exceed total count" ||
    error.message === "Practice is not active" ||
    error.message === "Invalid stage payload"
  ) {
    return 400;
  }

  return 500;
};

export const getAllPracticeHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const practices = await listPractice(req.userId);
    return res.status(200).json({ success: true, data: practices });
  } catch (error) {
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Internal server error" });
  }
};

export const getPracticeDetailHandler = async (req: AuthRequest, res: Response) => {
  try {
    const practiceId = String(req.params.practiceId ?? req.params.gameId ?? "");
    const practice = await getPracticeDetail(practiceId, req.userId);
    return res.status(200).json({ success: true, data: practice });
  } catch (error) {
    return res.status(getStatusFromError(error)).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const submitPracticeAttemptHandler = async (req: AuthRequest, res: Response) => {
  try {
    const practiceId = String(req.params.practiceId ?? req.params.gameId ?? "");
    const { score, correctCount, totalCount, stageId, answers } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (
      !Array.isArray(answers) &&
      (score === undefined || correctCount === undefined || totalCount === undefined)
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: answers or score, correctCount, totalCount",
      });
    }

    const result = await submitPracticeAttempt(userId, practiceId, {
      score,
      correctCount,
      totalCount,
      stageId,
      answers,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(getStatusFromError(error)).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
