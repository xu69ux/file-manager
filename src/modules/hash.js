import crypto from 'crypto';
import fs from 'fs/promises';

async function handleHashCommand(args, rl) {
  const [pathToFile, hashType] = args;
  try {
    const result = await calculateHash(pathToFile, hashType);
    console.log(result);
  } catch (error) {
    console.error(`${error.message}`);
  }
};

async function calculateHash(pathToFile, hashType = 'sha256') {
  try {
    const hash = crypto.createHash(hashType);
    const data = await fs.readFile(pathToFile);
    hash.update(data);
    return hash.digest('hex');
  } catch (error) {
    throw new Error(`Failed to calculate hash: ${error.message}`);
  }
}

export default handleHashCommand;

