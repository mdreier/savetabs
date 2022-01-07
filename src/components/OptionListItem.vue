<template>
  <li>
    {{ optValue }}
    <span v-if="optValue === optSelectedValue">*</span>
    <a
      v-if="optValue !== optSelectedValue"
      v-on:click="$emit('select', optValue)"
      href="#"
      >({{ optionSelectItemCommand }})</a
    >
    <a
      v-if="optValue !== optSelectedValue"
      v-on:click="$emit('remove', optValue)"
      href="#"
      >({{ optionRemoveItemCommand }})</a
    >
  </li>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

/**
 * Internal component for an item in a list-type option. Props are:
 * - options: Settings object.
 * - optKey: Key of the setting to be handled by this component.
 * - optValue: Value represented by this item
 */
@Options({
    name: 'savetabs-option-list-item'
})
export default class OptionListItem extends Vue {
  optionRemoveItemCommand() {
    //Get translation for the remove item button
    return browser.i18n.getMessage("removeItem");
  }

  optionSelectItemCommand() {
    //Get translation for the select item button
    return browser.i18n.getMessage("selectItem");
  }
}
</script>