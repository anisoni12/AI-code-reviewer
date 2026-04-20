export interface ReviewRequest {
  owner: string;
  repo: string;
  pullNumber: number;
  headSha: string;
}

export interface DiffFile {
  path: string;
  lines: DiffLine[];
}

export interface DiffLine {
  lineNumber: number;
  content: string;
  type: 'added' | 'removed' | 'context';
}

export interface ReviewComment {
  path: string;
  line: number;
  body: string;
}