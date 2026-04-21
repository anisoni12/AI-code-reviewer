import express, { Router, Request, Response } from 'express';
import { verifyGitHubSignature } from '../utils/verify-signature';
import { runReview } from '../services/review';
import config from '../config';

const router = Router();

router.post(
  '/webhook',
  express.raw({ type: '*/*' }),
  async (req: Request, res: Response) => {
    console.log('🔔 HIT — body type:', typeof req.body, '— is buffer:', Buffer.isBuffer(req.body));

    const signature = req.headers['x-hub-signature-256'] as string;
    const rawBodyBuffer = req.body as Buffer;

    if (!verifyGitHubSignature(rawBodyBuffer, signature, config.GITHUB_WEBHOOK_SECRET)) {
      console.log('❌ Invalid signature — request rejected');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.headers['x-github-event'] as string;
    const payload = JSON.parse(rawBodyBuffer.toString('utf8'));

    console.log(`✅ Webhook received — event: ${event}, action: ${payload.action}`);

    if (
      event === 'pull_request' &&
      ['opened', 'synchronize'].includes(payload.action)
    ) {
      const { number, head } = payload.pull_request;
      const repoOwner = payload.repository.owner.login;
      const repoName = payload.repository.name;

      console.log(`📦 PR #${number} on ${repoOwner}/${repoName} — starting review...`);

      res.status(200).json({ message: 'Review started' });

      runReview({
        owner: repoOwner,
        repo: repoName,
        pullNumber: number,
        headSha: head.sha,
      }).catch(console.error);

    } else {
      console.log(`⏭️  Event ignored: ${event} / ${payload.action}`);
      res.status(200).json({ message: 'Event ignored' });
    }
  }
);

export default router;