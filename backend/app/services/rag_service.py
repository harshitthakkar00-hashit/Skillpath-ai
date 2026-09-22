"""RAG (Retrieval-Augmented Generation) & Knowledge Base Service.

Provides vector/semantic retrieval, document indexing, similarity scoring,
and fine-tuning dataset export for computer science and programming topics.
"""

import os
import json
import math
import re
from typing import List, Dict, Any, Optional

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "knowledge_base.json")


class RAGService:
    def __init__(self, data_path: str = DATA_PATH):
        self.data_path = data_path
        self.documents: List[Dict[str, Any]] = []
        self.vocab: Dict[str, int] = {}
        self.doc_vectors: List[Dict[str, float]] = []
        self.idf: Dict[str, float] = {}
        self.load_documents()

    def _tokenize(self, text: str) -> List[str]:
        """Tokenize and normalize text."""
        cleaned = re.sub(r"[^a-zA-Z0-9_\-\.#\+]", " ", text.lower())
        tokens = [t.strip() for t in cleaned.split() if len(t.strip()) > 1]
        return tokens

    def load_documents(self):
        """Load documents from JSON file and initialize index."""
        if os.path.exists(self.data_path):
            try:
                with open(self.data_path, "r", encoding="utf-8") as f:
                    self.documents = json.load(f)
            except Exception:
                self.documents = []
        else:
            self.documents = []
        self._build_index()

    def save_documents(self):
        """Persist documents to JSON file."""
        os.makedirs(os.path.dirname(self.data_path), exist_ok=True)
        with open(self.data_path, "w", encoding="utf-8") as f:
            json.dump(self.documents, f, indent=2)

    def _build_index(self):
        """Build TF-IDF inverted index and vector representations."""
        n_docs = len(self.documents)
        if n_docs == 0:
            return

        doc_freq: Dict[str, int] = {}
        doc_tokens_list = []

        for doc in self.documents:
            searchable_text = f"{doc.get('title', '')} {doc.get('category', '')} {doc.get('language', '')} {' '.join(doc.get('tags', []))} {doc.get('summary', '')} {doc.get('content', '')}"
            tokens = self._tokenize(searchable_text)
            doc_tokens_list.append(tokens)
            unique_tokens = set(tokens)
            for t in unique_tokens:
                doc_freq[t] = doc_freq.get(t, 0) + 1

        # Compute IDF
        self.idf = {}
        for token, df in doc_freq.items():
            self.idf[token] = math.log((n_docs + 1) / (df + 1)) + 1.0

        # Compute document vectors
        self.doc_vectors = []
        for tokens in doc_tokens_list:
            tf: Dict[str, int] = {}
            for t in tokens:
                tf[t] = tf.get(t, 0) + 1
            
            vec: Dict[str, float] = {}
            norm_sq = 0.0
            for t, count in tf.items():
                weight = (1 + math.log(count)) * self.idf.get(t, 1.0)
                vec[t] = weight
                norm_sq += weight * weight
            
            norm = math.sqrt(norm_sq) if norm_sq > 0 else 1.0
            # Normalize vector
            for t in vec:
                vec[t] /= norm
            self.doc_vectors.append(vec)

    def search(self, query: str, top_k: int = 3, category_filter: Optional[str] = None, language_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve most relevant documents using cosine similarity over TF-IDF vectors."""
        if not self.documents or not self.doc_vectors:
            return []

        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        # Build query vector
        q_tf: Dict[str, int] = {}
        for t in query_tokens:
            q_tf[t] = q_tf.get(t, 0) + 1

        q_vec: Dict[str, float] = {}
        norm_sq = 0.0
        for t, count in q_tf.items():
            if t in self.idf:
                weight = (1 + math.log(count)) * self.idf[t]
                q_vec[t] = weight
                norm_sq += weight * weight

        if norm_sq == 0.0:
            # Fallback to simple substring match
            scored = []
            q_lower = query.lower()
            for doc in self.documents:
                score = 0
                title = doc.get("title", "").lower()
                tags = " ".join(doc.get("tags", [])).lower()
                if any(w in title for w in query_tokens):
                    score += 2
                if any(w in tags for w in query_tokens):
                    score += 1.5
                if score > 0:
                    scored.append((score, doc))
            scored.sort(key=lambda x: x[0], reverse=True)
            return [d for _, d in scored[:top_k]]

        q_norm = math.sqrt(norm_sq)
        for t in q_vec:
            q_vec[t] /= q_norm

        scores = []
        for idx, doc_vec in enumerate(self.doc_vectors):
            doc = self.documents[idx]

            # Filters
            if category_filter and doc.get("category", "").lower() != category_filter.lower():
                continue
            if language_filter and doc.get("language", "").lower() != language_filter.lower():
                # Allow partial match if language is contained
                if language_filter.lower() not in doc.get("language", "").lower():
                    continue

            # Dot product for cosine similarity
            sim = 0.0
            for t, val in q_vec.items():
                if t in doc_vec:
                    sim += val * doc_vec[t]

            # Boost if query words match title or tags directly
            title_lower = doc.get("title", "").lower()
            tags_lower = [t.lower() for t in doc.get("tags", [])]
            for t in query_tokens:
                if t in title_lower:
                    sim += 0.25
                if t in tags_lower:
                    sim += 0.20

            if sim > 0.05:
                scores.append((sim, doc))

        scores.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in scores[:top_k]]

    def add_document(self, doc_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add a new document to the knowledge base and refresh index."""
        doc_id = doc_data.get("id") or f"doc-{len(self.documents) + 1}-{re.sub(r'[^a-z0-9]', '', doc_data.get('title', '').lower()[:20])}"
        new_doc = {
            "id": doc_id,
            "title": doc_data.get("title", "Untitled Document"),
            "category": doc_data.get("category", "General CS"),
            "language": doc_data.get("language", "General"),
            "difficulty": doc_data.get("difficulty", "Intermediate"),
            "tags": doc_data.get("tags", []),
            "summary": doc_data.get("summary", ""),
            "content": doc_data.get("content", ""),
            "code_example": doc_data.get("code_example", ""),
            "prevention": doc_data.get("prevention", ""),
            "practice_question": doc_data.get("practice_question", "")
        }
        # Check if updating existing
        existing_idx = next((i for i, d in enumerate(self.documents) if d.get("id") == doc_id), None)
        if existing_idx is not None:
            self.documents[existing_idx] = new_doc
        else:
            self.documents.append(new_doc)

        self.save_documents()
        self._build_index()
        return new_doc

    def delete_document(self, doc_id: str) -> bool:
        """Delete a document by id."""
        initial_count = len(self.documents)
        self.documents = [d for d in self.documents if d.get("id") != doc_id]
        if len(self.documents) < initial_count:
            self.save_documents()
            self._build_index()
            return True
        return False

    def export_finetuning_dataset(self) -> List[Dict[str, Any]]:
        """Generate structured dataset for fine-tuning educational models."""
        dataset = []
        for doc in self.documents:
            dataset.append({
                "question": f"Explain {doc.get('title')} in {doc.get('language')}.",
                "context": doc.get("summary", ""),
                "language": doc.get("language", ""),
                "topic": doc.get("category", ""),
                "difficulty": doc.get("difficulty", "intermediate").lower(),
                "answer": doc.get("content", ""),
                "example_code": doc.get("code_example", ""),
                "practice_exercise": doc.get("practice_question", "")
            })
            if doc.get("practice_question"):
                dataset.append({
                    "question": f"Practice question on {doc.get('title')}: {doc.get('practice_question')}",
                    "context": f"Relevant topic: {doc.get('title')}",
                    "language": doc.get("language", ""),
                    "topic": doc.get("category", ""),
                    "difficulty": doc.get("difficulty", "intermediate").lower(),
                    "answer": f"To solve this, apply the principles of {doc.get('title')}.\n\nReference implementation:\n{doc.get('code_example', '')}",
                    "example_code": doc.get("code_example", ""),
                    "practice_exercise": doc.get("practice_question", "")
                })
        return dataset


# Global singleton instance
rag_service = RAGService()
