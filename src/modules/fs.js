import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

const commands = {
  cat: catCommand,
  add: addCommand,
  rn: rnCommand,
  cp: cpCommand,
  mv: mvCommand,
  rm: rmCommand
};

async function handleFSCommand(command, args, rl) {
  const commandFunc = commands[command];
  if (!commandFunc) {
    throw new Error(`Unknown command: ${command}`);
  }
  return commandFunc(...args, rl);
};

async function handleStreamError(stream, rl) {
  stream.on('error', err => {
    if (err.code === 'ENOENT') {
      throw new Error(`FS operation failed with error: ${err.code}`);
    } else {
      throw err;
    }
  });
  stream.on('end', () => {
    rl.prompt();
  });
}

async function catCommand(pathToFile, rl) {
  const readStream = fs.createReadStream(pathToFile, 'utf-8');
  readStream.on('readable', () => {
    let chunk;
    while (null !== (chunk = readStream.read())) {
      console.log(chunk);
    }
  });
  await handleStreamError(readStream, rl);
}

async function addCommand(pathToDirectory, fileName, rl) {
  const filePath = path.join(pathToDirectory, fileName);
  await fsPromises.writeFile(filePath, '');
  console.log(`File ${fileName} created successfully in ${pathToDirectory}`);
  rl.prompt();
}

async function rnCommand(pathToOldFile, newFileName, rl) {
  const parentDirectory = path.dirname(pathToOldFile);
  const pathToNewFile = path.join(parentDirectory, newFileName);

  try {
    await fsPromises.access(pathToNewFile);
    throw new Error('A file with the new name already exists');
  } catch (err) {
      if (err.code === 'ENOENT') {
          await fsPromises.rename(pathToOldFile, pathToNewFile);
          console.log('File renamed successfully.');
          rl.prompt();
      } else {
          throw err;
      }
  }
}

async function cpCommand(pathToSourceFile, pathToDestinationFolder, rl) {
  const destinationPath = path.join(pathToDestinationFolder, path.basename(pathToSourceFile));
  
  const readStream = fs.createReadStream(pathToSourceFile);
  const writeStream = fs.createWriteStream(destinationPath);

  await handleStreamError(readStream, rl);
  await handleStreamError(writeStream, rl);

  console.log(`File copied successfully to ${destinationPath}`);

  readStream.pipe(writeStream);
}

async function mvCommand(pathToFile, pathToNewDirectory, rl) {
  const fileName = path.basename(pathToFile);
  const newPath = path.join(pathToNewDirectory, fileName);

  const readStream = fs.createReadStream(pathToFile);
  const writeStream = fs.createWriteStream(newPath);

  readStream.pipe(writeStream);

  await handleStreamError(readStream, rl);
  await handleStreamError(writeStream, rl);

  await fs.promises.unlink(pathToFile);
  console.log(`File moved successfully to ${newPath}`);
}

async function rmCommand(pathToFile, rl) {
  try {
    await fsPromises.unlink(pathToFile);
    console.log('File deleted successfully.');
    rl.prompt();
  } catch (err) {
      if (err.code === 'ENOENT') {
          throw new Error('FS operation failed');
      } else {
          throw err;
      }
  }
}

export default handleFSCommand;
