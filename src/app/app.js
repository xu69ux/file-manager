import os from 'os';
import fs from 'fs/promises';
import readline from 'readline';
import path from 'path';

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
    const files = await fs.readdir(this.currentDirectory);
    const filesWithDetails = await Promise.all(files.map(async (file, index) => {
      const stats = await fs.stat(`${this.currentDirectory}/${file}`);
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
      await fs.access(newPath);
      this.currentDirectory = newPath;
      this.rl.setPrompt(`You are currently in ${this.currentDirectory}\nEnter a command: `);
    } catch {
      console.log('Directory does not exist');
    }
  }
}

export default App;
