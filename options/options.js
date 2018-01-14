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

/**
 * Vue component for setting with multiple options. Props are:
 * - options: Settings object.
 * - optionKey: Key of the setting to be handled by this component.
 * - optionValues: Allowed values for the setting
 * - expert: Set to true to mark as an expert setting. Expert settings 
 *           are hidden by default. Default value: false.
 */
Vue.component('savetabs-option-select', {
    props: {
        options: Object, 
        optionKey: String, 
        optionValues: Array, 
        expert: {
            type: Boolean,
            default: false
        }
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
    computed: {
        optionText: function() {
            //Get translation for the settings title
            return browser.i18n.getMessage('option.' + this.optionKey + '.text');
        },
        optionDescription: function() {
            //Get translation for the optional settings description.
            return browser.i18n.getMessage('option.' + this.optionKey + '.description');
        }
    },
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