import os from 'os';
import readline from 'readline';

import handleOSCommand from './modules/os.js';
import handleFSCommand from './modules/fs.js';
import handleHashCommand from './modules/hash.js';
import handleZipCommand from './modules/zip.js';
import handleDirCommand from './modules/dir.js';


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
        case 'compress':
          await handleZipCommand('compress', args, this.rl);
          break;
        case 'decompress':
          await handleZipCommand('decompress', args, this.rl);
          break;      
          case 'ls':
          case 'cd':
          case 'up':
            this.currentDirectory = await handleDirCommand(command, args, this.currentDirectory, this.rl);
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
}

export default App;
