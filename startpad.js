const exec = require('child_process').exec;
const start = exec('npm run padlocal', { windowsHide: true });

start.stdout.pipe(process.stdout);