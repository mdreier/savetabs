/**
 * Vue component: Single option value for select-type value. Props:
 * - options: SaveTabsOptions instance.
 * - optKey: Key of the option represented by this input element.
 * - optValue: Value represented by this input element.
 */
let SelectOption = {
    props: ['options', 'optKey', 'optValue'],
    template: '<div>\
                 <input type="radio" class="stsetting" \
                     :id="optionId" \
                     :name="optionName" \
                     :value="optValue" \
                     :checked="isSelected" \
                     @input="optionChanged($event.target.checked)" \
                 />\
                 <label :for="optionId">{{ optionText }}</label>\
               </div>',
    data: function() {
        return {
            //Copy option value to internal state
            optionValue: this.optValue
        }
    },
    computed: {
        optionName: function()  {
            //Name is the same for all radio buttons for the same option (radio group)
            return 'stsetting-' + this.optKey;
        },
        optionId: function() {
            //ID is unique for each value
            return 'stsetting-' + this.optKey + '-' + this.optValue;
        },
        optionText: function() {
            //Get the translation for this value
            return browser.i18n.getMessage('option.' + this.optKey + '.' + this.optValue);
        },
        isSelected: function() {
            //Radio button is selected if the current option value is the one handled
            // by this input element
            return this.optValue === this.options[this.optKey];
        }
    },
    methods: {
        /**
         * Handle the change of the value. The change event is passed to the parent
         * component, internal data will be updated once the root component is changed.
         * @param {Boolean} isSelected true when the radio button is currently selected,
         *                             false otherwise.
         */
        optionChanged: function(isSelected) {
            if (isSelected)
            {
                this.$emit("change", this.optKey, this.optValue);
            }
        }
    }
};

let OptionBase = {
    props: {
        options: Object, 
        optionKey: String,
        expert: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        optionText: function() {
            //Get translation for the settings title
            return browser.i18n.getMessage('option.' + this.optionKey + '.text');
        },
        optionDescription: function() {
            //Get translation for the optional settings description.
            return browser.i18n.getMessage('option.' + this.optionKey + '.description');
        }
    }
};

/**
 * Vue component for setting with multiple options. Props are:
 * - options: Settings object.
 * - optionKey: Key of the setting to be handled by this component.
 * - optionValues: Allowed values for the setting
 * - expert: Set to true to mark as an expert setting. Expert settings 
 *           are hidden by default. Default value: false.
 */
Vue.component('savetabs-option-select', {
    mixins: [OptionBase],
    props: {
        optionValues: Array, 
    },
    template: ' <fieldset v-bind:class="{ expertsetting: expert }">\
                    <legend>{{ optionText }}</legend>\
                    <savetabs-option-select-option v-for="optValue of optionValues" \
                        :key="optValue" \
                        :options="options" \
                        :opt-key="optionKey" \
                        :opt-value="optValue" \
                        @change="valueChanged" \
                    ></savetabs-option-select-option>\
                    <p v-if="optionDescription !== \'\'" v-html="optionDescription"></p>\
                </fieldset>',
    components: {
        /**
         * Select option component is only used inside the selection group.
         */
        'savetabs-option-select-option': SelectOption
    },
    methods: {
        /**
         * Handle the change of the value. The change event is passed to the parent
         * component, internal data will be updated once the root component is changed.
         * @param {String} optionKey Key of the setting which was updated.
         * @param {*} newValue The new value of the setting.
         */
        valueChanged: function(optionKey, newValue)
        {
            this.$emit("update", optionKey, newValue);
        }
    }
});

/**
 * Internal component for an item in a list-type option. Props are:
 * - options: Settings object.
 * - optKey: Key of the setting to be handled by this component.
 * - optValue: Value represented by this item
 */
let OptionListItem = {
    props: {
        options: Object,
        optKey: String,
        optValue: String,
        optSelectedValue: String
    },
    template: ` <li>
                    {{ optValue }}
                    <span v-if="optValue === optSelectedValue">*</span>
                    <a v-if="optValue !== optSelectedValue" v-on:click="$emit('select', optValue)" href="#">({{ optionSelectItemCommand }})</a>
                    <a v-if="optValue !== optSelectedValue" v-on:click="$emit('remove', optValue)" href="#">({{ optionRemoveItemCommand }})</a>
                </li>`,
    computed: {
        optionRemoveItemCommand: function() {
            //Get translation for the new item button
            return browser.i18n.getMessage('removeItem');
        },
        optionSelectItemCommand: function() {
            //Get translation for the new item button
            return browser.i18n.getMessage('selectItem');
        }
    }
};

