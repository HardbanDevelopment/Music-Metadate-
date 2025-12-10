
const STORAGE_KEYS = {
    ISRC_PREFIX: 'mme_isrc_prefix',
    ISRC_SEQ: 'mme_isrc_sequence',
    CAT_SEQ: 'mme_cat_sequence',
    CAT_PREFIX: 'mme_cat_prefix' // Default HRL, but allow changing
};

const DEFAULT_ISRC_PREFIX = 'PL-XXX'; // Placeholder
const DEFAULT_CAT_PREFIX = 'HRL';

export interface CodeConfig {
    isrcPrefix: string;
    catPrefix: string;
    nextIsrcSeq: number;
    nextCatSeq: number;
}

export const getCodeConfig = (): CodeConfig => {
    return {
        isrcPrefix: localStorage.getItem(STORAGE_KEYS.ISRC_PREFIX) || DEFAULT_ISRC_PREFIX,
        catPrefix: localStorage.getItem(STORAGE_KEYS.CAT_PREFIX) || DEFAULT_CAT_PREFIX,
        nextIsrcSeq: parseInt(localStorage.getItem(STORAGE_KEYS.ISRC_SEQ) || '1', 10),
        nextCatSeq: parseInt(localStorage.getItem(STORAGE_KEYS.CAT_SEQ) || '1', 10),
    };
};

export const saveCodeConfig = (config: Partial<CodeConfig>) => {
    if (config.isrcPrefix) localStorage.setItem(STORAGE_KEYS.ISRC_PREFIX, config.isrcPrefix);
    if (config.catPrefix) localStorage.setItem(STORAGE_KEYS.CAT_PREFIX, config.catPrefix);
    if (config.nextIsrcSeq) localStorage.setItem(STORAGE_KEYS.ISRC_SEQ, config.nextIsrcSeq.toString());
    if (config.nextCatSeq) localStorage.setItem(STORAGE_KEYS.CAT_SEQ, config.nextCatSeq.toString());
};

/**
 * Generates next catalog number in format PREFIX-YEAR-NUMBER (e.g. HRL-2024-001)
 * and increments the counter.
 */
export const generateNextCatalogNumber = (): string => {
    const config = getCodeConfig();
    const year = new Date().getFullYear();

    // Format number to 3 digits (001, 002...)
    const sequenceStr = config.nextCatSeq.toString().padStart(3, '0');
    const code = `${config.catPrefix}-${year}-${sequenceStr}`;

    // Increment and save
    saveCodeConfig({ nextCatSeq: config.nextCatSeq + 1 });

    return code;
};

/**
 * Generates next ISRC code in format CC-XXX-YY-NNNNN
 * and increments the counter.
 */
export const generateNextISRC = (): string => {
    const config = getCodeConfig();
    const yearShort = new Date().getFullYear().toString().slice(-2); // e.g. 24

    // Standard ISRC has 5 digits at the end
    const sequenceStr = config.nextIsrcSeq.toString().padStart(5, '0');

    // config.isrcPrefix should be in format CC-XXX (Country-Registrant), e.g. PL-A12
    // Remove dashes from prefix if user entered them to maintain standard,
    // or leave as user prefers. Here we assume intelligent formatting.
    let cleanPrefix = config.isrcPrefix.toUpperCase();

    // If user did not set custom prefix, return placeholder for editing
    if (cleanPrefix === DEFAULT_ISRC_PREFIX || !cleanPrefix) {
        return `PL-XXX-${yearShort}-${sequenceStr}`;
    }

    const code = `${cleanPrefix}-${yearShort}-${sequenceStr}`;

    // Increment and save
    saveCodeConfig({ nextIsrcSeq: config.nextIsrcSeq + 1 });

    return code;
};

export const resetSequences = () => {
    localStorage.setItem(STORAGE_KEYS.ISRC_SEQ, '1');
    localStorage.setItem(STORAGE_KEYS.CAT_SEQ, '1');
};
