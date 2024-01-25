import fs from 'fs';
import zlib from 'zlib';
import { pipeline } from 'stream';
import { promisify } from 'util';

async function handleZipCommand(command, args, rl) {
  switch (command) {
    case 'compress':
      await compressFile(args[0], args[1]);
      rl.prompt();
      break;
    case 'decompress':
      await decompressFile(args[0], args[1]);
      rl.prompt();
      break;
  }
}

async function compressFile(pathToSourceFile, pathToDestinationFile) {
  const pipelineAsync = promisify(pipeline);
  const gzip = zlib.createGzip();
  const source = fs.createReadStream(pathToSourceFile);
  const destination = fs.createWriteStream(pathToDestinationFile);
  
  await pipelineAsync(source, gzip, destination);
  console.log('File compressed successfully.');
}

async function decompressFile(pathToSourceFile, pathToDestinationFile) {
  const pipelineAsync = promisify(pipeline);
  const gunzip = zlib.createGunzip(); 
  const source = fs.createReadStream(pathToSourceFile);
  const destination = fs.createWriteStream(pathToDestinationFile);

  await pipelineAsync(source, gunzip, destination);
  console.log('File decompressed successfully.');
}

export default handleZipCommand;