/**
 * Vue component for list-type setting. Users can add or remove values. Props are:
 * - options: Settings object.
 * - optionKey: Key of the setting to be handled by this component.
 * - optionSelected: Key of the setting which holds the selected value
 * - expert: Set to true to mark as an expert setting. Expert settings 
 *           are hidden by default. Default value: false.
 */
Vue.component('savetabs-option-list', {
    mixins: [OptionBase],
    props: {
        optionSelected: String
    },
    data: function() {
        return {
            newItemValue: ""
        }
    },
    template: ` <fieldset v-bind:class="{ expertsetting: expert }">
                    <legend>{{ optionText }}</legend>
                    <ul class="">
                        <savetabs-option-list-item v-for="item of options[optionKey]" 
                            :options="options"
                            :opt-key="optionKey"
                            :opt-value="item"
                            :opt-selected-value="optionSelectedValue"
                            @select="selectItem"
                            @remove="removeItem"
                        ></savetabs-option-list-item>
                    </ul>
                    <p class="browser-style">
                        {{ optionAddItem }}:&nbsp;
                        <input v-model="newItemValue"></input>
                        <button type="button" class="browser-style" v-on:click="createItem">{{ optionAddItemCommand }}</button>
                    </p>
                    <p v-if="optionDescription !== ''" v-html="optionDescription"></p>
                </fieldset>`,
    components: {
        /**
         * List item is only used inside the list.
         */
        'savetabs-option-list-item': OptionListItem
    },
    computed: {
        optionAddItem: function() {
            //Get translation leading text to new item input field
            return browser.i18n.getMessage('option.' + this.optionKey + '.add');
        },
        optionAddItemCommand: function() {
            //Get translation for the new item button
            return browser.i18n.getMessage('addItem');
        },
        optionSelectedValue: function() {
            //Get the selected value
            return this.options[this.optionSelected];
        }
    },
    methods: {
        createItem: function() {
            this.$emit("add", this.optionKey, this.newItemValue)
            this.newItemValue = "";
        },
        selectItem: function(newSelectedValue) {
            this.$emit("update", this.optionSelected, newSelectedValue);
        },
        removeItem: function(removedValue) {
            this.$emit("remove", this.optionKey, removedValue);
        }
    }
});

let saveTabsOptions = new SaveTabsOptions();

//Create Vue root instance after document has completed loading
window.addEventListener('load', function () {
    var vm = new Vue({
        //Bind Vue to the settings form
        el: '#savetabs-options',
        data: {
            //Options object will be filled asynchronously after loading
            options: {},
            //Default for visibility of expert settings
            showExpertSettings: false,
            //Message for the button to show expert settings
            showExpertSettingsText: browser.i18n.getMessage('showExpertSettings')
        },
        methods: {
            /**
             * Value of a setting has been changed. Triggers saving of the settings.
             * @param {String} optionKey Key of the setting which was changed.
             * @param {*} newValue New value of the setting.
             */
            valueChanged: function(optionKey, newValue)
            {
                this.options[optionKey] = newValue;
                saveTabsOptions.update(this.options);
            },
            /**
             * A new value has been added to a setting. Triggers saving of the settings.
             * @param {String} optionKey Key of the setting which was changed.
             * @param {*} newValue Value that has been added to the setting.
             */
            valueAdded: function(optionKey, newValue)
            {
                this.options[optionKey].push(newValue);
                saveTabsOptions.update(this.options);
            },
            /**
             * A value has been removed from a setting. Triggers saving of the settings.
             * @param {String} optionKey Key of the setting which was changed.
             * @param {*} oldValue Value that has been removed from the setting.
             */
            valueRemoved: function(optionKey, oldValue)
            {
                var oldIndex = this.options[optionKey].indexOf(oldValue);
                if (oldIndex >= 0)
                {
                    this.options[optionKey].splice(oldIndex, 1);
                    saveTabsOptions.update(this.options);
                }
            }
        },
        /**
         * Lifecycle method hook. Load settings after the root component
         * has been initialized.
         */
        created: function()
        {
            saveTabsOptions.restore().then(options => this.options = options);
        }
    });
});