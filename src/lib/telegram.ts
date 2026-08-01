import { createHmac } from "node:crypto";
import ky from "ky";

export class TelegramApiError extends Error {
  errorCode: number | undefined;

  constructor(message: string, errorCode?: number) {
    super(message);
    this.name = "TelegramApiError";
    this.errorCode = errorCode;
  }
}

type TelegramResponse<T> = {
  ok: boolean;
  result: T;
  description?: string;
  error_code?: number;
};

const API_URL = "https://api.telegram.org";

export const telegramRequest = async <T>(
  token: string,
  method: string,
  body?: Record<string, unknown>,
): Promise<T> => {
  const response = await ky.post(`${API_URL}/bot${token}/${method}`, {
    json: body ?? {},
    timeout: 15000,
    throwHttpErrors: false,
  });

  const data = (await response.json()) as TelegramResponse<T>;

  if (!data.ok) {
    throw new TelegramApiError(
      data.description ?? "Telegram API error",
      data.error_code,
    );
  }

  return data.result;
};

export const isTelegramEntityParseError = (error: unknown): boolean => {
  return (
    error instanceof TelegramApiError &&
    error.errorCode === 400 &&
    error.message.toLowerCase().includes("can't parse entities")
  );
};

export const getBotUsername = async (token: string): Promise<string | null> => {
  const result = await telegramRequest<{ username?: string }>(token, "getMe");
  return result.username ?? null;
};

export const telegramWebhookSecret = (
  token: string,
  workflowId: string,
): string => {
  return createHmac("sha256", token).update(workflowId).digest("hex");
};
