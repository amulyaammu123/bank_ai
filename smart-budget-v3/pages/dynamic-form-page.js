const BasePage = require('./base-page');
const logger = require('../utilities/logger');

class DynamicFormPage extends BasePage {
  constructor(driver, formName, formConfig) {
    super(driver);
    this.formName = formName;
    this.formConfig = formConfig;
    this.formSelector = formConfig.formSelector;
    this.submitBtnSelector = formConfig.submitButtonSelector;
  }

  // Get field metadata by name
  getFieldConfig(fieldName) {
    const field = this.formConfig.fields.find(f => f.name === fieldName);
    if (!field) {
      throw new Error(`Field '${fieldName}' not found in configuration for form '${this.formName}'`);
    }
    return field;
  }

  // Input data into a specific field based on its type
  async fillField(fieldName, value) {
    const field = this.getFieldConfig(fieldName);
    logger.info(`Form '${this.formName}' - Filling field '${fieldName}' (type: ${field.type}) with: ${value}`);

    if (value === null || value === undefined) {
      // Clear field
      await this.clearField(fieldName);
      return;
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'password':
      case 'date':
      case 'number':
        await this.type(field.selector, value.toString());
        break;

      case 'select':
        await this.selectOptionByText(field.selector, value.toString());
        break;

      case 'checkbox':
        const isSelected = await this.isSelected(field.selector);
        if ((value && !isSelected) || (!value && isSelected)) {
          await this.click(field.selector);
        }
        break;

      default:
        throw new Error(`Unsupported field type: ${field.type}`);
    }
  }

  // Clear input field
  async clearField(fieldName) {
    const field = this.getFieldConfig(fieldName);
    logger.info(`Form '${this.formName}' - Clearing field '${fieldName}'`);
    if (field.type === 'checkbox') {
      const isSelected = await this.isSelected(field.selector);
      if (isSelected) {
        await this.click(field.selector);
      }
    } else if (field.type === 'select') {
      // For selects, click the first option if empty option is available or ignore
      // Simply skip or reset
    } else {
      const element = await this.findElement(field.selector);
      await element.clear();
      // Backspace simulation for inputs that React state holds onto
      await element.sendKeys('\uE003'); // Backspace
    }
  }

  // Fill entire form using object key-value pairs
  async fillForm(data) {
    for (const key of Object.keys(data)) {
      await this.fillField(key, data[key]);
    }
  }

  // Click submit button
  async submit() {
    logger.info(`Form '${this.formName}' - Submitting form`);
    await this.click(this.submitBtnSelector);
  }

  // Dynamic Error Locator
  getErrorSelector(fieldName) {
    return `#${fieldName}-error`;
  }

  // Get field specific validation error
  async getFieldError(fieldName) {
    const errorSel = this.getErrorSelector(fieldName);
    const isVisible = await this.isDisplayed(errorSel, 1500);
    if (isVisible) {
      return await this.getText(errorSel);
    }
    return '';
  }

  // Check if error is displayed for a field
  async isFieldErrorVisible(fieldName) {
    const errorSel = this.getErrorSelector(fieldName);
    return await this.isDisplayed(errorSel, 1500);
  }
}

module.exports = DynamicFormPage;
