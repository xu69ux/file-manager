import fs from 'fs/promises';
import path from 'path';

async function handleDirCommand(command, args, currentDirectory, rl) {
  switch (command) {
    case 'ls':
      return await lsCommand(currentDirectory, rl);
    case 'cd':
      return await cdCommand(args[0], currentDirectory, rl);
    case 'up':
      return upCommand(currentDirectory, rl);
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

async function lsCommand(currentDirectory, rl) {
  try {
    const files = await fs.readdir(currentDirectory);
    const filesWithDetails = await Promise.all(files.map(async (file) => {
      const stats = await fs.stat(path.join(currentDirectory, file));
      return {
        name: file,
        type: stats.isDirectory() ? 'directory' : 'file',
      };
    }));
    console.log('\n');
    console.table(filesWithDetails);
    console.log('\n');
  } catch (error) {
    console.error(`Error reading directory: ${error}`);
  }

  updatePrompt(rl, currentDirectory);
  return currentDirectory;
}

async function cdCommand(pathToDirectory, currentDirectory, rl) {
  const newPath = path.resolve(currentDirectory, pathToDirectory);
  try {
    await fs.access(newPath);
  } catch {
    console.log('Directory does not exist');
    return currentDirectory;
  }

  updatePrompt(rl, newPath);
  return newPath;
}

function upCommand(currentDirectory, rl) {
  const newPath = path.resolve(currentDirectory, '..');
  updatePrompt(rl, newPath);
  return newPath;
}

function updatePrompt(rl, path) {
  rl.setPrompt(`You are currently in ${path}\nEnter a command: `);
  rl.prompt();
}

export default handleDirCommand;