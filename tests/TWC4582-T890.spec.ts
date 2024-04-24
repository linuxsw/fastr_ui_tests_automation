import { test, expect } from '@playwright/test';
import { updateZephyrScaleResult, formatDate} from '../utils/zephyr-utils.js';
import { getCellValue } from '../utils/html-utils.js';
import { loadConfig } from '../utils/config-loader.js';
import { loadEnvironmentConfig } from '../utils/env-loader.js';

const pathToCACert = './utils/IntelSHA256RootCA-Base64.crt'; // Replace with the actual path to the CA certificate.
var actualStartDate = formatDate(new Date());
var actualEndDate = actualStartDate; // Initially set to the same as start date

const envConfig = loadEnvironmentConfig();
const environment = envConfig.environment;
const testConfig = loadConfig(environment);

test.beforeEach(async ({}, testInfo) => {
  actualStartDate = formatDate(new Date());
/* 
  const envConfig = loadEnvironmentConfig();
  const environment = envConfig.environment;
  const testConfig = loadConfig(environment); */

  // Now you can use `testConfig` to get environment-specific settings like the website URL
  console.log(`Running tests in ${environment} environment on ${testConfig.website}`);
});

test.afterEach(async ({}, testInfo) => {
  const projectKey = testInfo.title.match(/(TWC[^-]+)/)?.[1];
  const testCaseKey = testInfo.title.match(/\((TWC\d+-T\d+)\)/)?.[1];
  console.log(testCaseKey);
  if (testCaseKey) {
      const status = testInfo.status === 'passed' ? 'Pass' : 'Fail';
      const comment = `Test ${status} with Playwright`;

      // Set actualEndDate to the current time after receiving the response
      actualEndDate = formatDate(new Date());

      // Calculate the execution time in milliseconds
      const startDate = new Date(actualStartDate);
      const endDate = new Date(actualEndDate);

      const executionTime = endDate.getTime() - startDate.getTime();

      // Call the function to update Zephyr Scale
      await updateZephyrScaleResult(
        projectKey, 
        testCaseKey, 
        status, 
        comment,
        executionTime,
        actualStartDate,
        actualEndDate,
        pathToCACert,
        process.env.TEST_ENV).catch(console.error);
  }
});

//test('Bulk_Import_FDS_Tool (TC329857)', async ({ page }) => {
test('Bulk_Import_FDS_Tool (TWC4582-T890)', { tag: ['@bat', '@bulk', ] }, async ({ page }) => {
  await page.goto(testConfig.website);
  await page.getByRole('button', {name: 'Bulk Imports' }).hover();
  await page.getByRole('link', { name: 'FDS Imports' }).click();
  //await page.locator('#FDSTools_AttachBtnID').press('Enter');
  await page.locator('#FDSTools_AttachBtnID').setInputFiles('./fixtures/TWC4582-T890/01. Import FDS Tool.csv');
  await page.locator('#FDSTools_UploadBtnID').click();

  // Assuming there's only one element with the class 'errorMsg' that contains the success message
  //const successMessage = await page.locator('.errorMsg').textContent();

  // When there are multiple elements with the class 'errorMsg', use nth-of-type to select the first one
  const successMessage = await page.textContent('.fdsBulkImportContainer .errorMsg:nth-of-type(1)');
  console.log(successMessage); // This should print "Upload Successful. "

  // Select the element and retrieve its text content
  const msgText = await page.textContent('.k-window-content');

  // Print the text content to the console
  console.log(msgText);

  // Regular expression to match patterns like "Adds=0"
  const regex: RegExp = /(\w+)=(-?\d+)/g;

  // Using matchAll to find all matches in the string and convert the iterator to an array
  const matches: Array<RegExpMatchArray> = Array.from(msgText.matchAll(regex));

  // Iterating over matches to log the results
  matches.forEach((match: RegExpMatchArray) => {
    console.log(`${match[1]} = ${match[2]}`);
  });

  // Expect the Tool data is added successfully in the Tool Menu
  await page.getByRole('button', { name: 'FDS ' }).hover();
  await page.getByRole('link', { name: 'Tools' }).click();
  await page.getByPlaceholder('Search by Tool <comma> Domain').click();
  await page.getByPlaceholder('Search by Tool <comma> Domain').fill('Tool-JTUAT 4055');
  
  // Insert a 0.5-second wait
  await page.waitForTimeout(500);

  await page.getByPlaceholder('Search by Tool <comma> Domain').press('Enter');

  // Retrieve the "Tool" value for the first row which we assume the first row is the newly added
  const toolValue = await getCellValue(page, 1, 'Tool');
  console.log('Added Tool Name: %s', toolValue); // Logs the value of the 'Tool' cell in the first row of the grid

  // Compare the retrieved value to the expected string and pass the test if they match
  //expect(toolValue).toBe('Tool-JTUAT 4055');

  // Check if the retrieved value contains the expected substring
  expect(toolValue).toContain('Tool-JTUAT 4055');
});
