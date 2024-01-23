import { createInterface } from 'readline/promises';

const usernameArg = process.argv.find(arg => arg.startsWith('--username='));
if (!usernameArg) {
  console.log('Please provide a username with --username=your_username');
  process.exit(1);
}
const username = usernameArg.split('=')[1];

console.log(`Welcome to the File Manager, ${username}!`);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Press any key to exit...');
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', () => {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  console.log(`Thank you for using File Manager, ${username}, goodbye!`);
  process.exit();
});