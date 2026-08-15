import { isMockMode } from "@/lib/env";
import * as mockKnowledgeBase from "./mock/knowledge-base";
import * as realKnowledgeBase from "./real/knowledge-base";

function impl() {
  return isMockMode() ? mockKnowledgeBase : realKnowledgeBase;
}

export const listDocuments: typeof mockKnowledgeBase.listDocuments = () => impl().listDocuments();
export const uploadDocument: typeof mockKnowledgeBase.uploadDocument = (input) => impl().uploadDocument(input);
export const deleteDocument: typeof mockKnowledgeBase.deleteDocument = (id) => impl().deleteDocument(id);
