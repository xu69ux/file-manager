import os from 'os';
import fs from 'fs';
import fsPromises from 'fs/promises';
import readline from 'readline';
import path from 'path';
import zlib from 'zlib';
import { pipeline } from 'stream';
import { promisify } from 'util';

import handleOSCommand from './modules/os.js';
import handleFSCommand from './modules/fs.js';
import handleHashCommand from './modules/hash.js';



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
        case 'os':
          handleOSCommand(args);
          this.rl.prompt();
          break;
        case 'cat':
          await handleFSCommand('cat', args, this.rl);
          break;
        case 'add':
          await handleFSCommand('add', args, this.rl);
          break;
        case 'rn':
          await handleFSCommand('rn', args, this.rl);
          break;
        case 'cp':
          await handleFSCommand('cp', args, this.rl);
          break;
        case 'mv':
          await handleFSCommand('mv', args, this.rl);
          break;
        case 'rm':
          await handleFSCommand('rm', args, this.rl);
          break;
        case 'hash':
          await handleHashCommand(args, this.rl);
          break;  

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
        
        case 'compress':
          await this.compressFile(args[0], args[1]);
          this.rl.prompt();

          break;
        
        case 'decompress':
          await this.decompressFile(args[0], args[1]);
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

}

export default App;
