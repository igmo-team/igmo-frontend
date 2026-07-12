import type { ImageGenerationSnapshot } from '../../../domain/room/types';

export function parseImageGenerationSnapshot(
  body: string,
): ImageGenerationSnapshot | null {
  try {
    const data = JSON.parse(body) as ImageGenerationSnapshot;

    if (isImageGenerationSnapshot(data)) {
      return data;
    }
  } catch {
    return null;
  }

  return null;
}

function isImageGenerationSnapshot(
  value: unknown,
): value is ImageGenerationSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const snapshot = value as Partial<ImageGenerationSnapshot>;

  return (
    typeof snapshot.roomCode === 'string' &&
    typeof snapshot.status === 'string' &&
    typeof snapshot.prompt === 'string'
  );
}
