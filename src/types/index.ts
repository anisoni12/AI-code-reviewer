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
  position: number;
  content: string;
  type: 'added' | 'removed' | 'context';
}

export interface ReviewComment {
  path: string;
  position?: number;
  line?: number;
  body: string;
}