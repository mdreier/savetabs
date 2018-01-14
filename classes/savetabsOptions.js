/**
 * Default settings.
 */
const DEFAULT_SETTINGS = {
    singleTabOverwrite: true,
    multiTabOverwrite: true,
    skipUnknownProtocols: true,
    groups: ["Default"],
    defaultgroup: "Default"
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
            .then(() => this._saveSettings())
            .catch(e => this._handleError("Error storing settings", e));
    }

    addTabGroup(event)
    {
        event.preventDefault();
        let groupName = document.querySelector("#groupname").value.trim();
        if (!groupName || groupName == "")
        {
            this._setGroupError(browser.i18n.getMessage("enterTabGroupName"));
        } else {
            this._setGroupError(undefined);
            this._createTabGroup(groupName)
                .then(hideAddGroupControls(new Event("st-internal")));
        }
    }

    setDefaultTabGroup(event)
    {
        event.preventDefault();
        let selectedEntry = document.querySelector("#stsetting-tabgroups option:checked");
        if (!selectedEntry)
        {
            this._setGroupError(browser.i18n.getMessage("noGroupSelected"));
        }
        else
        {
            this._setGroupError(undefined);
            this._settings.defaultgroup = selectedEntry.value;
            this._saveSettings()
                .then(this._updateUI());
        }
    }

    removeTabGroup(event)
    {
        event.preventDefault();
        let selectedEntry = document.querySelector("#stsetting-tabgroups option:checked");
        if (!selectedEntry)
        {
            this._setGroupError(browser.i18n.getMessage("noGroupSelected"));
        }
        else
        {
            this._setGroupError(undefined);
            this._removeTabGroup(selectedEntry.value)
                .then(this._saveSettings())
                .then(this._updateUI());
        }
    }

    _createTabGroup(groupName)
    {
        if (this._settings.groups.indexOf(groupName) >= 0)
        {
            return Promise.reject("Group already exists");
        }
        this._settings.groups.push(groupName);
        return this._saveSettings()
            .then(this._updateUI());
    }

    _removeTabGroup(groupName)
    {
        if (this._settings.groups.length <= 1)
        {
            return Promise.reject("You cannot remove the last tab group");
        }
        if (this._settings.defaultgroup === groupName)
        {
            return Promise.reject("You cannot remove the default tab group");
        }
        this._settings.groups = this._settings.groups.filter(elem => elem !== groupName);
        return Promise.resolve(this._settings.groups);
    }

    _setGroupError(errortext)
    {
        if (errortext)
        {
            document.querySelector("#grouperror").style.display = "block";
            document.querySelector("#grouperror").textContent = errortext;
        }
        else
        {
            document.querySelector("#grouperror").style.display = "none";
        }
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
    _saveSettings()
    {
        return browser.storage.local.set({settings: this._settings})
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
}