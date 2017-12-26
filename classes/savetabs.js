/**
 * Key for array of saved tabs in local storage.
 */
const SAVED_TABS_KEY = "savedTabs";

/**
 * Key for settings in local storage.
 */
const SETTINGS_KEY = "settings";

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
		browser.storage.local
			.get([ SAVED_TABS_KEY, SETTINGS_KEY ])
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
	 * Create an event handler for the SaveTabs popup. The event handler reacts to clicks on the specified controls.
	 *
	 * @param {Document} document The current page shown in the popup.
	 * @param {SaveTabs} saveTabsInstance Instance of <code>SaveTabs</code> to handle the callbacks. Defaults to a new instance.
	 * @param {string} saveCurrentTabId ID of the control which triggers saving of the current tab.
	 * @param {string} saveAllTabsId ID of the control which triggers saving of all tabs in the current window.
	 * @param {string} loadTabsId ID of the control which triggers loading of saved tabs.
	 * @param {string} deleteSavedTabs ID of the control which triggers deletion of saved tabs.
	 */
	static createHooks(document, saveTabsInstance = new SaveTabs(), saveCurrentTabId = "saveCurrentTab", saveAllTabsId = "saveAllTabs", loadTabsId = "loadSavedTabs", deleteTabsId = "deleteSavedTabs")
	{
		document.addEventListener("click", (e) => {
			switch (e.target.id)
			{
				case saveCurrentTabId:
					saveTabsInstance.saveCurrentTab();
					break;
				case saveAllTabsId:
					saveTabsInstance.saveAllTabs();
					break;
				case loadTabsId:
					saveTabsInstance.loadTabs();
					break;
				case deleteTabsId:
					saveTabsInstance.deleteTabs();
					break;
			}
		});
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
			.then(this._storeUrls)
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
				[SAVED_TABS_KEY]: urls
			});
		} else {
			return Promise.reject("No tabs selected for saving");
		}
	}
	
	/**
	 * Open URLs saved in storage.
	 * @param {object} savedTabs Object containing the saved tabs. The tabs must be stored as 
	 * an array in a property named <code>[SAVED_TABS_KEY]</code>.
	 * @return {Promise} The returned <code>Promise</code> is resolved once all tabs are opened and 
	 * rejected if no tabs are saved.
	 */
	_loadUrls(savedTabs)
	{
		return browser.tabs.query({ currentWindow: true }).then( (openTabs) => {
			if (savedTabs[SAVED_TABS_KEY] && Array.isArray(savedTabs[SAVED_TABS_KEY]))
			{
				let newTabPromises = [];
				for (let url of savedTabs[SAVED_TABS_KEY])
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
		return browser.storage.local.get([SETTINGS_KEY])
			.then(data => data[SETTINGS_KEY] ? data[SETTINGS_KEY] : {})
			.then(settings => this._settings = settings);
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
				return false;
		}
	}
}
