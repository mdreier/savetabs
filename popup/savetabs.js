const SAVED_TABS_KEY = "savedTabs";

class SaveTabs
{
	constructor()
	{
	
	}
	
	saveAllTabs()
	{
		console.log("Saving tabs");
		this._saveTabs({ currentWindow: true });
	}
	
	saveCurrentTab()
	{
		console.log("Saving current tab");
		this._saveTabs({ active: true });
	}
	
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
	
	deleteTabs()
	{
		console.log("Deleting tabs");
		browser.storage.local
			.remove([ SAVED_TABS_KEY ])
			.then(() => console.log("Tabs deleted"))
			.then(() => window.close())
			.catch(this._logError);
	}
	
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
	
	_collectUrls(tabs)
	{
		let urls = [];
		for (let tab of tabs)
		{
			urls.push(tab.url);
		}
		return urls;
	}
	
	_storeUrls(urls)
	{
		return browser.storage.local.set({
			[SAVED_TABS_KEY]: urls
		});
	}
	
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
	
	_logError(error)
	{
		console.error("Error in SaveTabs: ", error);
	}
}

SaveTabs.createHooks(document);
