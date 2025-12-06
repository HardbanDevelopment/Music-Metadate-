
const STORAGE_KEYS = {
    ISRC_PREFIX: 'mme_isrc_prefix',
    ISRC_SEQ: 'mme_isrc_sequence',
    CAT_SEQ: 'mme_cat_sequence',
    CAT_PREFIX: 'mme_cat_prefix' // Domyślnie HRL, ale pozwalamy zmienić
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
 * Generuje kolejny numer katalogowy w formacie PREFIX-ROK-NUMER (np. HRL-2024-001)
 * i inkrementuje licznik.
 */
export const generateNextCatalogNumber = (): string => {
    const config = getCodeConfig();
    const year = new Date().getFullYear();
    
    // Formatowanie numeru do 3 cyfr (001, 002...)
    const sequenceStr = config.nextCatSeq.toString().padStart(3, '0');
    const code = `${config.catPrefix}-${year}-${sequenceStr}`;

    // Inkrementacja i zapis
    saveCodeConfig({ nextCatSeq: config.nextCatSeq + 1 });

    return code;
};

/**
 * Generuje kolejny kod ISRC w formacie CC-XXX-YY-NNNNN
 * i inkrementuje licznik.
 */
export const generateNextISRC = (): string => {
    const config = getCodeConfig();
    const yearShort = new Date().getFullYear().toString().slice(-2); // np. 24
    
    // Standard ISRC ma 5 cyfr na końcu
    const sequenceStr = config.nextIsrcSeq.toString().padStart(5, '0');
    
    // config.isrcPrefix powinien być w formacie CC-XXX (Kraj-Rejestrant), np. PL-A12
    // Usuwamy myślniki z prefiksu jeśli użytkownik je wpisał, aby zachować standard, 
    // lub zostawiamy tak jak użytkownik woli. Tutaj zakładamy formatowanie inteligentne.
    let cleanPrefix = config.isrcPrefix.toUpperCase();
    
    // Jeśli użytkownik nie ustawił własnego prefiksu, zwracamy placeholder do edycji
    if (cleanPrefix === DEFAULT_ISRC_PREFIX || !cleanPrefix) {
        return `PL-XXX-${yearShort}-${sequenceStr}`;
    }

    const code = `${cleanPrefix}-${yearShort}-${sequenceStr}`;

    // Inkrementacja i zapis
    saveCodeConfig({ nextIsrcSeq: config.nextIsrcSeq + 1 });

    return code;
};

export const resetSequences = () => {
    localStorage.setItem(STORAGE_KEYS.ISRC_SEQ, '1');
    localStorage.setItem(STORAGE_KEYS.CAT_SEQ, '1');
};
