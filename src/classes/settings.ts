export default interface SaveTabsSettings {
    singleTabOverwrite: boolean,
    multiTabOverwrite: boolean,
    skipUnknownProtocols: boolean,
    tabGroups: string[],
    tabGroupsDefault: string,
    selectedTabGroup: string
}