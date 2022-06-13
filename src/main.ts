import { Plugin } from 'obsidian'
import { JiraClient } from './client/jiraClient'
import { ObjectsCache } from './objectsCache'
import { JiraIssueSettingsTab as JiraGraphSettingsTab } from './settings'


export default class JiraGraphPlugin extends Plugin {
    _settings: JiraGraphSettingsTab
    _client: JiraClient
    _cache: ObjectsCache

    async onload() {
        this._settings = new JiraGraphSettingsTab(this.app, this)
        await this._settings.loadSettings()
        this.addSettingTab(this._settings)
        this._cache = new ObjectsCache(this._settings.getData())
        this._client = new JiraClient(this._settings.getData())

        // Settings refresh
        this._settings.onChange(() => {
            this._cache.clear()
        })

        // Commands
        // this.addCommand({
        //     id: 'obsidian-jira-graph-clear-cache',
        //     name: 'Clear cache',
        //     callback: () => {
        //         this._cache.clear()
        //         new Notice('JiraGraph: Cache cleaned')
        //     }
        // })
        this.addCommand({
            id: 'obsidian-jira-graph-create',
            name: 'Create graph',
            callback: () => {
            }
        })
    }

    onunload() {
        this._settings = null
        this._cache = null
        this._client = null
    }
}

