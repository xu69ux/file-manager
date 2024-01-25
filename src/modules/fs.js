import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

async function handleFSCommand(command, args, rl) {
  switch (command) {
    case 'cat':
      return await catCommand(args[0], rl);
    case 'add':
      return await addCommand(args[0], args[1], rl);
    case 'rn':
      return await rnCommand(args[0], args[1], rl);
    case 'cp':
      return await cpCommand(args[0], args[1], rl);
    case 'mv':
      return await mvCommand(args[0], args[1], rl);
    case 'rm':
      return await rmCommand(args[0], rl);
    default:
      throw new Error(`Unknown command: ${command}`);
  }
};

async function catCommand(pathToFile, rl) {
  const readStream = fs.createReadStream(pathToFile, 'utf-8');
  readStream.on('data', chunk => {
    console.log(chunk);
  });
  readStream.on('end', () => {
    rl.prompt();
  });
  readStream.on('error', err => {
    if (err.code === 'ENOENT') {
      throw new Error('FS operation failed');
    } else {
      throw err;
    }
  });
}

async function addCommand(pathToDirectory, fileName, rl) {
  const filePath = `${pathToDirectory}/${fileName}`;
  await fsPromises.writeFile(filePath, '');
  console.log(`File ${fileName} created successfully in ${pathToDirectory}`);
  rl.prompt();
}

async function rnCommand(pathToOldFile, newFileName, rl) {
  const parentDirectory = path.dirname(pathToOldFile);
  const pathToNewFile = path.join(parentDirectory, newFileName);

  try {
    await fsPromises.access(pathToNewFile);
    throw new Error('FS operation failed');
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

  readStream.on('error', (err) => {
    console.error(`Error while reading file: ${err}`);
  });

  writeStream.on('error', (err) => {
    console.error(`Error while writing file: ${err}`);
  });

  writeStream.on('close', () => {
    console.log(`File copied successfully to ${destinationPath}`);
    rl.prompt();
  });

  readStream.pipe(writeStream);
}

async function mvCommand(pathToFile, pathToNewDirectory, rl) {
  const fileName = path.basename(pathToFile);
  const newPath = path.join(pathToNewDirectory, fileName);

  const readStream = fs.createReadStream(pathToFile);
  const writeStream = fs.createWriteStream(newPath);

  readStream.pipe(writeStream);

  readStream.on('end', async () => {
    await fs.promises.unlink(pathToFile);
    console.log(`File moved successfully to ${newPath}`);
    rl.prompt();
  });

  readStream.on('error', (err) => {
    console.error(`Error while reading file: ${err}`);
  });

  writeStream.on('error', (err) => {
    console.error(`Error while writing file: ${err}`);
  });
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
