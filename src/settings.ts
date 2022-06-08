import { App, PluginSettingTab, Setting } from 'obsidian'
import JiraGraphPlugin from './main'

export enum EAuthenticationTypes {
    OPEN = 'OPEN',
    BASIC = 'BASIC',
    BEARER_TOKEN = 'BEARER_TOKEN',
}
const AUTHENTICATION_TYPE_DESCRIPTION = {
    [EAuthenticationTypes.OPEN]: 'Open',
    [EAuthenticationTypes.BASIC]: 'Basic Authentication',
    [EAuthenticationTypes.BEARER_TOKEN]: 'Bearer Token',
}

export interface IJiraIssueSettings {
    host: string
    authenticationType: EAuthenticationTypes
    username?: string
    password?: string
    bareToken?: string
    apiBasePath: string
    cacheTime: string
    statusColorCache: Record<string, string>
    darkMode: boolean
}

const DEFAULT_SETTINGS: IJiraIssueSettings = {
    host: 'https://issues.apache.org/jira',
    authenticationType: EAuthenticationTypes.OPEN,
    apiBasePath: '/rest/api/latest',
    password: '********',
    cacheTime: '15m',
    statusColorCache: {},
    darkMode: false,
}

export class JiraIssueSettingsTab extends PluginSettingTab {
    private _plugin: JiraGraphPlugin
    private _data: IJiraIssueSettings = DEFAULT_SETTINGS
    private _onChangeListener: (() => void) | null = null

    constructor(app: App, plugin: JiraGraphPlugin) {
        super(app, plugin)
        this._plugin = plugin
    }

    getData(): IJiraIssueSettings {
        return this._data
    }

    async loadSettings() {
        this._data = Object.assign({}, DEFAULT_SETTINGS, await this._plugin.loadData())
        this._data.statusColorCache = DEFAULT_SETTINGS.statusColorCache
    }

    async saveSettings() {
        await this._plugin.saveData(this._data)
        if (this._onChangeListener) {
            this._onChangeListener()
        }
    }

    onChange(listener: () => void) {
        this._onChangeListener = listener
    }

    display(): void {
        const { containerEl } = this
        containerEl.empty()

        containerEl.createEl('h2', { text: 'Connection' })
        new Setting(containerEl)
            .setName('Host')
            .setDesc('Hostname of your company Jira server.')
            .addText(text => text
                .setPlaceholder('Example: ' + DEFAULT_SETTINGS.host)
                .setValue(this._data.host)
                .onChange(async value => {
                    this._data.host = value
                    await this.saveSettings()
                }))
        new Setting(containerEl)
            .setName('Authentication type')
            .setDesc('Select how the plugin should authenticate in your Jira server.')
            .addDropdown(dropdown => dropdown
                .addOptions(AUTHENTICATION_TYPE_DESCRIPTION)
                .setValue(this._data.authenticationType)
                .onChange(async value => {
                    this._data.authenticationType = value as EAuthenticationTypes
                    await this.saveSettings()
                    // Force refresh
                    this.display()
                }))
        if (this._data.authenticationType === EAuthenticationTypes.BASIC) {
            new Setting(containerEl)
                .setName('Username')
                .setDesc('Username to access your Jira account using HTTP basic authentication.')
                .addText(text => text
                    // .setPlaceholder('')
                    .setValue(this._data.username)
                    .onChange(async value => {
                        this._data.username = value
                        await this.saveSettings()
                    }))
            new Setting(containerEl)
                .setName('Password')
                .setDesc('Password to access your Jira account using HTTP basic authentication.')
                .addText(text => text
                    // .setPlaceholder('')
                    .setValue(DEFAULT_SETTINGS.password)
                    .onChange(async value => {
                        this._data.password = value
                        await this.saveSettings()
                    }))
        }
        if (this._data.authenticationType === EAuthenticationTypes.BEARER_TOKEN) {
            new Setting(containerEl)
                .setName('Bearer token')
                .setDesc('Token to access your Jira account using OAuth2 Bearer token authentication.')
                .addText(text => text
                    // .setPlaceholder('')
                    .setValue(this._data.bareToken)
                    .onChange(async value => {
                        this._data.bareToken = value
                        await this.saveSettings()
                    }))
        }



        containerEl.createEl('h2', { text: 'Rendering' })
        new Setting(containerEl)
            .setName('Dark mode')
            // .setDesc('')
            .addToggle(toggle => toggle
                .setValue(this._data.darkMode)
                .onChange(async value => {
                    this._data.darkMode = value
                    await this.saveSettings()
                }))


        containerEl.createEl('h2', { text: 'Search columns' })
        const desc = document.createDocumentFragment()
        desc.append(
            "Columns to display in the jira-search table visualization.",
        )


        containerEl.createEl('h2', { text: 'Cache' })
        new Setting(containerEl)
            .setName('Cache time')
            .setDesc('Time before the cached issue status expires. A low value will refresh the data very often but do a lot of request to the server.')
            .addText(text => text
                .setPlaceholder('Example: 15m, 24h, 5s')
                .setValue(this._data.cacheTime)
                .onChange(async value => {
                    this._data.cacheTime = value
                    await this.saveSettings()
                }))
    }
}