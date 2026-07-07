type ErrorResponse = {
  message?: string;
};

export function parseSocketError(body: string) {
  try {
    const error = JSON.parse(body) as ErrorResponse;

    if (error.message) {
      return error.message;
    }
  } catch {
    return '요청을 처리하지 못했어요. 다시 시도해주세요.';
  }

  return '요청을 처리하지 못했어요. 다시 시도해주세요.';
}
