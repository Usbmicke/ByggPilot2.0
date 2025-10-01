
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});
const indexName = 'byggpilot-memory';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

// Function to get or create the Pinecone index
async function getOrCreatePineconeIndex() {
  const existingIndexes = await pinecone.listIndexes();
  if (!existingIndexes.includes(indexName)) {
    await pinecone.createIndex({
      name: indexName,
      dimension: 768, // Dimension for text-embedding-004
      metric: 'cosine',
    });
  }
  return pinecone.Index(indexName);
}

// Function to embed text using Google's model
async function embedText(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  const embedding = result.embedding;
  if (!embedding || !embedding.values) {
    throw new Error('Failed to generate embedding.');
  }
  return embedding.values;
}

// Function to save a piece of information to the memory
export async function saveToMemory(text: string, metadata: object = {}) {
  const index = await getOrCreatePineconeIndex();
  const embedding = await embedText(text);
  
  // Create a unique ID for the vector
  const vectorId = new Date().toISOString(); 

  await index.upsert([
    {
      id: vectorId,
      values: embedding,
      metadata: { 
        ...metadata, 
        source: 'chat_memory', 
        createdAt: new Date().toISOString(),
        originalText: text // Storing the original text for easier debugging
      },
    },
  ]);

  console.log(`Successfully saved memory: "${text}"`);
}

// Function to search the memory for relevant information
export async function searchMemory(query: string, topK: number = 3) {
  const index = await getOrCreatePineconeIndex();
  const queryEmbedding = await embedText(query);

  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });

  return results.matches?.map(match => match.metadata?.originalText as string) || [];
}
