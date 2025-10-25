const { io } = require('socket.io-client');
const url = process.env.URL || 'http://localhost:3001';
const path = process.env.PATHNAME || '/socket.io';
const s = io(url, { path, transports: ['websocket'] });
s.on('connect', () => { console.log('connected', s.id); process.exit(0); });
s.on('connect_error', (e) => { console.error('connect_error', e && e.message || e); process.exit(1); });
setTimeout(() => process.exit(2), 5000);
