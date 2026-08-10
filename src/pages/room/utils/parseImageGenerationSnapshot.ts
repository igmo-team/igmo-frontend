import type { ImageGenerationSnapshot } from '../../../domain/room/types';

const IMAGE_GENERATION_STATUSES = [
  'GENERATING',
  'READY',
  'FAILED',
] as const;

export function parseImageGenerationSnapshot(
  body: string,
): ImageGenerationSnapshot | null {
  try {
    const data = JSON.parse(body) as unknown;

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
    (IMAGE_GENERATION_STATUSES as readonly string[]).includes(
      snapshot.status,
    ) &&
    typeof snapshot.prompt === 'string' &&
    (snapshot.imageUrl === undefined ||
      snapshot.imageUrl === null ||
      typeof snapshot.imageUrl === 'string') &&
    (snapshot.errorMessage === null ||
      typeof snapshot.errorMessage === 'string')
  );
}
