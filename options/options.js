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
class SavetabsOptions
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
        this._restoreSettings()
            .then(() => this._updateUI())
            .catch(e => this._handleError("Error loading settings", e));
    }

    /**
     * Store the settings currently selected on the UI.
     */
    update()
    {
        this._updateSettings()
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
    _updateSettings()
    {
        this._updateFromRadioSet("singleTabOverwrite", "stsetting-single-overwrite", "stsetting-single-append");
        this._updateFromRadioSet("multiTabOverwrite", "stsetting-multi-overwrite", "stsetting-multi-append");
        this._updateFromRadioSet("skipUnknownProtocols", "stsetting-unknown-skip", "stsetting-unknown-store");
        return Promise.resolve(this._settings);
    }

    /**
     * Update a setting value from the UI.
     * @param {string} settingKey Key of the setting to update.
     * @param {string} trueControlId ID of the control representing a true value.
     * @param {string} falseControlId ID of the control representing a false value.
     */
    _updateFromRadioSet(settingKey, trueControlId, falseControlId)
    {
        if (this._isChecked(trueControlId))
        {
            this._settings[settingKey] = true;
        }
        else if (this._isChecked(falseControlId))
        {
            this._settings[settingKey] = false;
        }
    }

    /**
     * Check if a control (radio button or checkbox) is checked.
     * @param {string} controlId ID of the control to check.
     * @returns {boolean} true when the control is checked, false otherwise.
     */
    _isChecked(controlId)
    {
        return document.querySelector("#" + controlId).checked;
    }

    /**
     * Update setting controls on the UI from the current settings.
     */
    _updateUI()
    {
        this._updateRadioSet(this._settings.singleTabOverwrite, "stsetting-single-overwrite", "stsetting-single-append");
        this._updateRadioSet(this._settings.multiTabOverwrite, "stsetting-multi-overwrite", "stsetting-multi-append");
        this._updateRadioSet(this._settings.skipUnknownProtocols, "stsetting-unknown-skip", "stsetting-unknown-store");
        this._updateList(this._settings.groups, this._settings.defaultgroup, "stsetting-tabgroups");
    }

    /**
     * Update a radio button group on the UI.
     * 
     * @param {boolean} settingValue The value of the setting 
     * @param {string} trueControlId ID of the radio button to check when the setting value is true.
     * @param {string} falseControlId ID of the radio button to check when the setting value is false.
     */
    _updateRadioSet(settingValue, trueControlId, falseControlId)
    {
        if (settingValue === true)
        {
            document.querySelector("#" + trueControlId).checked="checked";
            document.querySelector("#" + falseControlId).checked="";
        }
        else if (settingValue === false)
        {
            document.querySelector("#" + trueControlId).checked="";
            document.querySelector("#" + falseControlId).checked="checked";
        }
        else
        {
            document.querySelector("#" + trueControlId).checked="";
            document.querySelector("#" + falseControlId).checked="";
        }
    }

    /**
     * Update a list on the UI from the settings.
     * 
     * @param {array} entries The entries for te list.
     * @param {string?} defaultValue The entry to be marked as default.
     * @param {string} listControlId The ID of the list control to be filled.
     */
    _updateList(entries, defaultValue, listControlId)
    {
        let list = document.querySelector("#" + listControlId);
        list.options.length = 0;
        for (let entry of entries)
        {
            let entryText = (entry === defaultValue ? "* " : "") + entry;
            let newEntry = new Option(entryText, entry, entry === defaultValue);
            list.appendChild(newEntry);
        }
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
            .then(settings => this._settings = settings);
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

//*** Functions for UI interaction ***
function showExpertSettings()
{
    document.querySelectorAll(".expertsetting").forEach(elem => elem.style.display = "block");
    document.querySelector("#showexpertsettings").style.display = "none";
}

function showAddGroupControls(event)
{
    event.preventDefault();
    document.querySelector("#addgroupdata").style.display="block";
    document.querySelector("#groupcontrols").style.display="none";
}

function hideAddGroupControls(event)
{
    event.preventDefault();
    document.querySelector("#addgroupdata").style.display = "none";
    document.querySelector("#grouperror").style.display = "none";
    document.querySelector("#groupcontrols").style.display="block";
    document.querySelector("#groupname").value = "";
}

let options = new SavetabsOptions();

//*** Register event handlers ***
document.addEventListener("DOMContentLoaded", options.restore.bind(options));
document.querySelector(".stsetting").addEventListener("click", options.update.bind(options));

document.querySelector("#showexpertsettings").addEventListener("click", showExpertSettings);

// Controls for tab groups
document.querySelector("#addgroup").addEventListener("click", showAddGroupControls);
document.querySelector("#canceladdgroup").addEventListener("click", hideAddGroupControls);

document.querySelector("#savegroup").addEventListener("click", options.addTabGroup.bind(options));
document.querySelector("#setdefaultgroup").addEventListener("click", options.setDefaultTabGroup.bind(options));
document.querySelector("#deletegroup").addEventListener("click", options.removeTabGroup.bind(options));