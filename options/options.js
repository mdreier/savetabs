/**
 * Default settings.
 */
const DEFAULT_SETTINGS = {
    singleTabOverwrite: true,
    multiTabOverwrite: true,
    skipUnknownProtocols: true
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
        this._updateRadioSet((this._settings.skipUnknownProtocols, "stsetting-unknown-skip", "stsetting-unknown-store");
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
     * Save the settings to local storage.
     */
    _saveSettings()
    {
        browser.storage.local.set({settings: this._settings})
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
            .then(settings => this._settings = settings);
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

function showExpertSettings()
{
    document.querySelectorAll(".expertsetting").forEach(elem => elem.style.display = "block");
    document.querySelector("#showexpertsettings").style.display = "none";
}

let options = new SavetabsOptions();
document.addEventListener("DOMContentLoaded", options.restore.bind(options));
document.querySelector("form").addEventListener("click", options.update.bind(options));

document.querySelector("#showexpertsettings").addEventListener("click", showExpertSettings);