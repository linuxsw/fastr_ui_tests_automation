import fs from 'fs';
import path from 'path';

// Define the type for the environment configuration
interface EnvConfig {
    environment: string;
}

export function loadEnvironmentConfig(filePath: string = '../env-config.json'): EnvConfig {
    // For Windows, you might need to strip the leading slash if present
    const configPath = new URL(filePath, import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, '$1');

    console.log(filePath, configPath);
    if (!fs.existsSync(configPath)) {
        throw new Error(`Environment configuration file does not exist at ${configPath}`);
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return config;
}
// Function to load the environment configuration
/* export function loadEnvironmentConfig(filePath: string = '../env-config.json'): EnvConfig {
    const configPath = new URL(filePath, import.meta.url).pathname;

    console.log(filePath, configPath);
    if (!fs.existsSync(configPath)) {
        throw new Error(`Environment configuration file does not exist at ${configPath}`);
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as EnvConfig;
    return config;
} */