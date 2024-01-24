import os from 'os';
import fs from 'fs/promises';
import readline from 'readline';
import { stat } from 'fs';

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

    this.rl.on('line', (input) => {
      const [command, ...args] = input.trim().split(' ');

      switch (command) {
        case 'up':
          // 'up'
          break;

        case 'cd':
          // 'cd'
          break;

        case 'ls':
          this.listFiles().then(() => {
            this.rl.prompt();
          });
          break;

        default:
          console.log('Invalid input. Try again.');
      }

      this.rl.prompt();
    }).on('close', () => {
      console.log(`Thank you for using File Manager, ${this.username}, goodbye!`);
      process.exit(0);
    });
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
}

export default App;
