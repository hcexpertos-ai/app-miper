import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const SQL = readFileSync('./supabase/observaciones-migration.sql', 'utf8');
const URL = 'https://supabase.com/dashboard/project/piumedxpvuyztykvhiam/sql/new';

async function run() {
  const ctx = await chromium.launchPersistentContext('/tmp/pw-mig-profile', {
    channel: 'chrome', headless: false,
    args: ['--no-sandbox', '--disable-translate', '--disable-extensions'],
    viewport: { width: 1400, height: 900 },
  });

  const page = ctx.pages()[0] ?? await ctx.newPage();
  console.log('Navegando a Supabase SQL editor...');
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  const currentUrl = page.url();
  console.log('URL actual:', currentUrl);

  if (currentUrl.includes('/sign-in') || currentUrl.includes('/login')) {
    console.log('❌ Sin sesión activa en el perfil');
    await page.screenshot({ path: '/tmp/mig-login.png' });
    await ctx.close(); return false;
  }

  // Esperar editor
  await Promise.race([
    page.waitForSelector('.cm-editor', { timeout: 30000 }),
    page.waitForSelector('.cm-content', { timeout: 30000 }),
  ]).catch(() => console.log('Editor no apareció en 30s, intentando igual...'));
  await page.waitForTimeout(2000);

  const editor = page.locator('.cm-content, .cm-editor').first();
  if (await editor.count() > 0) {
    await editor.click().catch(() => {});
    await page.waitForTimeout(300);
    await page.keyboard.press('Meta+A');
    await page.waitForTimeout(200);
    await page.keyboard.insertText(SQL);
    await page.waitForTimeout(800);
    console.log('SQL insertado');
  }

  // Run
  let ran = false;
  for (const txt of ['Run', 'Correr', 'Execute']) {
    const btn = page.locator(`button:has-text("${txt}")`).first();
    if (await btn.count() > 0 && await btn.isVisible()) {
      await btn.click(); ran = true; console.log(`Clic en "${txt}"`); break;
    }
  }
  if (!ran) { await page.keyboard.press('Meta+Enter'); console.log('Meta+Enter'); }

  await page.waitForTimeout(7000);
  await page.screenshot({ path: '/tmp/migration-result.png' });
  console.log('📸 /tmp/migration-result.png');
  await ctx.close();
  return true;
}

run().then(ok => { console.log(ok ? '✅ OK' : '❌ Falló'); process.exit(ok ? 0 : 1); })
     .catch(e => { console.error('💥', e.message); process.exit(1); });
