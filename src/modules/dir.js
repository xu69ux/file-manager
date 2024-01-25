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
  const files = await fs.readdir(currentDirectory);
    const filesWithDetails = await Promise.all(files.map(async (file, index) => {
      const stats = await fs.stat(`${currentDirectory}/${file}`);
      return {
        name: file,
        type: stats.isDirectory() ? 'directory' : 'file',
      };
    }));
    console.log('\n');
    console.table(filesWithDetails);
    console.log('\n');

    rl.prompt();
    return currentDirectory;
}

async function cdCommand(pathToDirectory, currentDirectory, rl) {
  const newPath = path.resolve(currentDirectory, pathToDirectory);
  try {
    await fs.access(newPath);
    rl.setPrompt(`You are currently in ${newPath}\nEnter a command: `);
    rl.prompt();
    return newPath;
  } catch {
    console.log('Directory does not exist');
    return currentDirectory;
  }
}

function upCommand(currentDirectory, rl) {
  const newPath = path.resolve(currentDirectory, '..');
  rl.setPrompt(`You are currently in ${newPath}\nEnter a command: `);
  rl.prompt();
  return newPath;
}

export default handleDirCommand;