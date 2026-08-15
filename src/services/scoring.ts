import { isMockMode } from "@/lib/env";
import * as mockScoring from "./mock/scoring";
import * as realScoring from "./real/scoring";

function impl() {
  return isMockMode() ? mockScoring : realScoring;
}

export const listScoringCriteria: typeof mockScoring.listScoringCriteria = () => impl().listScoringCriteria();
export const saveScoringCriteria: typeof mockScoring.saveScoringCriteria = (inputs) =>
  impl().saveScoringCriteria(inputs);
