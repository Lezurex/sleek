import { app, dialog, OpenDialogReturnValue, SaveDialogReturnValue } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { addFile, addDoneFile } from './File';

const dialogFilters = [
  {
    name: 'Text files',
    extensions: ['txt']
  },
  {
    name: 'All files',
    extensions: ['*']
  }
]

async function openFile(setDoneFile: boolean): Promise<void> {
  const result: OpenDialogReturnValue = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: dialogFilters,
    securityScopedBookmarks: true,
  });
  if(!result.canceled && result.filePaths.length > 0) {
    const filePath: string = result.filePaths[0];
    const bookmark: string | null = result.bookmarks?.[0] || null;

    if(setDoneFile) {
      addDoneFile(filePath, bookmark);
    } else {
      addFile(filePath, bookmark);
    }
  }
  return;
}

async function createFile(setDoneFile: boolean): Promise<void> {
  const defaultFileName = setDoneFile ? 'done.txt' : 'todo.txt';

  const result: SaveDialogReturnValue = await dialog.showSaveDialog({
    defaultPath: path.join(app.getPath('documents'), defaultFileName),
    filters: dialogFilters,
    securityScopedBookmarks: true,
  });

  if(!result.canceled && result.filePath) {
    const filePath: string = result.filePath;
    const bookmark: string | null = result.bookmark || null;

    if(process.mas && bookmark) {
      const stopAccessingSecurityScopedResource = app.startAccessingSecurityScopedResource(bookmark);  
      await fs.writeFile(filePath, '');
      stopAccessingSecurityScopedResource()
    } else {
      await fs.writeFile(filePath, '');
    }

    if(setDoneFile) {
      addDoneFile(filePath, bookmark);
    } else {
      addFile(filePath, bookmark);
    }
  }
  return;
}

export {
  createFile,
  openFile
};
