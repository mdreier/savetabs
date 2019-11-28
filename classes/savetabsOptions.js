/**
 * Default settings.
 */
const DEFAULT_SETTINGS = {
    singleTabOverwrite: true,
    multiTabOverwrite: true,
    skipUnknownProtocols: true,
    tabGroups: ["Default"],
    tabGroupsDefault: "Default"
};

/**
 * Class to handle loading and saving options for the
 * Save Tabs extension.
 */
class SaveTabsOptions
{

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
    update(newSettings)
    {
        return this._updateSettings(newSettings)
            .then(() => this._cloneSettings())
            .then((settings) => this._saveSettings(settings))
            .catch(e => this._handleError("Error storing settings", e));
    }

    /**
     * Update all settings from the current UI state.
     */
    _updateSettings(newSettings)
    {
        this._settings = newSettings;
        return Promise.resolve(this._settings);
    }

    /**
     * Save the settings to local storage.
     */
    _saveSettings(newSettings)
    {
        return browser.storage.local.set({settings: newSettings})
            .then(() => console.log("Settings saved"))
            .catch(e => this._handleError("Saving settings failed", e));
    }

    /**
     * Load settings from local storage.
     * @returns {Promise} Promise which resolves with the settings once the settings are loaded.
     */
    _restoreSettings()
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
    _mergeSettings(settings)
    {
        for (let key in DEFAULT_SETTINGS)
        {
            if (DEFAULT_SETTINGS.hasOwnProperty(key) && !settings.hasOwnProperty(key))
            {
                settings[key] = DEFAULT_SETTINGS[key];
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
    _handleError(errorMessage, error)
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
        let clone = {};
        for (let prop in this._settings)
        {
            if (this._settings.hasOwnProperty(prop))
            {
                clone[prop] = this._settings[prop];
            }
        }
        return clone;
    }
}