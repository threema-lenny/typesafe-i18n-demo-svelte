import {type Readable, derived} from 'svelte/store';
import {locale, setLocale, LL} from './i18n-svelte'
import type {TranslationFunctions} from './i18n-types';

type RecursivePaths<T> = T extends Function ? [] : {
    [K in Extract<keyof T, string>]: [K, ...RecursivePaths<T[K]>]
}[Extract<keyof T, string>];

type Join<T extends string[], D extends string> =
    T extends [] ? never :
    T extends [infer F] ? F :
    T extends [infer F, ...infer R] ?
    F extends string ?
    `${F}${D}${Join<Extract<R, string[]>, D>}` : never : string;

type RecursiveLookup<T extends object, P extends string, D extends string> =
  P extends '' ? T :
  P extends `${infer Key}${D}${infer Rest}`
    ? RecursiveLookup<Extract<Key extends keyof T ? T[Key] : never, object>, Rest, D> :
    RecursiveLookup<Extract<P extends keyof T ? T[P] : never, object>, '', D>;

type TranslationPaths = Join<RecursivePaths<TranslationFunctions>, ".">;
type TranslationFunctionForPath<TPath extends string> = RecursiveLookup<TranslationFunctions, TPath, ".">;

function LD<TPath extends TranslationPaths>(
    path: TPath,
    ...args: Parameters<TranslationFunctionForPath<TPath>>
): Readable<string> {
    return derived(LL, (translations) => {
        const fn = path.split('.').reduce((translation, key) => translation[key], translations) as TranslationFunctionForPath<TPath>;
        return fn(...args);
    });
}

export { locale, LL, LD, setLocale }

export default LL
