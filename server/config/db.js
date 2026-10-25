const mongoose = require('mongoose');
const { execSync } = require('child_process');

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap';

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`Connected to MongoDB (${mongoose.connection.name})`);
    return mongoose.connection;
  } catch (err) {
    // If querySrv fails on Windows (EBADRESP with c-ares on SRV lookups), resolve replica set hosts via nslookup
    if (uri.startsWith('mongodb+srv://') && (err.message.includes('querySrv') || err.message.includes('EBADRESP'))) {
      try {
        console.warn('SRV resolution issue detected in Node c-ares. Resolving MongoDB Atlas replica set seedlist...');
        const match = uri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)(\/[^?]*)?(\?.*)?$/);
        if (match) {
          const [, user, pass, domain, db = '/skillswap', qs = ''] = match;
          const out = execSync(`nslookup -type=SRV _mongodb._tcp.${domain} 8.8.8.8`, { encoding: 'utf8', timeout: 5000 });
          const hosts = [...out.matchAll(/svr hostname\s*=\s*([^\s\r\n]+)/gi)].map(m => `${m[1]}:27017`);
          
          if (hosts.length > 0) {
            const queryParams = new URLSearchParams(qs.replace(/^\?/, ''));
            if (!queryParams.has('ssl')) queryParams.set('ssl', 'true');
            if (!queryParams.has('authSource')) queryParams.set('authSource', 'admin');
            if (!queryParams.has('retryWrites')) queryParams.set('retryWrites', 'true');
            if (!queryParams.has('w')) queryParams.set('w', 'majority');

            const targetDb = db && db.length > 1 ? db : '/skillswap';
            const fallbackUri = `mongodb://${user}:${pass}@${hosts.join(',')}${targetDb}?${queryParams.toString()}`;

            await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 8000 });
            console.log(`Connected to MongoDB Atlas replica set (${mongoose.connection.name}) via resolved seedlist`);
            return mongoose.connection;
          }
        }
      } catch (fallbackErr) {
        console.error('Atlas fallback connection failed:', fallbackErr.message);
      }
    }
    throw err;
  }
}

module.exports = connectDB;
