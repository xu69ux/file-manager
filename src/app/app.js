import os from 'os';
import fs, { access } from 'fs';
import fsPromises from 'fs/promises';
import readline from 'readline';
import path from 'path';
import crypto from 'crypto';
import zlib from 'zlib';
import { pipeline } from 'stream';
import { promisify } from 'util';


class App {
  constructor(username) {
    this.username = username;
    this.currentDirectory = os.homedir();

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.rl.setPrompt(`You are currently in ${this.currentDirectory}\nEnter a command: `);
  }

  start() {
    console.log(`Welcome to the File Manager, ${this.username}!\n`);
    this.rl.prompt();

    this.rl.on('line', async (input) => {
      const [command, ...args] = input.trim().split(' ');

      switch (command) {
        case 'up':
          this.goToParentDirectory();
          this.rl.prompt();

          break;

        case 'cd':
          await this.changeDirectory(args[0]);
          this.rl.prompt();

          break;

        case 'ls':
          await this.listFiles();
          this.rl.prompt();

          break;

        case 'os':
          const osCommand = args[0];
          switch (osCommand) {
            case '--EOL':
              console.log(os.EOL);
              this.rl.prompt();

              break;
            case '--cpus':
              const cpus = os.cpus();
              console.log(`Total CPUs: ${cpus.length}`);
              cpus.forEach((cpu, index) => {
                console.log(`CPU ${index + 1}: ${cpu.model}, ${cpu.speed / 1000} GHz`);
              });
               this.rl.prompt();

              break;
            case '--homedir':
              console.log(os.homedir());
              this.rl.prompt();

              break;
            case '--username':
              console.log(os.userInfo().username);
              this.rl.prompt();

              break;
            case '--architecture':
              console.log(os.arch());
              this.rl.prompt();

              break;
            default:
              console.log('Invalid OS command. Try again.');
              this.rl.prompt();
          }
          break;  
        
        case 'hash':
          await this.calculateHash(args[0], args[1]);
          this.rl.prompt();

          break;
        
        case 'compress':
          await this.compressFile(args[0], args[1]);
          this.rl.prompt();

          break;
        
        case 'decompress':
          await this.decompressFile(args[0], args[1]);
          this.rl.prompt();

          break;
        
        case 'rm':
          await this.deleteFile(args[0]);
          this.rl.prompt();

          break;
        
        case 'cp':
          await this.copyFile(args[0], args[1]);
          this.rl.prompt();
          
          break;
        case 'cat':
          await this.readFile(args[0]);
          this.rl.prompt();

          break;

        default:
          console.log('Invalid input. Try again.');
          this.rl.prompt();
      }

    }).on('close', () => {
      console.log(`Thank you for using File Manager, ${this.username}, goodbye!`);
      process.exit(0);
    });
  }
  
  goToParentDirectory() {
    const parentDirectory = path.dirname(this.currentDirectory);
    if (parentDirectory !== this.currentDirectory) {
      this.currentDirectory = parentDirectory;
      this.rl.setPrompt(`You are currently in ${this.currentDirectory}\nEnter a command: `);
    }
  }

  async listFiles() {
    const files = await fsPromises.readdir(this.currentDirectory);
    const filesWithDetails = await Promise.all(files.map(async (file, index) => {
      const stats = await fsPromises.stat(`${this.currentDirectory}/${file}`);
      return {
        name: file,
        type: stats.isDirectory() ? 'directory' : 'file',
        size: stats.size > 1000 ? `${(stats.size / 1000).toFixed(2)} GB` : `${stats.size} MB`,

      };
    }));
    console.log('\n');
    console.table(filesWithDetails);
    console.log('\n');
  }

  async changeDirectory(pathToDirectory) {
    const newPath = path.resolve(this.currentDirectory, pathToDirectory);
    try {
      await fsPromises.access(newPath);
      this.currentDirectory = newPath;
      this.rl.setPrompt(`You are currently in ${this.currentDirectory}\nEnter a command: `);
    } catch {
      console.log('Directory does not exist');
    }
  }

  async calculateHash(pathToFile, hashType = 'sha256') {
    const hash = crypto.createHash(hashType);
    const data = await fsPromises.readFile(pathToFile);
    
    hash.update(data);
    const result = hash.digest('hex');
    console.log(result);
  }

  async compressFile(pathToSourceFile, pathToDestinationFile) {
    const pipelineAsync = promisify(pipeline);
    const gzip = zlib.createGzip();
    const source = fs.createReadStream(pathToSourceFile);
    const destination = fs.createWriteStream(pathToDestinationFile);
    
    await pipelineAsync(source, gzip, destination);
    console.log('File compressed successfully.');
  }

  async decompressFile(pathToSourceFile, pathToDestinationFile) {
    const pipelineAsync = promisify(pipeline);
    const gunzip = zlib.createGunzip(); 
    const source = fs.createReadStream(pathToSourceFile);
    const destination = fs.createWriteStream(pathToDestinationFile);

    await pipelineAsync(source, gunzip, destination);
    console.log('File decompressed successfully.');
  }

  async deleteFile(pathToFile) {
    try {
      await fsPromises.unlink(pathToFile);
      console.log('File deleted successfully.');
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error('FS operation failed');
        } else {
            throw err;
        }
    }
  }

  async copyFile(pathToSourceFile, pathToDestinationFile) {
    try {
      await fsPromises.access(pathToDestinationFile);
      throw new Error('FS operation failed');
    } catch (err) {
        if (err.code === 'ENOENT') {
            await fsPromises.mkdir(pathToDestinationFile);
            const files = await fsPromises.readdir(pathToSourceFile);
            await Promise.all(files.map(async file => {
                const pathToSource = path.join(pathToSourceFile, file);
                const pathToTarget = path.join(pathToDestinationFile, file);
                try {
                  await fsPromises.copyFile(pathToSource, pathToTarget);
                  console.log(`File ${file} copied successfully.`);
                } catch (err) {
                    if (err.code !== 'ENOTSUP') {
                        throw err;
                    }
                    console.log(`Skipping file ${file} due to unsupported operation.`);
                }
            }));
        } else {
            throw err;
        }
    }
  }

  async readFile(pathToFile) {
    try {
      const data = await fsPromises.readFile(pathToFile, 'utf-8');
      console.log(data);
  } catch (err) {
      if (err.code === 'ENOENT') {
          throw new Error('FS operation failed');
      } else {
          throw err;
      }
  }
  }
}

export default App;
