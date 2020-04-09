import 'chrome-extension-async';

export class QiitaZapping {
    static readonly KEY_CACHE = "apiCache";
    static readonly KEY_QUERIES = "searchQueries";
    static readonly CACHE_MIN = 60 * 60 * 1000;

    private cache: StorageCache;

    constructor() {}

    private async getCache(): Promise<StorageCache> {
        let cache = this.cache;
        if (!cache) {
            cache = this.cache= <StorageCache> await chrome.storage.local.get({
                // @ts-ignore
                [QiitaZapping.KEY_CACHE]: {},
                [QiitaZapping.KEY_QUERIES]: []
            })
        }
        return cache;
    }

    private async getCurrentSearchQuery(): Promise<QiitaApiQuery> {
        const cache = await this.getCache();
        return cache.searchQueries.find((q) => q.isActive);
    }

    private async getNeighborMap(): Promise<QiitaApiCache.NeiborMap> {
        const query = await this.getCurrentSearchQuery();
        // no query registered
        if (!query) return {};

        const cache = await this.getCache();
        let cacheUrl = cache[query.id] || {
            cachedAt: 0,
            neiborMap: {}
        };
        const cachedAt = cacheUrl["cachedAt"];
        if (cachedAt < new Date().getTime() - QiitaZapping.CACHE_MIN) {
            const nMap = await this.fetchQiitaItems(query);
            cacheUrl = cache[query.id] = {
                cachedAt: new Date().getTime(),
                neiborMap: nMap,
            };
            await chrome.storage.local.set({[QiitaZapping.KEY_CACHE]: cache});
        }
        return cacheUrl.neiborMap;
    }

    async getNeighbors(): Promise<QiitaApiCache.NeiborMap.Neibors> {
        const neiborMap = await this.getNeighborMap();
        const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        if (!tabs[0] || !tabs[0].hasOwnProperty("url")) return {};
        const currentUrl = tabs[0].url.split(/[?#]/)[0]; // remove query and anchor for maching neibor urls
        return neiborMap[currentUrl] || {};
    }

    async goTo(nextPrev: string): Promise<void> {
        const neibors = await this.getNeighbors();
        if (nextPrev in neibors) {
            const goToUrl = neibors[nextPrev];
            chrome.tabs.update({ url: goToUrl });
        }
    }

    private async fetchQiitaItems(query: QiitaApiQuery): Promise<QiitaApiCache.NeiborMap> {
        const q = (query.query) ? `&query=${query.query}` : "";
        const response = await fetch(`https://${query.domain}/api/v2/items?page=1&per_page=100${q}`, {
            headers: { "Authorization": `Bearer ${query.token}` }
        });
        const json = await response.json();
        const urls = json.map(j => j.url);
        const neighborMap = <QiitaApiCache.NeiborMap> Array.from(urls, (v, k) => k).reduce(function (nMap, i) {
            nMap[urls[i]] = {
                previous: urls[i - 1],
                next: urls[i + 1],
            };
            return nMap;
        }, {});
        return neighborMap;
    }

}