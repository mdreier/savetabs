/**
 * Default settings.
 */
import DEFAULT_SETTINGS from "./defaultSettings"
import SaveTabsSettings from "./settings";

interface SaveTabsSettingsClone {
    [key: string]: any
}

/**
 * Class to handle loading and saving options for the
 * Save Tabs extension.
 */
export default class SaveTabsOptions
{
    _settings: SaveTabsSettings

    /**
     * Create a new instance with default settings.
     */
    constructor()
    {
        this._settings = DEFAULT_SETTINGS;
    }

    /**
     * Restore the UI from saved settings.
     */
    restore()
    {
        return this._restoreSettings()
            .catch(e => this._handleError("Error loading settings", e));
    }

    /**
     * Store the settings currently selected on the UI.
     */
    update(newSettings: SaveTabsSettings)
    {
        return this._updateSettings(newSettings)
            .then(() => this._cloneSettings())
            .then((settings) => this._saveSettings(settings))
            .catch(e => this._handleError("Error storing settings", e));
    }

    /**
     * Remove stored data for a tab group.
     * @param {String} tabGroup Name of the tab group
     */
    removeStoredTabGroupData(tabGroup: string)
    {
        if (tabGroup)
        {
            browser.storage.local.remove("savedTabs-" + tabGroup);
        }
    }

    /**
     * Update all settings from the current UI state.
     */
    _updateSettings(newSettings: SaveTabsSettings)
    {
        this._settings = newSettings;
        return Promise.resolve(this._settings);
    }

    /**
     * Save the settings to local storage.
     */
    _saveSettings(newSettings: SaveTabsSettings)
    {
        return browser.storage.local.set({settings: newSettings})
            .then(() => console.log("Settings saved"))
            .catch(e => this._handleError("Saving settings failed", e));
    }

    /**
     * Load settings from local storage.
     * @returns {Promise} Promise which resolves with the settings once the settings are loaded.
     */
    _restoreSettings(): Promise<SaveTabsSettings>
    {
        return browser.storage.local.get("settings")
            .then(data => data.settings ? data.settings : DEFAULT_SETTINGS)
            .then(this._mergeSettings)
            .then(settings => this._settings = settings)
            .then(() => this._settings);
    }

    /**
     * Merge loaded settings with the default settings to fill in missing keys.
     * @param {array} settings Settings loaded from storage
     * @returns {array} Merged settings.
     */
    _mergeSettings(settings: SaveTabsSettings): SaveTabsSettings
    {
        let settingsClone = settings as SaveTabsSettingsClone;
        for (let key in DEFAULT_SETTINGS)
        {
            if (DEFAULT_SETTINGS.hasOwnProperty(key) && !settings.hasOwnProperty(key))
            {
                let settingsKey = key as keyof SaveTabsSettings;
                settingsClone[settingsKey] = DEFAULT_SETTINGS[settingsKey];
            }
        }
        return settings;
    }

    /**
     * Handles errors.
     * 
     * @param {string} errorMessage The error message 
     * @param {*} error Optional error object.
     */
    _handleError(errorMessage: string, error: any)
    {
        console.error(errorMessage);
        if (error)
        {
            console.debug(error);
        }
    }

    /**
     * Make a shallow clone of the settings as the inner settings object has been
     * enhanced by Vue.js and cannot be stored in the settings.
     */
    _cloneSettings()
    {
        let clone = {} as SaveTabsSettingsClone;
        for (let prop in this._settings)
        {
            if (this._settings.hasOwnProperty(prop))
            {
                let myprop = prop as keyof SaveTabsSettings;
                clone[myprop] = this._settings[myprop];
            }
        }
        return clone as SaveTabsSettings;
    }
}