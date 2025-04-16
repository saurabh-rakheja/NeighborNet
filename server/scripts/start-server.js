const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Determine the path to the server directory
const serverDir = path.resolve(__dirname, '..');
const indexPath = path.join(serverDir, 'src', 'index.js');

// Check if the index file exists
if (!fs.existsSync(indexPath)) {
  console.error(`Error: Could not find server index file at ${indexPath}`);
  process.exit(1);
}

// Log where we're starting the server
console.log(`Starting server from: ${serverDir}`);
console.log(`Using index file: ${indexPath}`);

// Start the server process
const serverProcess = spawn('node', [indexPath], {
  cwd: serverDir,
  stdio: 'inherit', // Inherit stdio, stderr, stdin from the parent process
  env: { ...process.env, NODE_ENV: 'development' }
});

// Handle server process events
serverProcess.on('error', (err) => {
  console.error('Failed to start server process:', err);
});

serverProcess.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(`Server process exited with code ${code} and signal ${signal}`);
  } else {
    console.log('Server process exited normally');
  }
});

// Handle process termination to clean up the server process
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down server...');
  serverProcess.kill('SIGTERM');
});

console.log('Server startup script is running. Press Ctrl+C to stop the server.'); 