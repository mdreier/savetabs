<template>
  <fieldset v-bind:class="{ expertsetting: expert }">
    <legend>{{ optionText }}</legend>
    <ul class="">
      <savetabs-option-list-item
        v-for="item of options[optionKey]"
        :key="item"
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
      <input v-model="newItemValue" />
      <button type="button" class="browser-style" v-on:click="createItem">
        {{ optionAddItemCommand }}
      </button>
    </p>
    <p v-if="optionDescription !== ''" v-html="optionDescription"></p>
  </fieldset>
</template>

<script lang="ts">
import SaveTabsSettings from '@/classes/settings'
import { Options } from 'vue-class-component'
import OptionBase from './OptionBase.vue'

@Options({
  name: 'savetabs-option-list'
})
export default class OptionList extends OptionBase {
  optionSelected!: keyof SaveTabsSettings;

  newItemValue: string = '';

  get optionAddItem() {
    // Get translation leading text to new item input field
    return browser.i18n.getMessage('option.' + this.optionKey + '.add')
  }

  get optionAddItemCommand() {
    // Get translation for the new item button
    return browser.i18n.getMessage('addItem')
  }

  get optionSelectedValue() {
    // Get the selected value
    return this.options[this.optionSelected]
  }

  createItem() {
    this.$emit('add', this.optionKey, this.newItemValue)
    this.newItemValue = ''
  }

  selectItem(newSelectedValue: any) {
    this.$emit('update', this.optionSelected, newSelectedValue)
  }

  removeItem(removedValue: any) {
    this.$emit('remove', this.optionKey, removedValue)
  }
}
</script>
