import os from 'os';

const commands = {
  '--EOL': () => os.EOL,
  '--cpus': () => {
    const cpus = os.cpus();
    return `Total CPUs: ${cpus.length}\n` + cpus.map((cpu, index) => `CPU ${index + 1}: ${cpu.model}, ${cpu.speed / 1000} GHz`).join('\n');
  },
  '--homedir': () => os.homedir(),
  '--username': () => os.userInfo().username,
  '--architecture': () => os.arch(),
};

function handleOSCommand(args) {
  const osCommand = args[0];
  const commandFunc = commands[osCommand];

  if (commandFunc) {
    console.log(commandFunc());
  } else {
    console.log('Invalid OS command. Try again.');
    console.log('Valid commands are:', Object.keys(commands).join(', '));
  }
}

export default handleOSCommand;