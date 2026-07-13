import { expandQuery } from "./synonyms";

export interface ScoredCandidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  yearsExperience: number | null;
  educationLevel: string | null;
  workMode: string | null;
  availability: string | null;
  salaryExpectation: string | null;
  skills: string | null;
  cvText: string | null;
  coverLetter: string | null;
  status: string;
  createdAt: Date;
  job: { id: string; title: string; department: string };
  score: number;
  matchedTerms: string[];
}

// Weights per field: skills and cvText carry the most signal
const FIELD_WEIGHTS: Record<string, number> = {
  skills: 4,
  cvText: 2,
  coverLetter: 1.5,
  firstName: 1,
  lastName: 1,
  city: 1,
};

export function scoreCandidate(
  candidate: Omit<ScoredCandidate, "score" | "matchedTerms">,
  terms: string[]
): { score: number; matchedTerms: string[] } {
  const matchedSet = new Set<string>();
  let score = 0;

  for (const term of terms) {
    const lterm = term.toLowerCase();

    for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
      const value = (candidate as Record<string, unknown>)[field];
      if (typeof value === "string" && value.toLowerCase().includes(lterm)) {
        score += weight;
        matchedSet.add(term);
        break; // count each term once per candidate
      }
    }
  }

  // Bonus: candidate has a parsed CV (+2 quality signal)
  if (candidate.cvText && candidate.cvText.length > 200) score += 2;

  // Bonus: candidate filled in skills (+1)
  if (candidate.skills && candidate.skills.length > 5) score += 1;

  return { score, matchedTerms: Array.from(matchedSet) };
}

export function rankCandidates(
  candidates: Omit<ScoredCandidate, "score" | "matchedTerms">[],
  query: string
): ScoredCandidate[] {
  const terms = expandQuery(query);
  return candidates
    .map((c) => ({ ...c, ...scoreCandidate(c, terms) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);
}
