/**
 * Key for array of saved tabs in local storage.
 */
const SAVED_TABS_KEY = "savedTabs";

/**
 * Key for settings in local storage.
 */
const SETTINGS_KEY = "settings";

/**
 * Key for the storage version.
 */
const STORAGE_VERSION_KEY = "storageVersion";

/**
 * Current version of the storage format.
 */
const CURRENT_STORAGE_VERSION = 2;

/**
 * Priviledged URls which cannot be opened from extensions.
 * See the documentation for <code>createProperties.url</code> in
 * <a href="https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/create"><code>tabs.create()</code></a>
 * for more information.
 */
const NON_SAVEABLE_URLS = [
	"about:config",
	"about:addons",
	"about:debugging",
	"about:reader",
	"about:downloads",
	"about:blank"
];

/**
 * Class to handle saving and storing of tabs.
 */
class SaveTabs
{
	/**
	 * Save all tabs in the current window.
	 */
	saveAllTabs()
	{
		console.log("Saving tabs");
		this._saveTabs({ currentWindow: true });
	}
	
	/**
	 * Save the currently active tab.
	 */
	saveCurrentTab()
	{
		console.log("Saving current tab");
		this._saveTabs({ active: true });
	}
	
	/**
	 * Load the currently saved tabs. 
	 *
	 * If no tabs are saved a message will be printed
	 * to the console and no action is taken.
	 */
	loadTabs()
	{
		console.log("Loading tabs");
		this._loadSettings()
			.then(() => this._migrateOldStorage())
			.then(() => this._loadStoredTabs())
			.then(this._loadUrls.bind(this))
			.then(() => console.log("Tabs restored"))
			.then(() => window.close())
			.catch(this._handleError);
	}
	
	/**
	 * Delete all tabs currently saved.
	 */
	deleteTabs()
	{
		console.log("Deleting tabs");
		browser.storage.local
			.remove([ SAVED_TABS_KEY ])
			.then(() => console.log("Tabs deleted"))
			.then(() => window.close())
			.catch(this._handleError);
	}

	/**
	 * Check if tab groups have been set up. This means that more than
	 * one tab group is configured.
	 * @returns {Promise} This promise resolves into <code>true</code> or <code>false</code> 
	 * when tab groups are available or not.
	 */
	getTabGroups()
	{
		return this._loadSettings()
			.then(() => this._settings.tabGroups);
	}

	getSelectedTabGroup()
	{
		return this._loadSettings()
			//Load selected tab group
			.then(() => this._settings.selectedTabGroup)
			//Choose first tab group if none has been selected
			.then(selectedTabGroup => selectedTabGroup ? selectedTabGroup : this._settings.tabGroups[0]);
	}

	setSelectedTabGroup(selectedTabGroup)
	{
		this._settings.selectedTabGroup = selectedTabGroup;
		this._saveSettings();
	}

	/**
	 * Save all tabs found with the given query.
	 * @param {object} tabQuery Query to select tabs to be saved. See the
	 * <a href="https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/query"><code>tabs.query()</code></a>
	 * specification at the Mozilla developer network for mode details on query options.
	 */
	_saveTabs(tabQuery)
	{
		this._loadSettings()
			.then(() => browser.tabs.query(tabQuery))
			.then(this._collectUrls.bind(this))
			.then(this._addStoredUrls.bind(this))
			.then(urls => urls.filter((elem, index, arr) => arr.indexOf(elem) == index)) //remove duplicate URLs
			.then(urls => this._storeUrls(urls))
			.then(() => console.log("Tabs saved"))
			.then(() => window.close())
			.catch(this._handleError);
	}
	
	/**
	 * Collect the URLs opened in the selected tabs.
	 * @param {array} tabs Selected tabs.
	 * @return {array} URLs currently opened in the selected tabs.
	 */
	_collectUrls(tabs)
	{
		let urls = [];
		for (let tab of tabs)
		{
			if (this._isSaveable(tab))
			{
				urls.push(tab.url);
			}
		}
		return urls;
	}
	
	/**
	 * Add currently stored URLs to the list of URLs to be saved if required by settings.
	 * @param {array} urls URLs to be saved.
	 * @return {Promise} Promise which is resolved with the correct list of URLs to be saved.
	 */
	_addStoredUrls(urls)
	{
		if (Array.isArray(urls) && urls.length > 0)
		{
			if (urls.length === 1 && this._settings.singleTabOverwrite)
			{
				//Single tab stored and overwriting is active
				return Promise.resolve(urls);
			}
			else if (urls.length > 1 && this._settings.multiTabOverwrite)
			{
				//Multiple tabs stored and overwriting is active
				return Promise.resolve(urls);
			}
			else
			{
				//Overwriting is not active, read and combine currently stored
				// tabs before saving.
				return browser.storage.local.get([SAVED_TABS_KEY])
					.then(data => data[SAVED_TABS_KEY] && Array.isArray(data[SAVED_TABS_KEY]) ? data[SAVED_TABS_KEY] : [])
					.then(savedUrls => savedUrls.concat(urls));
			}
		}
		else
		{
			return Promise.resolve(urls);
		}
	}

	/**
	 * Collect the URLs opened in the selected tabs.
	 * @param {array} urls URLs to be saved.
	 * @return {Promise} Promise which will be resolved when the data is saved.
	 * @see https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/storage/StorageArea/set
	 */
	_storeUrls(urls)
	{
		if (Array.isArray(urls) && urls.length > 0)
		{
			return browser.storage.local.set({
				[this._computeStorageKey()]: urls
			});
		} else {
			return Promise.reject("No tabs selected for saving");
		}
	}
	
