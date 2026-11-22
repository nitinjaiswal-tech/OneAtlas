export type BenchmarkScores = {
  mmlu: number;
  humanEval: number;
  sweBench: number;
  gpqa: number;
};

export type Provider = {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  initials: string;
  headquarters: string;
};

export type Model = {
  id: string;
  name: string;
  slug: string;
  providerSlug: string;
  providerName: string;
  providerColor: string;
  description: string;
  version: string;
  inputPrice: number;
  outputPrice: number;
  contextWindow: number;
  maxOutputTokens: number;
  modalities: string[];
  capabilities: string[];
  openSource: boolean;
  releaseDate: string;
  popularity: number;
  speedScore: number;
  category: string;
  benchmarks: BenchmarkScores;
};

export type ModelListResponse = {
  models: Model[];
  total: number;
  page: number;
  pageSize: number;
};
