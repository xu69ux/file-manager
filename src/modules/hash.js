import crypto from 'crypto';
import fs from 'fs/promises';

async function handleHashCommand(args, rl) {
  const [pathToFile, hashType] = args;
  await calculateHash(pathToFile, hashType);
  rl.prompt();
};

async function calculateHash(pathToFile, hashType = 'sha256') {
  const hash = crypto.createHash(hashType);
  const data = await fs.readFile(pathToFile);
  
  hash.update(data);
  const result = hash.digest('hex');
  console.log(result);
}

export default handleHashCommand;

