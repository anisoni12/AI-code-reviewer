import { getPRDiff, createReviewComments } from './github';
import { reviewDiff } from './openai';
import { parseDiff, formatDiffForAI } from '../utils/diff-parser';
import { ReviewRequest } from '../types';

export async function runReview(payload: ReviewRequest): Promise<void> {
  const { owner, repo, pullNumber, headSha } = payload;

  try {
    console.log(`[Review ${pullNumber}] Fetching diff for ${owner}/${repo}...`);
    const rawDiff = await getPRDiff(owner, repo, pullNumber);

    if (!rawDiff) {
      console.log(`[Review ${pullNumber}] Diff is empty, skipping.`);
      return;
    }

    console.log(`[Review ${pullNumber}] Parsing diff...`);
    const parsedFiles = parseDiff(rawDiff);
    const formattedDiff = formatDiffForAI(parsedFiles);

    if (!formattedDiff) {
      console.log(`[Review ${pullNumber}] No meaningful changes found in diff, skipping AI review.`);
      return;
    }

    console.log(`[Review ${pullNumber}] Sending to OpenAI for review...`);
    const comments = await reviewDiff(formattedDiff);

    if (comments.length === 0) {
      console.log(`[Review ${pullNumber}] AI completely approved the changes. No comments to post.`);
      return;
    }

    console.log(`[Review ${pullNumber}] Submitting ${comments.length} batched comments to GitHub...`);
    await createReviewComments(owner, repo, pullNumber, headSha, comments);

    console.log(`[Review ${pullNumber}] ✅ Review successfully completed!`);
  } catch (error) {
    console.error(`[Review ${pullNumber}] ❌ Error during the review process:`, error);
  }
}
