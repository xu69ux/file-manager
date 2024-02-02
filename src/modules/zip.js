import fs from 'fs';
import zlib from 'zlib';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);

async function handleZipCommand(command, args) {
  switch (command) {
    case 'compress':
      await compressFile(args[0], args[1]);
      break;
    case 'decompress':
      await decompressFile(args[0], args[1]);
      break;
  }
}

async function compressFile(pathToSourceFile, pathToDestinationFile) {
  if (!pathToSourceFile || !pathToDestinationFile) {
    console.log('Source and destination paths must be provided.');
    return;
  }
  if (!fs.existsSync(pathToSourceFile)) {
    console.log('Source file does not exist.');
    return;
  }

  const gzip = zlib.createGzip();
  const source = fs.createReadStream(pathToSourceFile);
  const destination = fs.createWriteStream(pathToDestinationFile);

  try {
    await pipelineAsync(source, gzip, destination);
    console.log('File compressed successfully.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

async function decompressFile(pathToSourceFile, pathToDestinationFile) {
  if (!pathToSourceFile || !pathToDestinationFile) {
    console.log('Source and destination paths must be provided.');
    return;
  }
  if (!fs.existsSync(pathToSourceFile)) {
    console.log('Source file does not exist.');
    return;
  }

  const gunzip = zlib.createGunzip(); 
  const source = fs.createReadStream(pathToSourceFile);
  const destination = fs.createWriteStream(pathToDestinationFile);

  try {
    await pipelineAsync(source, gunzip, destination);
    console.log('File decompressed successfully.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

export default handleZipCommand;