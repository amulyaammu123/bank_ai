const logger = require('./logger');

class Gestures {
  /**
   * Performs a single tap action on coordinate or element center
   */
  static async tap(driver, x, y) {
    logger.info(`Performing tap at coordinates: X=${x}, Y=${y}`);
    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: x, y: y },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
    await driver.releaseActions();
  }

  /**
   * Double tap action
   */
  static async doubleTap(driver, x, y) {
    logger.info(`Performing double tap at: X=${x}, Y=${y}`);
    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: x, y: y },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerUp', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
    await driver.releaseActions();
  }

  /**
   * Long press action
   */
  static async longPress(driver, x, y, durationMs = 1500) {
    logger.info(`Performing long press at: X=${x}, Y=${y} for ${durationMs}ms`);
    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: x, y: y },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: durationMs },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
    await driver.releaseActions();
  }

  /**
   * Generic Swipe action
   */
  static async swipe(driver, startX, startY, endX, endY, durationMs = 1000) {
    logger.info(`Swiping from (${startX}, ${startY}) to (${endX}, ${endY}) over ${durationMs}ms`);
    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: durationMs, x: endX, y: endY },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
    await driver.releaseActions();
  }

  /**
   * Swipe Left
   */
  static async swipeLeft(driver) {
    const size = await driver.getWindowSize();
    const startX = Math.round(size.width * 0.9);
    const endX = Math.round(size.width * 0.1);
    const y = Math.round(size.height * 0.5);
    await this.swipe(driver, startX, y, endX, y);
  }

  /**
   * Swipe Right
   */
  static async swipeRight(driver) {
    const size = await driver.getWindowSize();
    const startX = Math.round(size.width * 0.1);
    const endX = Math.round(size.width * 0.9);
    const y = Math.round(size.height * 0.5);
    await this.swipe(driver, startX, y, endX, y);
  }

  /**
   * Swipe Up
   */
  static async swipeUp(driver) {
    const size = await driver.getWindowSize();
    const x = Math.round(size.width * 0.5);
    const startY = Math.round(size.height * 0.8);
    const endY = Math.round(size.height * 0.2);
    await this.swipe(driver, x, startY, x, endY);
  }

  /**
   * Swipe Down
   */
  static async swipeDown(driver) {
    const size = await driver.getWindowSize();
    const x = Math.round(size.width * 0.5);
    const startY = Math.round(size.height * 0.2);
    const endY = Math.round(size.height * 0.8);
    await this.swipe(driver, x, startY, x, endY);
  }

  /**
   * Scroll Until element is visible in view
   */
  static async scrollUntilVisible(driver, targetSelector, maxSwipes = 10) {
    logger.info(`Scrolling down until selector: ${targetSelector} is visible`);
    let swipes = 0;
    
    while (swipes < maxSwipes) {
      try {
        const element = await driver.$(targetSelector);
        if (await element.isDisplayed()) {
          logger.info(`Element ${targetSelector} found and displayed after ${swipes} swipes`);
          return element;
        }
      } catch (err) {
        // Continue scrolling
      }
      
      await this.swipeUp(driver);
      swipes++;
    }
    throw new Error(`Element ${targetSelector} was not found after ${maxSwipes} swipes`);
  }

  /**
   * Drag and drop
   */
  static async dragAndDrop(driver, startX, startY, endX, endY) {
    logger.info(`Dragging from (${startX}, ${startY}) and dropping at (${endX}, ${endY})`);
    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 500 }, // Wait to pick up
          { type: 'pointerMove', duration: 1500, x: endX, y: endY },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
    await driver.releaseActions();
  }

  /**
   * Pinch action (zoom out)
   */
  static async pinch(driver, centerX, centerY, distance = 200) {
    logger.info(`Performing pinch at center: (${centerX}, ${centerY})`);
    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX - distance, y: centerY },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 1000, x: centerX - 10, y: centerY },
          { type: 'pointerUp', button: 0 }
        ]
      },
      {
        type: 'pointer',
        id: 'finger2',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX + distance, y: centerY },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 1000, x: centerX + 10, y: centerY },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
    await driver.releaseActions();
  }

  /**
   * Zoom action (zoom in)
   */
  static async zoom(driver, centerX, centerY, distance = 200) {
    logger.info(`Performing zoom at center: (${centerX}, ${centerY})`);
    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX - 10, y: centerY },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 1000, x: centerX - distance, y: centerY },
          { type: 'pointerUp', button: 0 }
        ]
      },
      {
        type: 'pointer',
        id: 'finger2',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX + 10, y: centerY },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 1000, x: centerX + distance, y: centerY },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
    await driver.releaseActions();
  }
}

module.exports = Gestures;
