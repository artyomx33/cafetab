import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const RESTAURANT = 'green-vibes';

async function testPromotions() {
  console.log('🎭 Starting Playwright test for promotions...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Check pay page for Table 2 (VIBES-02 - occupied)
    console.log('📍 Step 1: Viewing checkout page for Table 2 (VIBES-02)...');
    await page.goto(`${BASE_URL}/${RESTAURANT}/table/VIBES-02/pay`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'screenshots/01-pay-page-before.png', fullPage: true });
    console.log('   ✅ Screenshot: 01-pay-page-before.png');

    // Check current state
    const hasNoTab = await page.locator('text=/No Active Tab/i').count() > 0;
    if (hasNoTab) {
      console.log('   ⚠️ No active tab found - will check again after creating promotion');
    } else {
      console.log('   ✅ Tab found!');
    }

    // Step 2: Create a promotion in admin
    console.log('\n📍 Step 2: Creating 10% off promotion...');
    await page.goto(`${BASE_URL}/${RESTAURANT}/admin/promotions`);
    await page.waitForLoadState('networkidle');

    // Click Add Promotion button
    await page.click('button:has-text("Add Promotion")');
    await page.waitForTimeout(1000);

    // Wait for modal to appear
    const modal = page.locator('.fixed.inset-0');
    await modal.waitFor({ state: 'visible' });

    await page.screenshot({ path: 'screenshots/02-promotion-form.png', fullPage: true });
    console.log('   ✅ Screenshot: 02-promotion-form.png');

    // Fill promotion form within the modal
    const formContainer = page.locator('[role="dialog"], .fixed.inset-0').first();

    // Fill name
    await formContainer.locator('input').first().fill('Test Happy Hour');
    console.log('   Filled: name = Test Happy Hour');

    // Fill description (optional)
    const descTextarea = formContainer.locator('textarea').first();
    if (await descTextarea.isVisible()) {
      await descTextarea.fill('10% off all items');
    }

    // Fill badge text
    const badgeInput = formContainer.locator('input').nth(1);
    if (await badgeInput.isVisible()) {
      await badgeInput.fill('10% OFF');
      console.log('   Filled: badge = 10% OFF');
    }

    // Click "Percentage Off" if not already selected
    const percentageOption = formContainer.locator('text=Percentage Off');
    if (await percentageOption.isVisible()) {
      await percentageOption.click();
      console.log('   Selected: Percentage Off');
    }

    await page.waitForTimeout(500);

    // Scroll down in the modal to find more fields
    await formContainer.locator('.overflow-y-auto, .space-y-6').first().evaluate(el => el.scrollTop = 500);
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'screenshots/03-promotion-form-scrolled.png', fullPage: true });
    console.log('   ✅ Screenshot: 03-promotion-form-scrolled.png');

    // Fill discount percentage
    const percentInput = formContainer.locator('input[type="number"]').first();
    if (await percentInput.isVisible()) {
      await percentInput.fill('10');
      console.log('   Filled: percentage = 10');
    }

    // Look for "Applies To" section and select "All Products"
    const allProductsOption = formContainer.locator('text=/All Products|Entire Order/i').first();
    if (await allProductsOption.isVisible()) {
      await allProductsOption.click();
      console.log('   Selected: All Products');
    }

    await page.waitForTimeout(500);

    // Scroll to bottom to find Create button
    await formContainer.locator('.overflow-y-auto, .space-y-6').first().evaluate(el => el.scrollTop = el.scrollHeight);
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'screenshots/04-promotion-form-bottom.png', fullPage: true });
    console.log('   ✅ Screenshot: 04-promotion-form-bottom.png');

    // Click Create/Save button inside the modal
    const createBtn = formContainer.locator('button:has-text("Create"), button:has-text("Save")').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      console.log('   Clicked: Create button');
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: 'screenshots/05-after-create.png', fullPage: true });
    console.log('   ✅ Screenshot: 05-after-create.png');

    // Step 3: Go back to pay page and check for discounts
    console.log('\n📍 Step 3: Checking pay page for discounts...');
    await page.goto(`${BASE_URL}/${RESTAURANT}/table/VIBES-02/pay`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'screenshots/06-pay-page-after.png', fullPage: true });
    console.log('   ✅ Screenshot: 06-pay-page-after.png');

    // Check for discount indicators
    const savedBadge = await page.locator('text=/You saved/i').count();
    const lineThrough = await page.locator('.line-through').count();
    const discountText = await page.locator('text=/-\\$/').count();
    const badgeVisible = await page.locator('text=/10% OFF|Happy Hour/i').count();

    console.log('\n📊 Discount Detection:');
    console.log(`   "You saved" badge: ${savedBadge > 0 ? '✅ Found' : '❌ Not found'}`);
    console.log(`   Crossed-out prices: ${lineThrough > 0 ? '✅ Found' : '❌ Not found'}`);
    console.log(`   Discount amounts: ${discountText > 0 ? '✅ Found' : '❌ Not found'}`);
    console.log(`   Promotion badge: ${badgeVisible > 0 ? '✅ Found' : '❌ Not found'}`);

    if (savedBadge > 0 || lineThrough > 0 || discountText > 0) {
      console.log('\n🎉 SUCCESS: Promotions are displaying on checkout!');
    } else {
      console.log('\n⚠️ No discounts visible - this might be expected if:');
      console.log('   - No items in tab');
      console.log('   - Promotion targets specific products/categories');
      console.log('   - Promotion not yet active');
    }

    console.log('\n✨ Test completed! Review screenshots/ folder.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'screenshots/error.png' }).catch(() => {});
  } finally {
    await browser.close();
  }
}

// Create screenshots directory
import { mkdirSync } from 'fs';
try { mkdirSync('screenshots', { recursive: true }); } catch {}

testPromotions();
