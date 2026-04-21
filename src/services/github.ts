import { Octokit } from '@octokit/rest';
import config from '../config';
import { ReviewComment } from '../types';

const octokit = new Octokit({ auth: config.GITHUB_TOKEN });

export async function getPRDiff(owner: string, repo: string, pullNumber: number): Promise<string> {
  const response = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
    mediaType: {
      format: 'diff',
    },
  });

  return response.data as unknown as string;
}

export async function createReviewComments(
  owner: string,
  repo: string,
  pullNumber: number,
  commitId: string,
  comments: ReviewComment[]
): Promise<void> {
  if (comments.length === 0) {
    console.log(`No review comments to post for ${owner}/${repo}#${pullNumber}`);
    return;
  }

  // Format all comments into a single review body
  const reviewBody = comments.map((c, i) =>
    `### Comment ${i + 1} — \`${c.path}\` (line ${c.line ?? c.position})\n\n${c.body}`
  ).join('\n\n---\n\n');

  try {
    await octokit.rest.pulls.createReview({
      owner,
      repo,
      pull_number: pullNumber,
      commit_id: commitId,
      event: 'COMMENT',
      body: `## AI Code Review\n\n${reviewBody}`,
    });
    console.log(`✅ Posted review with ${comments.length} comments on ${owner}/${repo}#${pullNumber}`);
  } catch (error) {
    console.error(`❌ Failed to post review:`, error);
    throw error;
  }
}