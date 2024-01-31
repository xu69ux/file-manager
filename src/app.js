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
      close: process.exit,
      prompt: `You are currently in ${this.currentDirectory}\nEnter a command: `,
    });

    this.commands = {
      'os': args => handleOSCommand(args, this.rl),
      'cat': args => handleFSCommand('cat', args, this.rl),
      'add': args => handleFSCommand('add', args, this.rl),
      'rn': args => handleFSCommand('rn', args, this.rl),
      'cp': args => handleFSCommand('cp', args, this.rl),
      'mv': args => handleFSCommand('mv', args, this.rl),
      'rm': args => handleFSCommand('rm', args, this.rl),
      'hash': args => handleHashCommand(args, this.rl),
      'compress': args => handleZipCommand('compress', args, this.rl),
      'decompress': args => handleZipCommand('decompress', args, this.rl),
      'ls': args => handleDirCommand('ls', args, this.currentDirectory, this.rl),
      'cd': args => handleDirCommand('cd', args, this.currentDirectory, this.rl),
      'up': args => handleDirCommand('up', args, this.currentDirectory, this.rl),
    };
  }

  start() {
    console.log(`⋆｡°✩ Welcome to the File Manager, ${this.username}! ₊˚⊹⋆\n`);
    this.rl.prompt();

    this.rl.on('line', async (input) => {
      const [command, ...args] = input.trim().split(' ');
      if (command === '.exit') {
        console.log(`⋆｡°✩ Thank you for using File Manager, ${this.username}, goodbye! ₊˚⊹⋆`);
        process.exit(0);
        return false;
      }
      try {
        if (this.commands[command]) {
          this.currentDirectory = await this.commands[command](args);
        } else {
          console.log('Invalid input. Try again.');
        }
      } catch (error) {
        console.error(`Error executing command: ${error.message}`);
      } finally {
        this.rl.prompt();
      }
    }).on('close', () => {
      console.log(`\n⋆｡°✩ Thank you for using File Manager, ${this.username}, goodbye! ₊˚⊹⋆`);
      process.exit(0);
    });
  }
}

export default App;
