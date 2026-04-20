import express, { Router, Request, Response } from 'express';
import { verifyGitHubSignature } from '../utils/verify-signature';
import config from '../config';

const router = Router();

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
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
      const { number } = payload.pull_request;
      const repoOwner = payload.repository.owner.login;
      const repoName = payload.repository.name;

      console.log(`📦 PR #${number} on ${repoOwner}/${repoName} — starting review...`);

      res.status(200).json({ message: 'Review started' });

      console.log(`🔍 Review pipeline will run here for PR #${number}`);
    } else {
      console.log(`⏭️  Event ignored: ${event} / ${payload.action}`);
      res.status(200).json({ message: 'Event ignored' });
    }
  }
);

export default router;