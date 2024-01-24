import exp from 'constants';
import fs from 'fs/promises';
import readline from 'readline';

class App {
  constructor(username) {
    this.username = username;
    this.currentDirectory = process.cwd();

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
          // 'ls'
          break;

        default:
          console.log('Invalid input. Try again.');
      }

      this.rl.prompt();
    }).on('close', () => {
      console.log(`Thank you for using File Manager, ${this.username}, goodbye!`);
      process.exit(0);
    });

    this.listFiles();
  }

  async listFiles() {
    const files = await fs.readdir(this.currentDirectory);
    console.log(files);
  }
}

export default App;
