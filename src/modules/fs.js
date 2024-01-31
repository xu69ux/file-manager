import fs from 'fs';
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
    console.log(`Unknown command: ${command}`);
    return;
  }
  return commandFunc(...args, rl);
};

async function handleENOENTError(err, rl) {
  if (err.code === 'ENOENT') {
    console.error('File or directory not found');
    rl.prompt();
  } else {
    throw err;
  }
}

async function catCommand(pathToFile, rl) {
  try {
    await fs.promises.access(pathToFile);
    const readStream = fs.createReadStream(pathToFile);

    return new Promise((resolve, reject) => {
      readStream.on('data', (chunk) => {
        console.log(chunk.toString());
      });

      readStream.on('error', async (err) => {
        await handleENOENTError(err, rl);
        reject(err);
      });

      readStream.on('end', () => {
        resolve();
      });
    });
  } catch (err) {
    await handleENOENTError(err, rl);
  }
}

async function addCommand(pathToDirectory, fileName, rl) {
  try {
    const filePath = path.join(pathToDirectory, fileName);
    await fs.promises.writeFile(filePath, '');
    console.log(`File ${fileName} created successfully in ${pathToDirectory}`);
  } catch (err) {
    await handleENOENTError(err, rl);
  }
}

async function rnCommand(pathToFile, newPath, rl) {
  try {
    await fs.promises.access(pathToFile);
    await fs.promises.rename(pathToFile, newPath);
    console.log(`File renamed successfully to ${newPath}`);
  } catch (err) {
    await handleENOENTError(err, rl);
  }
}

async function cpCommand(pathToSourceFile, pathToDestinationFolder, rl) {
  try {
    await fs.promises.access(pathToSourceFile);
    const destinationPath = path.join(pathToDestinationFolder, path.basename(pathToSourceFile));
  
    const readStream = fs.createReadStream(pathToSourceFile);
    const writeStream = fs.createWriteStream(destinationPath);

    return new Promise((resolve, reject) => {
      readStream.pipe(writeStream);

      readStream.on('error', async (err) => {
        await handleENOENTError(err, rl);
        reject(err);
      });

      writeStream.on('finish', () => {
        console.log(`File copied successfully to ${destinationPath}`);
        resolve();
      });
    });
  } catch (err) {
    await handleENOENTError(err, rl);
  }
}

async function mvCommand(pathToFile, pathToNewDirectory, rl) {
  const fileName = path.basename(pathToFile);
  const newPath = path.join(pathToNewDirectory, fileName);

  try {
    const readStream = fs.createReadStream(pathToFile);
    const writeStream = fs.createWriteStream(newPath);

    return new Promise((resolve, reject) => {
      readStream.pipe(writeStream);

      writeStream.on('finish', async () => {
        try {
          await fs.promises.unlink(pathToFile);
          console.log(`File moved successfully to ${newPath}`);
          resolve();
        } catch (err) {
          reject(err);
        }
      });

      writeStream.on('error', reject);
      readStream.on('error', reject);
    });
  } catch (err) {
    await handleENOENTError(err, rl);
  }
}

async function rmCommand(pathToFile, rl) {
  try {
    await fs.promises.unlink(pathToFile);
    console.log('File deleted successfully.');
    rl.prompt();
  } catch (err) {
    await handleENOENTError(err, rl);
  }
}

export default handleFSCommand;
