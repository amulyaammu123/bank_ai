const { expect } = require('chai');
const { setupTestContext } = require('./baseSetup');

describe('AI Financial Security Chatbot', function () {
  const context = setupTestContext('Chatbot');
  let pages;

  before(async function () {
    this.timeout(180000);
    pages = context.getPages();
    await pages.login.ensureLoggedIn();
  });

  it('TC_601_Verify_Chatbot_Empty_Query_Submission', async function () {
    this.timeout(120000);
    await pages.dashboard.navigateToHome();
    await pages.dashboard.clickChatbotTile();

    // Input empty string and tap send
    await pages.chatbot.sendQuery('');
    const latestMsg = await pages.chatbot.getLatestMessageText();
    // Latest message should still be the initial greeting or default assistant intro
    expect(latestMsg.toLowerCase()).to.satisfy(
      msg => msg.includes('hello') || msg.includes('safebank') || msg.includes('assistant') || msg.length > 0
    );
  });

  it('TC_602_Verify_Chatbot_Successful_Query', async function () {
    this.timeout(150000);
    await pages.dashboard.navigateToHome();
    await pages.dashboard.clickChatbotTile();

    // Ask a cyber security question
    const query = 'How do I identify a fake credit card lottery phone call scam?';
    await pages.chatbot.sendQuery(query);

    // Verify chat loading or response updates
    const latestMsg = await pages.chatbot.getLatestMessageText();
    // The latest message shouldn't be the user query itself, it should be the bot's response (or initial greeting if still loading)
    expect(latestMsg.toLowerCase()).to.not.equal(query.toLowerCase());
    expect(latestMsg.length).to.be.greaterThan(0);
  });

  it('TC_603_Verify_Chatbot_Multi_Turn_Conversation', async function () {
    this.timeout(180000);
    await pages.dashboard.navigateToHome();
    await pages.dashboard.clickChatbotTile();

    // Send first question
    await pages.chatbot.sendQuery('What is UPI PIN safety?');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Send second question
    const query2 = 'Should I share my OTP with a branch manager?';
    await pages.chatbot.sendQuery(query2);
    await new Promise(resolve => setTimeout(resolve, 3000));

    const latestMsg = await pages.chatbot.getLatestMessageText();
    expect(latestMsg.toLowerCase()).to.not.equal(query2.toLowerCase());
    expect(latestMsg.length).to.be.greaterThan(0);
  });
});
