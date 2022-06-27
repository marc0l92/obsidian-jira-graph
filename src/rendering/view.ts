import { ItemView, WorkspaceLeaf } from "obsidian"

export const JIRA_GRAPH_VIEW_TYPE = "jira-graph-view"

export class JiraGraphView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf)
  }

  getViewType() {
    return JIRA_GRAPH_VIEW_TYPE
  }

  getDisplayText() {
    return "Jira Graph"
  }

  async onOpen() {
    const container = this.containerEl.children[1]
    container.empty()
    container.createEl("h4", { text: "Example view" })
  }

  async onClose() {
    // Nothing to clean up.
  }
}