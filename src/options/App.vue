<template>
  <form id="savetabs-options" v-on:submit.prevent>
    <savetabs-option-select
      option-key="singleTabOverwrite"
      v-bind:options="options"
      v-bind:option-values="[true, false]"
      v-on:update="valueChanged"
    >
    </savetabs-option-select>

    <savetabs-option-select
      option-key="multiTabOverwrite"
      v-bind:options="options"
      v-bind:option-values="[true, false]"
      v-on:update="valueChanged"
    >
    </savetabs-option-select>

    <savetabs-option-list
      option-key="tabGroups"
      option-selected="tabGroupsDefault"
      v-bind:options="options"
      v-on:add="tabGroupAdded"
      v-on:remove="tabGroupRemoved"
      v-on:update="valueChanged"
    >
    </savetabs-option-list>

    <div v-if="!showExpertSettings" v-on:click="showExpertSettings = true">
      {{ showExpertSettingsText }}
    </div>

    <savetabs-option-select
      option-key="skipUnknownProtocols"
      v-bind:options="options"
      v-bind:option-values="[true, false]"
      v-on:update="valueChanged"
      v-if="showExpertSettings"
    >
    </savetabs-option-select>
  </form>
</template>

<script lang="ts">
import SaveTabsOptions from "@/classes/savetabsOptions";
import SaveTabsSettings from "@/classes/settings";
import { isRef } from "@vue/reactivity";
import { Vue } from "vue-class-component";

let saveTabsOptions = new SaveTabsOptions();

export default class App extends Vue {
  /**
   * Options object will be filled asynchronously after loading
   */
  options!: SaveTabsSettings;

  /**
   * Default for visibility of expert settings
   */
  showExpertSettings: boolean = false;

  /**
   * Message for the button to show expert settings
   */
  showExpertSettingsText = browser.i18n.getMessage("showExpertSettings");

  /**
   * Value of a setting has been changed. Triggers saving of the settings.
   * @param {String} optionKey Key of the setting which was changed.
   * @param {*} newValue New value of the setting.
   */
  valueChanged(optionKey: keyof SaveTabsSettings, newValue: any) {
    //Typecast to make TypeScript compiler happy
    (this.options as any)[optionKey] = newValue;
    saveTabsOptions.update(this.options);
  }
  /**
   * A new value has been added to a setting. Triggers saving of the settings.
   * @param {String} optionKey Key of the setting which was changed.
   * @param {*} newValue Value that has been added to the setting.
   */
  tabGroupAdded(optionKey: 'tabGroups', newValue: any) {
    if (this.options[optionKey]) {
      this.options[optionKey].push(newValue);
    }
    saveTabsOptions.update(this.options);
  }
  /**
   * A value has been removed from a setting. Triggers saving of the settings.
   * @param {String} optionKey Key of the setting which was changed.
   * @param {*} oldValue Value that has been removed from the setting.
   */
  tabGroupRemoved(optionKey: 'tabGroups', oldValue: any) {
    var oldIndex = this.options[optionKey].indexOf(oldValue);
    if (oldIndex >= 0) {
      this.options[optionKey].splice(oldIndex, 1);
      if (this.options.selectedTabGroup === oldValue) {
        this.options.selectedTabGroup = this.options[optionKey][0];
      }
      saveTabsOptions.update(this.options);
    }
    saveTabsOptions.removeStoredTabGroupData(oldValue);
  }

  /**
   * Lifecycle method hook. Load settings after the root component
   * has been initialized.
   */
  created() {
    saveTabsOptions.restore().then((options) => {if (options) {this.options = options}});
  }
}
</script>

<style>
.expertsetting {
  display: none;
}

#addgroupdata {
  display: none;
}

#grouperror {
  display: none;
  color: #ff6666;
}
</style>
