import { IJiraIssueSettings } from "./settings"
const ms = require('ms')
const moment = require('moment')

interface CacheItem {
    updateTime: number,
    data: any,
    isError: boolean,
}
interface Cache {
    [key: string]: CacheItem
}

export class ObjectsCache {
    private _settings: IJiraIssueSettings
    private _cache: Cache

    constructor(settings: IJiraIssueSettings) {
        this._settings = settings
        this._cache = {}
    }

    add<T>(key: string, object: T, isError: boolean = false): CacheItem {
        this._cache[key] = {
            updateTime: Date.now(),
            data: object,
            isError: isError,
        }
        return this._cache[key]
    }

    get(key: string) {
        if (key in this._cache && this._cache[key].updateTime + ms(this._settings.cacheTime) > Date.now()) {
            return this._cache[key]
        }
        return null
    }

    getTime(key: string) {
        if (key in this._cache) {
            return moment(this._cache[key].updateTime).format('llll')
        }
        return null
    }

    clear() {
        this._cache = {}
    }
}
