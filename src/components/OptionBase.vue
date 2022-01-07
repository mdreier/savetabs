<script lang="ts">
import SaveTabsSettings from '@/classes/settings'
import { Vue } from 'vue-class-component'

export default class OptionBase extends Vue {
  options!: SaveTabsSettings;
  optionKey!: String;
  expert: boolean = false;

  get optionText() {
    // Get translation for the settings title
    return browser.i18n.getMessage('option.' + this.optionKey + '.text')
  }

  get optionDescription() {
    // Get translation for the optional settings description.
    return browser.i18n.getMessage('option.' + this.optionKey + '.description')
  }
}
</script>
