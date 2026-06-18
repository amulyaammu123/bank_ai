const DriverFactory = require('./utilities/driverFactory');

async function main() {
  console.log('Starting Appium session to dump dashboard UI source...');
  const driver = await DriverFactory.createDriver();
  try {
    // Wait for a few seconds to let app load
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if Try Offline Demo Mode is visible and click it
    const guestBtn = await driver.$('//*[@text="Try Offline Demo Mode" or contains(@text, "Offline Demo") or contains(@text, "Demo Mode")]');
    if (await guestBtn.isDisplayed().catch(() => false)) {
      console.log('Logging in as Offline Demo Guest...');
      await guestBtn.click();
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      console.log('Offline Demo button not found. Already logged in or on different screen.');
    }
    
    console.log('Dumping XML Page Source...');
    const source = await driver.getPageSource();
    console.log('\n=== UI SOURCE START ===\n' + source + '\n=== UI SOURCE END ===\n');
  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    console.log('Tearing down session...');
    await DriverFactory.quitDriver(driver);
  }
}

main().catch(console.error);
