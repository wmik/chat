import { randomUUID } from 'node:crypto';
import { ChatAnthropic } from '@langchain/anthropic';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { Chroma } from '@langchain/community/vectorstores/chroma';
// import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { Document } from '@langchain/core/documents';
import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf';
import { RecursiveUrlLoader } from '@langchain/community/document_loaders/web/recursive_url';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { PPTXLoader } from '@langchain/community/document_loaders/fs/pptx';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { compile } from 'html-to-text';

function getStore(collectionName: string) {
  let embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
    openAIApiKey: process.env.OPENAI_API_KEY
  });

  return new Chroma(embeddings, {
    collectionName,
    chromaCloudAPIKey: process.env.CHROMA_API_KEY,
    clientParams: {
      tenant: process.env.CHROMA_TENANT,
      database: process.env.CHROMA_DATABASE,
      host: 'api.trychroma.com',
      port: 8000,
      ssl: true,
      headers: { 'x-chroma-token': process.env.CHROMA_API_KEY as string }
    }
  });
}

export async function ingestDocuments(
  documents: Document[],
  collection?: string
) {
  // let textSplitter = new RecursiveCharacterTextSplitter({
  //   chunkSize: 1000,
  //   chunkOverlap: 200
  // });

  // let chunks = textSplitter.splitDocuments(documents);

  let store = getStore(collection ?? randomUUID());

  store.addDocuments(documents);

  return store.toJSON();
}

async function retrieveSources(collection: string, query: string, k = 4) {
  let store = getStore(collection);

  if (!store) {
    throw new Error('No documents ingested yet');
  }

  return await store.similaritySearch(query, k);
}

export async function queryWithStreaming(
  collection: string,
  question: string,
  onStream: (chunk: string) => void
) {
  let sources = await retrieveSources(collection, question);

  let prompt = PromptTemplate.fromTemplate(
    `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Keep the answer concise.

Question: {question}

Context: {context}

Answer:`
  );

  let llm = new ChatAnthropic({
    model: 'claude-3-5-sonnet-20240620',
    temperature: 0,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY
  });

  let context = sources.map(doc => doc.pageContent).join('\n\n');

  let chain = RunnableSequence.from([prompt, llm, new StringOutputParser()]);

  let stream = await chain.stream({
    question,
    context
  });

  let answer = '';

  for await (let chunk of stream) {
    answer += chunk;
    onStream(chunk);
  }

  return {
    answer,
    sources
  };
}

async function pdf(blob: Blob) {
  let loader = new WebPDFLoader(blob);
  return await loader.load();
}

async function html(url: string) {
  let compiledConvert = compile({ wordwrap: 130 }); // returns (text: string) => string;

  let loader = new RecursiveUrlLoader(url, {
    extractor: compiledConvert,
    maxDepth: 1
  });

  return await loader.load();
}

async function txt(blob: Blob) {
  let loader = new TextLoader(blob);
  return await loader.load();
}

async function json(blob: Blob) {
  let loader = new JSONLoader(blob);
  return await loader.load();
}

async function docx(blob: Blob) {
  let loader = new DocxLoader(blob);
  return await loader.load();
}

async function doc(blob: Blob) {
  let loader = new DocxLoader(blob, { type: 'doc' });
  return await loader.load();
}

async function pptx(blob: Blob) {
  let loader = new PPTXLoader(blob);
  return await loader.load();
}

async function csv(blob: Blob) {
  let loader = new CSVLoader(blob);
  return await loader.load();
}

type FileParser = (blob: Blob) => Promise<Document<Record<string, any>>[]>;
type StringParser = (text: string) => Promise<Document<Record<string, any>>[]>;
type Parser = FileParser | StringParser;

export const parsers: Record<string, Parser> = {
  'text/csv': csv,
  'application/msword': doc,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    docx,
  'text/html': html,
  'application/pdf': pdf,
  'application/vnd.ms-powerpoint': pptx,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    pptx,
  'text/plain': txt,
  'text/markdown': txt,
  'application/json': json
};
