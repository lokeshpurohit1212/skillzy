const path = require('path');
const puppeteer = require(path.join(__dirname, '..', 'server', 'node_modules', 'puppeteer-core'));
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

async function loginUser() {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dev.malhotra@example.com', password: 'SkillzyDemo@2026' })
  });
  return await res.json();
}

async function loginAdmin() {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@communityexchange.com', password: 'Admin@12345' })
  });
  return await res.json();
}

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const userData = await loginUser();
  const adminData = await loginAdmin();

  console.log('User login token acquired:', !!userData.token);
  console.log('Admin login token acquired:', !!adminData.token);

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  // Helper to capture a page
  async function capture(url, filename, options = {}) {
    const fullPath = path.join(OUTPUT_DIR, filename);
    console.log(`Capturing ${filename} from ${url}...`);
    try {
      if (options.asUser) {
        await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
        await page.evaluate((tok, usr) => {
          localStorage.setItem('token', tok);
          localStorage.setItem('user', JSON.stringify(usr));
        }, userData.token, userData.user);
      } else if (options.asAdmin) {
        await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
        await page.evaluate((tok, usr) => {
          localStorage.setItem('adminToken', tok);
          localStorage.setItem('adminUser', JSON.stringify(usr));
        }, adminData.token, adminData.user);
      }

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      // Short delay for client state hydration
      await new Promise(r => setTimeout(r, options.delay || 2500));
      await page.screenshot({ path: fullPath, fullPage: options.fullPage || false });
      console.log(`  ✓ Saved ${filename} (${fs.statSync(fullPath).size} bytes)`);
    } catch (err) {
      console.error(`  ✗ Error capturing ${filename}:`, err.message);
    }
  }

  // 1. Landing Page
  await capture('http://localhost:3000/', '01_landing_hero.png', { delay: 2000 });

  // 2. Explore & Browse Skills
  await capture('http://localhost:3000/browse', '02_browse_skills.png', { delay: 2500 });

  // 3. AI Matchmaker
  await capture('http://localhost:3000/matchmaker', '03_ai_matchmaker.png', { asUser: true, delay: 3000 });

  // 4. AI Copilot Roadmaps
  await capture('http://localhost:3000/copilot', '04_ai_copilot.png', { asUser: true, delay: 3000 });

  // 5. Classroom Sessions
  await capture('http://localhost:3000/sessions', '05_classroom_sessions.png', { asUser: true, delay: 2500 });

  // 6. Community Guilds
  await capture('http://localhost:3000/communities', '06_community_guilds.png', { delay: 2500 });

  // 7. Leaderboard & Gamification
  await capture('http://localhost:3000/leaderboard', '07_leaderboard_gamification.png', { delay: 2500 });

  // 8. User Profile & Portfolio
  await capture('http://localhost:3000/profile', '08_user_profile.png', { asUser: true, delay: 2500 });

  // 9. Premium Plans
  await capture('http://localhost:3000/premium', '09_premium_membership.png', { asUser: true, delay: 2500 });

  // 10. Admin KPI & Moderation Portal
  await capture('http://localhost:3000/admin', '10_admin_kpi_portal.png', { asAdmin: true, delay: 3000 });

  await browser.close();
  console.log('All screenshots completed successfully!');
}

run().catch(console.error);
