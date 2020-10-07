import * as fs from 'fs';
import * as crypto from 'crypto';
import { Document, DocumentQuery, Query } from 'mongoose';

export function fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
}
export async function mkdir(filePath: string): Promise<string> {
    return fs.promises.mkdir(filePath, { recursive: true });
}
export function getDirectories(path: string): string[] {
    return fs
        .readdirSync(path, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
}

export async function rmDir(filePath: string): Promise<void> {
    return fs.promises.rmdir(filePath, { recursive: true });
}

export function generateToken() {
    return crypto.randomBytes(64).toString('hex');
}

export function positiveVal(page: any, defaultValue = 1) {
    return Math.abs(page) || defaultValue;
}

export function stringToArray(string: any): string[] {
    if (!string) return [];

    if (Array.isArray(string)) {
        return string;
    }

    return string.split(',');
}

export async function delay(time: number): Promise<boolean> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
}

export async function paginate<T extends Document>(
    itemsQuery: DocumentQuery<T[], T>,
    totalQuery: Query<number>,
    page: number,
    perPage: number,
) {
    return Promise.all([itemsQuery, totalQuery]).then(([items, total]) => {
        return {
            items,
            totalPages: Math.ceil(total / perPage),
            total,
            page,
            perPage,
        };
    });
}
