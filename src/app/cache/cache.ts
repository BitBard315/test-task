import * as fs from 'fs/promises';
import * as path from 'path';
import { createDir, getFilePath } from '../../shared/utils/utils';

interface CacheEntry {
    data: any;
    ttl: number;
}

export class FileCache {
    private cacheDir: string;

    constructor(cacheDir: string) {
        this.cacheDir = cacheDir;
        createDir(cacheDir);
    }

    public async set(key: string, value: any, ttl: number): Promise<void> {
        const entry: CacheEntry = {
            data: value,
            ttl: Date.now() + ttl * 1000,
        };

        const filePath = getFilePath(this.cacheDir, key);

        try {
            await fs.writeFile(filePath, JSON.stringify(entry));
        } catch (error: any) {
            console.error(`Error writing cache - ${key}: ${error.message}`);
        }
    }

    public async get(key: string): Promise<any | null> {
        const filePath = getFilePath(this.cacheDir, key);

        try {
            const entryData: string = await fs.readFile(filePath, 'utf-8');
            const entry: CacheEntry = JSON.parse(entryData);

            if (entry.ttl > Date.now()) {
                return entry.data;
            } else {
                await this.delete(key);
            }
        } catch (error: any) {
            return null;
        }
    }

    public async delete(key: string): Promise<void> {
        const filePath = getFilePath(this.cacheDir, key);

        try {
            await fs.unlink(filePath);
        } catch (error: any) {
            console.error(`Error deleting cache - ${key}: ${error.message}`);
        }
    }

    public async clear(): Promise<void> {
        try {
            const files: string[] = await fs.readdir(this.cacheDir);
            const unlinkPromises: Promise<void>[] = files.map(file =>
                fs.unlink(path.join(this.cacheDir, file))
            );
            await Promise.all(unlinkPromises);
        } catch (error: any) {
            console.error(`Error clearing cache: ${error.message}`);
        }
    }
}