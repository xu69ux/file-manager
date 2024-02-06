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

async function handleFSCommand(command, args) {
  const commandFunc = commands[command];
  if (!commandFunc) {
    console.log(`Unknown command: ${command}`);
    return;
  }
  return commandFunc(...args);
};

async function handleENOENTError(error) {
  if (error.code === 'ENOENT') {
    console.error('File or directory not found');
  } else {
    throw error;
  }
}

async function catCommand(pathToFile) {
  try {
    if (!fs.lstatSync(pathToFile).isFile()) {
      console.error('Path provided is not a file');
      return;
    }
    await fs.promises.access(pathToFile);
    const readStream = fs.createReadStream(pathToFile);

    return new Promise((resolve, reject) => {
      readStream.on('data', (chunk) => {
        console.log(chunk.toString());
      });

      readStream.on('error', async (error) => {
        await handleENOENTError(error);
        reject(error);
      });

      readStream.on('end', () => {
        resolve();
      });
    });
  } catch (error) {
    await handleENOENTError(error);
  }
}

async function addCommand(fileName) {
  try {
    const filePath = path.join(process.cwd(), fileName);
    await fs.promises.writeFile(filePath, '');
    console.log(`File ${fileName} created successfully at ${filePath}`);
  } catch (error) {
    await handleENOENTError(error);
  }
}

async function rnCommand(pathToFile, newFileName) {
  try {
    await fs.promises.access(pathToFile);
    await fs.promises.rename(pathToFile, newFileName);
    console.log(`File renamed successfully to ${newFileName}`);
  } catch (error) {
    await handleENOENTError(error);
  }
}

async function cpCommand(pathToSourceFile, pathToDestinationFolder) {
  try {
    await fs.promises.access(pathToSourceFile);
    const destinationPath = path.join(pathToDestinationFolder, path.basename(pathToSourceFile));
  
    const readStream = fs.createReadStream(pathToSourceFile);
    const writeStream = fs.createWriteStream(destinationPath);

    return new Promise((resolve, reject) => {
      readStream.pipe(writeStream);

      readStream.on('error', async (error) => {
        await handleENOENTError(error);
        reject(error);
      });

      writeStream.on('finish', () => {
        console.log(`File copied successfully to ${destinationPath}`);
        resolve();
      });
    });
  } catch (error) {
    await handleENOENTError(error);
  }
}

async function mvCommand(pathToFile, pathToNewDirectory) {
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
        } catch (error) {
          reject(error);
        }
      });

      writeStream.on('error', reject);
      readStream.on('error', reject);
    });
  } catch (error) {
    await handleENOENTError(error);
  }
}

async function rmCommand(pathToFile) {
  try {
    await fs.promises.unlink(pathToFile);
    console.log('File deleted successfully.');
  } catch (error) {
    await handleENOENTError(error);
  }
}

export default handleFSCommand;
