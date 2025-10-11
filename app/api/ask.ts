import type { ActionFunctionArgs } from 'react-router';
import { type FileUpload, parseFormData } from '@remix-run/form-data-parser';
import { MemoryFileStorage } from '@remix-run/file-storage/memory';
import { tasks } from '@trigger.dev/sdk';
import { askTask } from '~/trigger/ask';
import { ingestDocuments, parsers } from '~/llm.server';
import { uid } from '~/misc';
import { upsertThread } from '~/database/threads.server';
import { getSession } from '~/database/auth.server';

const KB = 1024;
const MB = 1024 * KB;

export async function ask({ request, params }: ActionFunctionArgs) {
  let errors: string[] = [];
  let { getUser } = await getSession(request);
  let session = await getUser();
  let fileStorage = new MemoryFileStorage();
  let formData = await parseFormData(
    request,
    { maxFiles: 5, maxFileSize: 5 * MB },
    uploadHandler
  );
  let files = formData.getAll('files') as File[];
  let query = formData.get('query')?.toString() as string;
  let thread_id = params?.thread ?? uid();
  let thread = await upsertThread(
    {
      id: thread_id,
      account_id: session?.account_id as string,
      organization_id: session?.organization_id as string
    },
    [
      {
        content: query,
        author: 'human'
      }
    ]
  );

  for (let file of files) {
    if (file.size <= 0) {
      continue;
    }

    let source = file?.name;
    let parser = parsers[file?.type];
    let docs = await parser?.(file as any);

    try {
      let ingestResult = await ingestDocuments(
        docs?.map((doc, idx) => ({
          ...doc,
          metadata: {
            original: JSON.stringify(doc?.metadata),
            source: `${source} [Page ${idx + 1}]`
          }
        })),
        thread_id
      );
      console.log('ingest', ingestResult);
    } catch (err: any) {
      errors.push(err.message);

      return {
        data: null,
        errors,
        metadata: {
          action: 'ask',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  let task = await tasks.trigger<typeof askTask>('ask', {
    account: session?.account_id,
    organization: session?.organization_id,
    thread: thread?.id,
    query
  });

  return {
    data: {
      task
    },
    errors,
    metadata: {
      action: 'ask',
      timestamp: new Date().toISOString()
    }
  };
}

function uploadHandler(fileUpload: FileUpload) {
  return fileUpload;
}
