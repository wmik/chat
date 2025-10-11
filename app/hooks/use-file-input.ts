import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';

type FileInputConfig = {
  id?: (file: File) => string;
};

export function useFileInput({ id }: FileInputConfig) {
  let fileInputRef = useRef<HTMLInputElement>(null);
  let [files, cacheFiles] = useState(new Map<string, File>());
  let [isDraggingOver, setIsDraggingOver] = useState(false);

  function addFile(file: File) {
    cacheFiles(prev => new Map(prev).set(id?.(file) ?? file.name, file));
    return files;
  }

  function deleteFile(file: File) {
    let result = false;

    cacheFiles(prev => {
      let next = new Map(prev);

      result = next.delete(id?.(file) ?? file?.name);

      return next;
    });

    return result;
  }

  function clearFiles() {
    cacheFiles(new Map());
  }

  function onFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    Array.from(event.target.files || []).forEach(file => {
      if (file) {
        addFile(file);
      }
    });
  }

  function onFileInputDragStart(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.setData('text/plain', event.currentTarget?.id);
  }

  function onFileInputDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingOver(false);
  }

  function onFileInputDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingOver(true);
  }

  function onFileInputDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();

    let files = event.dataTransfer.files;

    for (let i = 0; i < files.length; i++) {
      let file = files[i];

      addFile(file);
    }

    setIsDraggingOver(false);
  }

  return {
    isDraggingOver,
    onFileInputChange,
    onFileInputDragStart,
    onFileInputDragLeave,
    onFileInputDragOver,
    onFileInputDrop,
    fileInputRef,
    addFile,
    deleteFile,
    files: {
      get(key: any) {
        return files.get(key);
      },
      set(file: File) {
        void addFile(file);
        return this;
      },
      delete(file: File) {
        return deleteFile(file);
      },
      clear() {
        void clearFiles();
      },
      values() {
        return files.values();
      },
      keys() {
        return files.keys();
      },
      has(key: any) {
        return files.has(key);
      },
      entries() {
        return files.entries();
      }
    }
  };
}
