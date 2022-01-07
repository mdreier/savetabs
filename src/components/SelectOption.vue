<template>
  <div>
    <input
      type="radio"
      class="stsetting"
      :id="optionId"
      :name="optionName"
      :value="optValue"
      :checked="isSelected"
      @input="optionChanged($event.target.checked)"
    />
    <label :for="optionId">{{ optionText }}</label>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

/**
 * Vue component: Single option value for select-type value. Props:
 * - options: SaveTabsOptions instance.
 * - optKey: Key of the option represented by this input element.
 * - optValue: Value represented by this input element.
 */
@Options({
  name: 'savetabs-option-select-option'
})
export default class SelectOption extends Vue {
  options: any;
  optKey!: string;
  optValue: any;

  get optionName() {
    //Name is the same for all radio buttons for the same option (radio group)
    return "stsetting-" + this.optKey;
  }
  get optionId() {
    //ID is unique for each value
    return "stsetting-" + this.optKey + "-" + this.optValue;
  }
  get optionText() {
    //Get the translation for this value
    return browser.i18n.getMessage(
      "option." + this.optKey + "." + this.optValue
    );
  }
  get isSelected() {
    //Radio button is selected if the current option value is the one handled
    // by this input element
    return this.optValue === this.options[this.optKey];
  }

  /**
   * Handle the change of the value. The change event is passed to the parent
   * component, internal data will be updated once the root component is changed.
   * @param {Boolean} isSelected true when the radio button is currently selected,
   *                             false otherwise.
   */
  optionChanged(isSelected: boolean) {
    if (isSelected) {
      this.$emit("change", this.optKey, this.optValue);
    }
  }
}
</script>