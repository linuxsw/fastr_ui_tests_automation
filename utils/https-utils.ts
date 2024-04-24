// File: https-utils.ts
// HTTPS utilities which includes the function for reading the CA certificate.
import * as fs from 'fs';
import * as https from 'https';

// Asynchronously reads a CA certificate file and returns its contents as a string
export const readCACert = async (path: string): Promise<string> => {
    try {
        return fs.promises.readFile(path, { encoding: 'utf-8' });
    } catch (error) {
        console.error(`Error reading CA certificate from ${path}:`, error);
        throw error; // Rethrow to handle it in the calling function
    }
};

// Utility function to generate headers
export const generateHeaders = (basicAuthCredentials?: { username: string; password: string }) => {
    let headers = {
        'Content-Type': 'application/json',
    };

    if (basicAuthCredentials) {
        const basicAuthToken = Buffer.from(`${basicAuthCredentials.username}:${basicAuthCredentials.password}`).toString('base64');
        headers['Authorization'] = `Basic ${basicAuthToken}`;
    } else {
        const apiToken = process.env.ZEPHYR_API_TOKEN;
        if (!apiToken) {
            throw new Error('ZEPHYR_API_TOKEN environment variable is not set for Bearer token authentication.');
        }
        headers['Authorization'] = `Bearer ${apiToken}`;
    }

    return headers;
};

// Utility function to create an HTTPS agent
export const createHttpsAgent = async (caCertPath: string) => {
    const caCert = await readCACert(caCertPath);
    return new https.Agent({ ca: caCert });
};