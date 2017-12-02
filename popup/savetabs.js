/**
 * Key for array of saved tabs in local storage.
 */
const SAVED_TABS_KEY = "savedTabs";

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
			.get([ SAVED_TABS_KEY ])
			.then(this._loadUrls)
			.then(() => console.log("Tabs restored"))
			.then(() => window.close())
			.catch(this._logError);
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
			.catch(this._logError);
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
		browser.tabs
			.query(tabQuery)
			.then(this._collectUrls)
			.then(this._storeUrls)
			.then(() => console.log("Tabs saved"))
			.then(() => window.close())
			.catch(this._logError);
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
			urls.push(tab.url);
		}
		return urls;
	}
	
	/**
	 * Collect the URLs opened in the selected tabs.
	 * @param {array} urls URLs to be saved.
	 * @return {Promise} Promise which will be resolved when the data is saved.
	 * @see https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/storage/StorageArea/set
	 */
	_storeUrls(urls)
	{
		return browser.storage.local.set({
			[SAVED_TABS_KEY]: urls
		});
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
		if (savedTabs[SAVED_TABS_KEY] && Array.isArray(savedTabs[SAVED_TABS_KEY]))
		{
			let newTabPromises = [];
			for (let url of savedTabs[SAVED_TABS_KEY])
			{
				newTabPromises.push(browser.tabs.create({ url: url }));
			}
			return Promise.all(newTabPromises);
		} else {
			return Promise.reject("No saved tabs");
		}
	}
	
	/**
	 * Log an error to the browser console.
	 * @param {any} error Error to be logged.
	 */
	_logError(error)
	{
		console.error("Error in SaveTabs: ", error);
	}
}

SaveTabs.createHooks(document);
