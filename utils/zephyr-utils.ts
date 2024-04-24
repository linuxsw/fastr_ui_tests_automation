// File: zephyr-utils.ts
// Define this function in a separate file for interacting with the Zephyr Scale API, 
// which includes the function for updating test results in Zephyr Scale.

import 'dotenv/config'; // Automatically loads environment variables from .env file
import fetch from 'node-fetch';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as FormData from 'form-data';
import { loadConfig } from '../utils/config-loader.js';
import { loadEnvironmentConfig } from '../utils/env-loader.js';

import { readCACert, generateHeaders, createHttpsAgent } from './https-utils'; // Adjust the path as necessary
const BASE_URL = process.env.ZEPHYR_REST_API_ENDPOINT; // Adjust with your actual Zephyr Scale base URL

const envConfig = loadEnvironmentConfig();
const environment = envConfig.environment;
const testConfig = loadConfig(environment);

// Format the current date as ISO string and adjust to match Zephyr's expected format
export const formatDate = (date: Date) => {
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const pad = (num: number) => (num < 10 ? '0' : '') + num;
    const hours = pad(Math.floor(Math.abs(offset) / 60));
    const minutes = pad(Math.abs(offset) % 60);

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${sign}${hours}${minutes}`;
};

export const updateZephyrScaleResult = async (
    projectKey: string,
    testCaseKey: string,
/*     testCycleKey: string | null,  // Optional test cycle key */
    status: 'Pass' | 'Fail',
    comment: string,
    executionTime: number, // in milliseconds
    actualStartDate: string,
    actualEndDate: string,
    caCertPath: string, // Path to the CA certificate
    environment: string // Environment to load the correct configuration
): Promise<void> => {
    // const config = loadConfig(environment);
    const caCert = await readCACert(caCertPath);
    const httpsAgent = new https.Agent({ ca: caCert });

    // Select authentication method based on environment variables
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': process.env.ZEPHYR_API_TOKEN ? `Bearer ${process.env.ZEPHYR_API_TOKEN}` : `Basic ${process.env.ZEPHYR_BASIC_AUTH}`
    };

      // Adjust the API URL based on whether a test cycle key is provided
    const testCycleKey = testConfig.testCycleKey;
    const apiUrl = testCycleKey === undefined || testCycleKey === ''
        ? `${BASE_URL}/testresult`
        : `${BASE_URL}/testrun/${testCycleKey}/testcase/${testCaseKey}/testresult`;

    const payload = {
        projectKey,
        testCaseKey,
        status,
        comment,
        executionTime,
        actualStartDate,
        actualEndDate,
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload),
            agent: httpsAgent,
        });

        if (!response.ok) {
            throw new Error(`Failed to update Zephyr Scale: ${await response.text()}`);
        }

        console.log(`Successfully updated Zephyr Scale result for ${testCaseKey} with status: ${status}`);
    } catch (error) {
        console.error('Error updating Zephyr Scale result:', error);
    }
};
// Function to attach a file to a test case (example method)
export const attachFileToTestCase = async (testCaseId: string, filePath: string, caCertPath: string, basicAuthCredentials?: { username: string; password: string }) => {
    const httpsAgent = await createHttpsAgent(caCertPath);
    const headers = generateHeaders(basicAuthCredentials);

    // For multipart/form-data, let 'form-data' handle Content-Type header
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    const formHeaders = formData.getHeaders();

    const response = await fetch(`${BASE_URL}/testcase/${testCaseId}/attachments`, {
        method: 'POST',
        headers: { ...headers, ...formHeaders },
        body: formData,
        agent: httpsAgent,
    });

    if (!response.ok) {
        throw new Error(`Failed to attach file to test case: ${await response.text()}`);
    }

    console.log(`File ${filePath} attached to test case ${testCaseId} successfully.`);
};

// Function to get test cycle information
export const getTestCycleInfo = async (cycleId: string, caCertPath: string, basicAuthCredentials?: { username: string; password: string }) => {
    const httpsAgent = await createHttpsAgent(caCertPath);
    const headers = generateHeaders(basicAuthCredentials);

    const response = await fetch(`${BASE_URL}/testrun/${cycleId}`, {
        method: 'GET',
        headers: headers,
        agent: httpsAgent,
    });

    if (!response.ok) {
        throw new Error(`Failed to get test cycle information: ${await response.text()}`);
    }

    return await response.json();
};

// Function to delete a test cycle
export const deleteTestCycle = async (cycleId: string, caCertPath: string, basicAuthCredentials?: { username: string; password: string }) => {
    const httpsAgent = await createHttpsAgent(caCertPath);
    const headers = generateHeaders(basicAuthCredentials);

    const response = await fetch(`${BASE_URL}/testrun/${cycleId}`, {
        method: 'DELETE',
        headers: headers,
        agent: httpsAgent,
    });

    if (!response.ok) {
        throw new Error(`Failed to delete test cycle: ${await response.text()}`);
    }

    console.log(`Test cycle ${cycleId} deleted successfully.`);
};

// Function to create a folder
export const createFolder = async (folderData: any, caCertPath: string, basicAuthCredentials?: { username: string; password: string }) => {
    const httpsAgent = await createHttpsAgent(caCertPath);
    const headers = generateHeaders(basicAuthCredentials);

    const response = await fetch(`${BASE_URL}/folder`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(folderData),
        agent: httpsAgent,
    });

    if (!response.ok) {
        throw new Error(`Failed to create folder: ${await response.text()}`);
    }

    return await response.json();
};