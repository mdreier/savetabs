import SaveTabs from "../classes/savetabs.js"

/**
 * Vue Component: List separator.
 */
Vue.component('savetabs-separator', {
    template: '<div class="panel-section-separator"></div>',
});

/**
 * Vue component: List item. Takes the following properties:
 * - id: ID of the list item. Also used as a key for the translation.
 * - icon: Name if the icon to be used. The icon must be placed in the folder icons
 * - saveTabs: SaveTabs instance.
 */
Vue.component('savetabs-list-item', {
    template: '<div class="panel-list-item" v-on:click="selectItem">\
                 <div class="icon"><img v-bind:src="iconPath" /></div>\
                 <slot><div class="text" id="loadSavedTabs">{{ text }}</div></slot>\
                 <div class="text-shortcut"></div>\
               </div>',
    props: ['id', 'icon', 'saveTabs'],
    data: function() {
        return {
            text: browser.i18n.getMessage(this.id),
            iconPath: '../icons/' + this.icon
        };
    },
    methods: {
        /**
         * Handle selection of a list item. Executes a function in the
         * SaveTabs instance depending on the ID of the selected item.
         */
        selectItem: function(event)
        {
            if (!this.saveTabs)
            {
                console.error("SaveTabs instance is not available");
                return;
            }
            switch (this.id)
            {
                case "saveCurrentTab":
					this.saveTabs.saveCurrentTab();
					break;
				case "saveAllTabs":
                    this.saveTabs.saveAllTabs();
					break;
				case "loadSavedTabs":
                    this.saveTabs.loadTabs();
					break;
				case "deleteSavedTabs":
                    this.saveTabs.deleteTabs();
                    break;
                default:
                    console.warn("Item with unknown ID", this.id, "selected");
                    break;
            }
        }
    }
})

//Create Vue root instance after document has completed loading
window.addEventListener('load', function () {
    let saveTabs = new SaveTabs(); 

    var vm = new Vue({
        el: '#popup-content',
        data: {
            saveTabs: saveTabs,
            tabGroups: [],
            tabGroupMenu: browser.i18n.getMessage('tabGroup'),
            selectedTabGroupName: ""
        },
        computed: {
            tabGroupsAvailable: function() {
                return this.tabGroups && Array.isArray(this.tabGroups) && this.tabGroups.length > 1
            },
            selectedTabGroup: {
                get() {
                    return this.selectedTabGroupName;
                },
                set(selectedTabGroup) {
                    this.saveTabs.setSelectedTabGroup(selectedTabGroup);
                }
            }
        }
    });
    
    saveTabs.getTabGroups()
        .then(tabGroups => vm.$data.tabGroups = tabGroups);
    saveTabs.getSelectedTabGroup()
        .then(selectedTabGroup => vm.$data.selectedTabGroupName = selectedTabGroup);
});