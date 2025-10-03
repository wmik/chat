import type { ActionFunctionArgs } from 'react-router';
import { type FileUpload, parseFormData } from '@remix-run/form-data-parser';
import { MemoryFileStorage } from '@remix-run/file-storage/memory';
import { tasks } from '@trigger.dev/sdk';
import { askTask } from '~/trigger/ask';
import { parsers } from '~/llm.server';

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
  let task = await tasks.trigger<typeof askTask>('ask', {
    thread: params?.id,
    query: formData.get('query')?.toString() as string
  });
  let file = files?.slice()?.pop();

  if (file) {
    console.log(file?.name, file.type);
    console.log(await parsers[file?.type]?.(files?.slice()?.pop() as any));
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
