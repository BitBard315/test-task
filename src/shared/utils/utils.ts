import * as fs from 'fs/promises';
import * as path from 'path';

export async function createDir(cacheDir: string) {
    try {
        await fs.mkdir(cacheDir);
    } catch (error: any) {
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }
}

export function getFilePath(cacheDir: string, key: string): string {
    return path.join(cacheDir, `${key}.json`);
}