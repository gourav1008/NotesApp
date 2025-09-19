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

        // Ensure source dist directory exists
        const sourcePath = path.join(__dirname, '../Frontend/dist');
        try {
            await fs.access(sourcePath);
        } catch {
            console.error('Frontend build directory not found. Make sure the frontend build was successful.');
            process.exit(1);
        }

        // Create the target directory if it doesn't exist
        const targetPath = path.join(__dirname, 'Frontend/dist');
        try {
            await fs.mkdir(path.join(__dirname, 'Frontend'), { recursive: true });
        } catch (err) {
            if (err.code !== 'EEXIST') {
                throw err;
            }
        }

        // Copy the dist directory
        console.log('Copying frontend build files...');
        await fs.cp(sourcePath, targetPath, { recursive: true });

        console.log('Frontend built and copied successfully!');
    } catch (error) {
        console.error('Build script failed:', error);
        process.exit(1);
    }
}

buildAndCopyFrontend();