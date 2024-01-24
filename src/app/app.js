import os from 'os';
import fs from 'fs/promises';
import readline from 'readline';
import path from 'path';
import crypto from 'crypto';


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
          await this.calculateHash(args[0]);
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

  async calculateHash(pathToFile, hashType = 'sha256') {
    const hash = crypto.createHash(hashType);
    const data = await fs.readFile(pathToFile);
    
    hash.update(data);
    const result = hash.digest('hex');
    console.log(result);
  }
}

export default App;
