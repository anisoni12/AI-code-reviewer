import { DiffFile, DiffLine } from '../types';

export function parseDiff(rawDiff: string): DiffFile[] {
  const files: DiffFile[] = [];
  let currentFile: DiffFile | null = null;
  let position = 0;
  let inHunk = false;

  const lines = rawDiff.split('\n');

  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      currentFile = null;
      inHunk = false;
      continue;
    }

    if (line.startsWith('--- a/')) {
      continue;
    }

    if (line.startsWith('+++ b/')) {
      // Sometimes it is /dev/null if a file is deleted
      if (line.trim() === '+++ /dev/null') {
        currentFile = null;
        continue;
      }
      const path = line.replace('+++ b/', '').trim();
      currentFile = { path, lines: [] };
      files.push(currentFile);
      position = 0;
      inHunk = false;
      continue;
    }

    if (!currentFile) {
      continue;
    }

    if (line.startsWith('@@ ')) {
      inHunk = true;
      if (position > 0) {
        position++; // Each subsequent hunk header counts as a position index in GitHub's patch
      } else {
        position = 0; // First hunk starts here
      }
      continue;
    }

    if (inHunk) {
      // Exclude special diff indicators from eating a position
      if (line.startsWith('\\ No newline at end of file')) {
        continue;
      }

      position++;

      let type: 'added' | 'removed' | 'context' = 'context';
      if (line.startsWith('+')) type = 'added';
      else if (line.startsWith('-')) type = 'removed';

      if (type === 'added' || type === 'removed' || line.startsWith(' ')) {
        currentFile.lines.push({
          position,
          content: line,
          type
        });
      }
    }
  }

  return files;
}

export function formatDiffForAI(files: DiffFile[]): string {
  let output = '';
  for (const file of files) {
    // Only send files that have changed lines
    const hasChanges = file.lines.some(l => l.type === 'added' || l.type === 'removed');
    if (!hasChanges) continue;

    output += `\nFile: ${file.path}\n`;
    for (const l of file.lines) {
      // We instruct AI to use the number before the colon as the 'position'
      output += `${l.position}:${l.content}\n`;
    }
  }
  return output.trim();
}
