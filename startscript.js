const exec = require('child_process').exec;
const start = exec('npm start', { windowsHide: true });

start.stdout.pipe(process.stdout);