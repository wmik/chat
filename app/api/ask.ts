import type { ActionFunctionArgs } from 'react-router';
import { type FileUpload, parseFormData } from '@remix-run/form-data-parser';
import { MemoryFileStorage } from '@remix-run/file-storage/memory';
import { tasks } from '@trigger.dev/sdk';
import { askTask } from '~/trigger/ask';
import { ingestDocuments, parsers } from '~/llm.server';
import { randomUUID } from 'node:crypto';

const KB = 1024;
const MB = 1024 * KB;

export async function ask({ request, params }: ActionFunctionArgs) {
  let fileStorage = new MemoryFileStorage();
  let formData = await parseFormData(
    request,
    { maxFiles: 5, maxFileSize: 5 * MB },
    uploadHandler
  );
  let files = formData.getAll('files') as File[];
  let thread_id = params?.id ?? randomUUID();
  let task = await tasks.trigger<typeof askTask>('ask', {
    thread: thread_id,
    query: formData.get('query')?.toString() as string
  });

  for (let file of files) {
    let source = file?.name;
    let docs = await parsers[file?.type]?.(file as any);
    let collection = await ingestDocuments(
      docs?.map((doc, idx) => ({
        ...doc,
        metadata: {
          ...doc?.metadata,
          source: `${source} [Page ${idx + 1}]`
        }
      })),
      thread_id
    );
    console.log(collection);
  }

  return {
    data: {
      task
    },
    errors: null,
    metadata: {
      action: 'ask',
      timestamp: new Date().toISOString()
    }
  };
}

function uploadHandler(fileUpload: FileUpload) {
  return fileUpload;
}
