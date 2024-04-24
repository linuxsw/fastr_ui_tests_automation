import fs from 'fs';
import path from 'path';

// Define the type for the configuration
interface Config {
    website: string;
    testCycleKey: string;
}

export function loadConfig(env: string): Config {
    const filename = `../test-config.${env}.json`;
    // Construct the file URL and then convert it to a file path
    const fileUrl = new URL(filename, import.meta.url);
    let configPath = fileUrl.pathname;

    // On Windows, strip the leading slash from the pathname to form a valid file path
    if (process.platform === 'win32') {
        configPath = configPath.replace(/^\/([A-Za-z]:\/)/, '$1');
    }

    if (!fs.existsSync(configPath)) {
        throw new Error(`Configuration file not found at ${configPath}`);
    }

    const configFile = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configFile);
    return config;
}

// Function to dynamically load the configuration based on the environment
/* export function loadConfig(env: string): Config {
    const filename = `../test-config.${env}.json`;
    const configPath = new URL(filename, import.meta.url).pathname;
    
    if (!fs.existsSync(configPath)) {
        throw new Error(`Configuration file for '${env}' environment does not exist.`);
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return config;
} */