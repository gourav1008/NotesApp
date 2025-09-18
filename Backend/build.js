import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildAndCopyFrontend() {
    try {
        // Build frontend
        console.log('Building frontend...');
        await new Promise((resolve, reject) => {
            exec('cd ../Frontend && npm run build', (error, stdout, stderr) => {
                if (error) {
                    console.error('Error building frontend:', error);
                    reject(error);
                    return;
                }
                console.log(stdout);
                resolve();
            });
        });

        // Ensure dist directory exists
        const distPath = path.join(__dirname, '../Frontend/dist');
        try {
            await fs.access(distPath);
        } catch {
            console.error('Frontend build directory not found. Make sure the frontend build was successful.');
            process.exit(1);
        }

        console.log('Frontend built successfully!');
    } catch (error) {
        console.error('Build script failed:', error);
        process.exit(1);
    }
}

buildAndCopyFrontend();