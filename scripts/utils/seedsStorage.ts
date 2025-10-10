import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import * as path from 'path';

export function hasSeeds(filePath: string): boolean {
    return existsSync(filePath);
}

export function loadSeeds(filePath: string): string[] {
    if (!existsSync(filePath)) {
        return [];
    }
    return JSON.parse(readFileSync(filePath, 'utf-8'));
}

export function saveSeeds(filePath: string, seeds: string[]): void {
    const dir = path.dirname(filePath);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    writeFileSync(filePath, JSON.stringify(seeds, null, 2), 'utf-8');
}

export function getCurrentSeed(filePath: string): string | null {
    const seeds = loadSeeds(filePath);
    if (seeds.length < 1) {
        return null;
    }
    return seeds[seeds.length - 1];
}

export function getNextSeed(filePath: string): string | null {
    const seeds = loadSeeds(filePath);
    if (seeds.length < 2) {
        return null;
    }
    return seeds[seeds.length - 2];
}

export function popCurrentSeed(filePath: string): string | null {
    const seeds = loadSeeds(filePath);
    if (seeds.length < 1) {
        return null;
    }
    
    const currentSeed = seeds[seeds.length - 1];
    seeds.pop();
    saveSeeds(filePath, seeds);
    
    return currentSeed;
}

export function getSeedsCount(filePath: string): number {
    const seeds = loadSeeds(filePath);
    return seeds.length;
}

export function getAnchorSeed(filePath: string): string | null {
    const seeds = loadSeeds(filePath);
    if (seeds.length < 1) {
        return null;
    }
    return seeds[0];
}
