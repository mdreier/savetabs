<template>
  <fieldset v-bind:class="{ expertsetting: expert }">
    <legend>{{ optionText }}</legend>
    <savetabs-option-select-option
      v-for="optValue of optionValues"
      :key="optValue"
      :options="options"
      :opt-key="optionKey"
      :opt-value="optValue"
      @change="valueChanged"
    ></savetabs-option-select-option>
    <p v-if="optionDescription !== ''" v-html="optionDescription"></p>
  </fieldset>
</template>

<script lang="ts">
import { Options } from 'vue-class-component'
import SelectOption from '@/components/SelectOption.vue'
import OptionBase from './OptionBase.vue'

/**
 * Vue component for setting with multiple options. Props are:
 * - options: Settings object.
 * - optionKey: Key of the setting to be handled by this component.
 * - optionValues: Allowed values for the setting
 * - expert: Set to true to mark as an expert setting. Expert settings
 *           are hidden by default. Default value: false.
 */
@Options({
  name: 'savetabs-option-select',
  components: {
    SelectOption
  }
})
export default class OptionSelect extends OptionBase {
  optionValues!: Array<any>;

  /**
   * Handle the change of the value. The change event is passed to the parent
   * component, internal data will be updated once the root component is changed.
   * @param {String} optionKey Key of the setting which was updated.
   * @param {*} newValue The new value of the setting.
   */
  valueChanged(optionKey: string, newValue: any) {
    this.$emit('update', optionKey, newValue)
  }
}
</script>
