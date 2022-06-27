import { Plugin, TFolder } from 'obsidian'
import { JiraClient } from './client/jiraClient'
import { EMPTY_DIAGRAM_SVG } from './constants'
import { JiraGraphView, JIRA_GRAPH_VIEW_TYPE } from './rendering/view'
import { JiraIssueSettingsTab as JiraGraphSettingsTab } from './settings'


export default class JiraGraphPlugin extends Plugin {
    _settings: JiraGraphSettingsTab
    _client: JiraClient

    async onload() {
        this._settings = new JiraGraphSettingsTab(this.app, this)
        await this._settings.loadSettings()
        this.addSettingTab(this._settings)

        this._client = new JiraClient(this._settings.getData())

        // Settings refresh
        this._settings.onChange(() => {
        })
        this.addCommand({
            id: 'obsidian-jira-graph-create',
            name: 'Create graph',
            callback: async () => {
                const file = await this.createNewGraph()
                console.log(file)
                this.activateView()

            }
        })
        this.registerView(
            JIRA_GRAPH_VIEW_TYPE,
            (leaf) => new JiraGraphView(leaf)
        )
    }

    private async getNewDiagramFilePath(
        folder: TFolder,
        name: string,
        extension: string
    ) {
        let filePath = `${folder.path}/${name}.${extension}`;
        let index = 0;
        while (await this.app.vault.adapter.exists(filePath)) {
            filePath = `${folder.path}/${name}_${++index}.${extension}`;
        }
        return filePath;
    }

    private async createNewGraph(folder: TFolder = null) {
        const targetFolder = folder
            ? folder
            : this.app.fileManager.getNewFileParent("");
        const newFilePath = await this.getNewDiagramFilePath(
            targetFolder,
            "UntitledGraph",
            "svg"
        );
        const file = await this.app.vault.create(newFilePath, EMPTY_DIAGRAM_SVG);
        return file;
    }

    private async activateView() {
        // Close existing views in order to force only one displayed at a time
        this.app.workspace.detachLeavesOfType(JIRA_GRAPH_VIEW_TYPE)

        await this.app.workspace.getLeaf(false).setViewState({
            type: JIRA_GRAPH_VIEW_TYPE,
            active: true,
        });

        this.app.workspace.revealLeaf(
            this.app.workspace.getLeavesOfType(JIRA_GRAPH_VIEW_TYPE)[0]
        );
    }

    onunload() {
        this._settings = null
        this._client = null
        this.app.workspace.detachLeavesOfType(JIRA_GRAPH_VIEW_TYPE)
    }
}

