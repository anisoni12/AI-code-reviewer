import crypto from 'crypto';

export function verifyGitHubSignature(
  payload: Buffer,
  signature: string | undefined,
  secret: string
): boolean {
  if (!signature) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  );
}