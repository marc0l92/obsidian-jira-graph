import { Editor, MarkdownView, Notice, Plugin } from 'obsidian'
import { JiraClient } from './client/jiraClient'
import { ObjectsCache } from './objectsCache'
import { JiraIssueSettingsTab } from './settings'

// TODO: text on mobile and implement horizontal scrolling

export default class JiraIssuePlugin extends Plugin {
    _settings: JiraIssueSettingsTab
    _client: JiraClient
    _cache: ObjectsCache

    async onload() {
        this._settings = new JiraIssueSettingsTab(this.app, this)
        await this._settings.loadSettings()
        this.addSettingTab(this._settings)
        this._cache = new ObjectsCache(this._settings.getData())
        this._client = new JiraClient(this._settings.getData())
        this._client.updateCustomFieldsCache()
        this._client.updateJQLAutoCompleteCache()

        // Settings refresh
        this._settings.onChange(() => {
            this._cache.clear()
            this._client.updateCustomFieldsCache()
            this._client.updateJQLAutoCompleteCache()
        })

        // Commands
        this.addCommand({
            id: 'obsidian-jira-issue-clear-cache',
            name: 'Clear cache',
            callback: () => {
                this._cache.clear()
                this._client.updateCustomFieldsCache()
                this._client.updateJQLAutoCompleteCache()
                new Notice('JiraIssue: Cache cleaned')
            }
        })
        this.addCommand({
            id: 'obsidian-jira-issue-template-fence',
            name: 'Insert issue template',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                editor.replaceRange('```jira-issue\n\n```', editor.getCursor())
            }
        })
        this.addCommand({
            id: 'obsidian-jira-count-template-fence',
            name: 'Insert count template',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                editor.replaceRange('```jira-count\n\n```', editor.getCursor())
            }
        })
    }

    onunload() {
        this._settings = null
        this._cache = null
        this._client = null
    }
}

