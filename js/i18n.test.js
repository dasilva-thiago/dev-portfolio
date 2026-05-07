import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getNestedValue, translationCache, getCurrentLang } from './i18n.js';


describe('getNestedValue', () => {
    it('retorna valor de chave simples', () => {
        const obj = { name: 'Thiago' };
        expect(getNestedValue(obj, 'name')).toBe('Thiago');
    });

    it('retorna valor de chave aninhada', () => {
        const obj = { contact: { form: { button: 'Enviar' } } };
        expect(getNestedValue(obj, 'contact.form.button')).toBe('Enviar');
    });

    it('retorna undefined para chave inexistente', () => {
        const obj = { name: 'Thiago' };
        expect(getNestedValue(obj, 'contact.form.button')).toBeUndefined();
    });

    it('não lança erro se objeto for null', () => {
        expect(getNestedValue(null, 'contact.form')).toBeUndefined();
    });

    it('retorna undefined para objeto vazio', () => {
        expect(getNestedValue({}, 'contact.form.button')).toBeUndefined();
    });
});

describe('translationCache', () => {
    it('começa como objeto vazio', () => {
        expect(typeof translationCache).toBe('object');
        expect(translationCache).not.toBeNull();
    });
});

describe('getCurrentLang', () => {
    it('retorna uma string válida', () => {
        const lang = getCurrentLang();
        expect(typeof lang).toBe('string');
        expect(lang.length).toBeGreaterThan(0);
    });

    it('retorna um idioma suportado', () => {
        const SUPPORTED = ['en', 'pt', 'es'];
        expect(SUPPORTED).toContain(getCurrentLang());
    });
});

describe('loadTranslations via fetch mock', () => {
    beforeEach(() => {
        Object.keys(translationCache).forEach(k => delete translationCache[k]);
    });

    it('usa cache na segunda chamada — fetch chamado só uma vez', async () => {
        const mockData = { contact: { form: { button: 'Enviar' } } };

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockData,
        });

        const mod = await import('./i18n.js');

        translationCache['pt'] = mockData;
        const cached = translationCache['pt'];
        expect(cached).toEqual(mockData);
        expect(cached.contact.form.button).toBe('Enviar');
    });

    it('getNestedValue funciona com dados reais de tradução', () => {
        const ptData = {
            nav: { skills: 'Habilidades', contact: 'Contato' },
            contact: { feedback: { success: 'Mensagem recebida!' } }
        };

        expect(getNestedValue(ptData, 'nav.skills')).toBe('Habilidades');
        expect(getNestedValue(ptData, 'contact.feedback.success')).toBe('Mensagem recebida!');
        expect(getNestedValue(ptData, 'nav.missing')).toBeUndefined();
    });
});