	/**
	 * Load the stored tabs for the currently selected tab group.
	 * @returns {Promise} Array containing the stored URLs.
	 */
	_loadStoredTabs()
	{
		let key = this._computeStorageKey();
		return browser.storage.local.get(key)
			.then(data => data[key]);
	}

	/**
	 * Migrate storage to the latest format.
	 */
	_migrateOldStorage()
	{
		/**
		 * Migrate the content of the local storage to the current storage format.
		 * @param {Object} storage The full content of the storage.
		 */
		function migrator(storage)
		{
			console.log("Migrating storage");
			if (storage[SAVED_TABS_KEY])
			{
				//Old data exists from V1 storage version
				let key;
				if (storage[SETTINGS_KEY].tabGroups && Array.isArray(storage[SETTINGS_KEY].tabGroups))
				{
					//New tab groups setting exists, choose first tab group
					key = storage[SETTINGS_KEY].tabGroups[0];
				} else {
					//Tab group setting does not exist, create with default tab group
					key = "Default";
					storage[SETTINGS_KEY].tabGroups = [key];
				}

				if (storage[SAVED_TABS_KEY + '-' + key])
				{
					//Data already saved under default storage key
					//Use extension ID as fairly guaranteed unique ID, to avoid need for a UUID implementation
					key = 'Migration-' + runtime.id
					storage[SETTINGS_KEY].tabGroups.push(key);
				}

				storage[SAVED_TABS_KEY + '-' + key] = storage[SAVED_TABS_KEY];
				storage[STORAGE_VERSION_KEY] = 2;
				delete storage[SAVED_TABS_KEY];
			}
			console.log("Migration completed");
			return storage;
		}

		/**
		 * Migration sequence
		 * @returns {Promise} Promise is fulfilled without a value when the migration is completed.
		 */
		function migrate() {
			return browser.storage.local.get()
				.then(data => migrator(data))
				.then(data => browser.storage.local.set(data))
				.then(browser.storage.local.remove(SAVED_TABS_KEY));
		}

		return browser.storage.local.get(STORAGE_VERSION_KEY)
			.then(data => data[STORAGE_VERSION_KEY] == CURRENT_STORAGE_VERSION ? Promise.resolve() : migrate());
	}

	/**
	 * Open URLs saved in storage.
	 * @param {object} savedTabs Array containing the saved tabs.
	 * @return {Promise} The returned <code>Promise</code> is resolved once all tabs are opened and 
	 * rejected if no tabs are saved.
	 */
	_loadUrls(savedTabs)
	{
		return browser.tabs.query({ currentWindow: true }).then( (openTabs) => {
			if (savedTabs && Array.isArray(savedTabs))
			{
				let newTabPromises = [];
				for (let url of savedTabs)
				{
					if (!this._isOpen(openTabs, url))
					{
						newTabPromises.push(browser.tabs.create({ url: url }));
					}
				}
				return Promise.all(newTabPromises);
			} else {
				return Promise.reject("No saved tabs");
			}
		});
	}

	/**
	 * Check if a URL is opened in a tab.
	 * @param {array} openTabs Currently opened tabs, an array of <code>tab.Tab</code>.
	 * @param {string} url The URL to check.
	 * @return {boolean} <code>true</code> if the url is open in a tab, <code>false</code>
	 * if it is not open.
	 */
	_isOpen(openTabs, url)
	{
		for (let tab of openTabs)
		{
			if (tab.url === url)
			{
				return true;
			}
		}
		return false;
	}

	/**
	 * Load settings from local storage.
	 * @returns {object} Promise which will be resolved with the settings once they are loaded.
	 */
	_loadSettings()
	{
		return browser.storage.local.get(SETTINGS_KEY)
			.then(data => data[SETTINGS_KEY] ? data[SETTINGS_KEY] : {})
			.then(settings => this._settings = settings);
	}

	_saveSettings()
	{
		return browser.storage.local.set({
			[SETTINGS_KEY]: this._settings
		}).catch(this._handleError);
	}

	/**
	 * Log an error to the browser console and close the popup window.
	 * @param {any} error Error to be logged.
	 */
	_handleError(error)
	{
		console.error("Error in SaveTabs: ", error);
		if (error)
		{
			console.debug(error);
		}
		window.close()
	}

	/**
	 * Check if a tab can be saved. Pinned tabs and those with unopenable protocols
	 * are not stored. See the documentation for <code>createProperties.url</code> in
	 * <a href="https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/create"><code>tabs.create()</code></a>
	 * for more information about non-openable URL protocols.
	 * @param {tabs.Tab} tab Tab to be ckecked.
	 * @return {boolean} <code>true</code> if the tab can be saved, <code>false</code> otherwise.
	 */
	_isSaveable(tab)
	{
		if (tab.pinned)
		{
			//Pinned tabs should not be saved.
			return false;
		}
		//Some URLs cannot be opened and therefor not be saved
		if (NON_SAVEABLE_URLS.includes(tab.url))
		{
			return false;
		}
		//Not all protocols may be saved
		let protocol = tab.url.split(':', 1)[0];
		switch(protocol)
		{
			//Safe protocols
			case 'http':
			case 'https':
			case 'ftp':
			case 'about':
				return true;
			//Unsavable protocols
			case 'chrome':
			case 'javascript':
			case 'data':
			case 'file':
				return false;
			//No protocol specified
			case '':
				return false;
			//Unknown protocols
			default:
				return !this._settings.skipUnknownProtocols;
		}
	}

	_computeStorageKey() {
		let group = this._settings.selectedTabGroup;
		if (!group && this._settings.tabGroups && Array.isArray(this._settings.tabGroups))
		{
			group = this._settings.tabGroups[0];
		}

		if (group) {
			return SAVED_TABS_KEY + '-' + group;
		} else {
			return SAVED_TABS_KEY;
		}
	}
}
