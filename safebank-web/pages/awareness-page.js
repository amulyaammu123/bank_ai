const { By } = require('selenium-webdriver');
const BasePage = require('./base-page');

class AwarenessPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Locators
    this.searchInput = By.id('awareness-search-input');
    this.videoPlayBtn = By.id('video-play-btn');
    this.videoState = By.id('video-state');
    this.bookmarkBadge = By.id('bookmark-badge');
  }

  async searchTopic(topic) {
    await this.writeInput(this.searchInput, topic);
  }

  async playVideo() {
    await this.click(this.videoPlayBtn);
  }

  async bookmarkArticle(index) {
    const btnLocator = By.id(`bookmark-btn-${index}`);
    const el = await this.findElement(btnLocator);
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", el);
    await this.driver.sleep(500);
    await this.click(btnLocator);
  }

  async getBookmarkedText() {
    const el = await this.findElement(this.bookmarkBadge);
    return await el.getText();
  }
}

module.exports = AwarenessPage;
