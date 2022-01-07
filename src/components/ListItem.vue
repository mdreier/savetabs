<template>
  <div class="panel-list-item" v-on:click="selectItem">
    <div class="icon"><img v-bind:src="iconPath" /></div>
    <slot>
      <div class="text" id="loadSavedTabs">{{ text }}</div>
    </slot>
    <div class="text-shortcut"></div>
  </div>
</template>

<script lang="ts">
import SaveTabs from "@/classes/savetabs";
import { Options, Vue } from "vue-class-component";

@Options({
  name: 'savetabs-list-item'
})
export default class ListItem extends Vue {
  id!: string;
  msg!: string;
  icon!: string;
  saveTabs!: SaveTabs;

  get text() {
    return browser.i18n.getMessage(this.id);
  }

  get iconPath() {
    return '../icons/' + this.icon
  }

  selectItem() {
    if (!this.saveTabs) {
      console.error("SaveTabs instance is not available");
      return;
    }
    switch (this.id) {
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
</script>
