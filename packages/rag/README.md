# @telemind/rag

Retrieval-Augmented Generation (RAG) engine for TeleMind.

## Pipeline Components
1. **Document Ingestion**: Parsing PDF, Markdown, and TXT files.
2. **Text Chunking**: Recursive character and semantic chunking with configurable overlap.
3. **Embedding Vectorization**: Batch embedding generation with Gemini `text-embedding-004`.
4. **Vector Retrieval**: Cosine similarity (`<=>`) and Inner Product queries over PostgreSQL `pgvector`.
5. **Context Augmentation**: Prompt construction, reranking, source citation attribution, and hallucination guardrails.
