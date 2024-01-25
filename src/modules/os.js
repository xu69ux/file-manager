import os from 'os';

function handleOSCommand(args) {
  const osCommand = args[0];
  switch (osCommand) {
    case '--EOL':
      console.log(os.EOL);
      break;

    case '--cpus':
      const cpus = os.cpus();
      console.log(`Total CPUs: ${cpus.length}`);
      cpus.forEach((cpu, index) => {
        console.log(`CPU ${index + 1}: ${cpu.model}, ${cpu.speed / 1000} GHz`);
      });
      break;

    case '--homedir':
      console.log(os.homedir());
      break;

    case '--username':
      console.log(os.userInfo().username);
      break;

    case '--architecture':
      console.log(os.arch());
      break;
      
    default:
      console.log('Invalid OS command. Try again.');
  }
}

export default handleOSCommand;