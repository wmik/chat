import { Form } from 'react-router';
import {
  CameraIcon,
  LinkIcon,
  PlusIcon,
  SendIcon,
  UploadIcon
} from 'lucide-react';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

type ChatFormProps = {
  name: string;
  className?: string;
};

export function ChatForm({ name, className }: ChatFormProps) {
  let fileInputRef = useRef<HTMLInputElement>(null);
  let [screenshot, setScreenshot] = useState('');
  let [isCapturing, setIsCapturing] = useState(false);
  let streamRef = useRef<MediaStream>(null);

  async function captureScreenshot() {
    setIsCapturing(true);

    try {
      // Request screen capture using navigator.mediaDevices
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser'
        },
        audio: false
      });

      streamRef.current = stream;

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });

      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      setScreenshot(dataUrl);

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
      streamRef.current = null;

      setIsCapturing(false);
      toast('Successfully captured screenshot.');
    } catch (err: any) {
      console.error('Screenshot failed:', err);
      toast.error(
        err?.message || 'Failed to capture screenshot. User may have cancelled.'
      );
      setIsCapturing(false);

      // Clean up stream if it exists
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }

  return (
    <Form
      replace
      method="post"
      encType="multipart/form-data"
      className={cn(
        'max-w-3xl p-3 flex-col border-input focus-within:border-ring focus-within:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none focus-within:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className
      )}
    >
      <input
        multiple
        name="files"
        type="file"
        className="hidden"
        ref={fileInputRef}
      />
      <Textarea
        name={name}
        placeholder="Start typing..."
        className="border-0 shadow-none resize-none focus-visible:ring-0"
      />
      <div className="flex">
        <Popover>
          <PopoverTrigger asChild>
            <Button className="w-fit group" variant="outline">
              <PlusIcon className="group-active:rotate-45 focus:rotate-45 transition-transform" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="p-2 border border-ring"
            side="top"
            align="start"
          >
            <div className="grid gap-2">
              <Button
                type="button"
                variant="ghost"
                className="text-left items-center justify-start"
              >
                <LinkIcon />
                <span>Import from link/url</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-left items-center justify-start"
                onClick={() => captureScreenshot()}
              >
                <CameraIcon />
                <span>Take a screenshot</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-left items-center justify-start"
                onClick={() => fileInputRef?.current?.click()}
              >
                <UploadIcon />
                <span>Upload a file</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Button className="w-fit ml-auto" name="_action" value="ask">
          <SendIcon />
        </Button>
      </div>
    </Form>
  );
}
