<template>
  <div id="popup-content" class="panel">
    <div class="panel-section panel-section-list">
      <savetabs-list-item
        id="saveCurrentTab"
        icon="tab.png"
        :save-tabs="saveTabs"
      ></savetabs-list-item>
      <savetabs-list-item
        id="saveAllTabs"
        icon="tabs.png"
        :save-tabs="saveTabs"
      ></savetabs-list-item>
      <savetabs-separator></savetabs-separator>
      <savetabs-list-item
        id="loadSavedTabs"
        icon="restore.png"
        :save-tabs="saveTabs"
      ></savetabs-list-item>
      <savetabs-separator></savetabs-separator>
      <savetabs-list-item
        id="deleteSavedTabs"
        icon="delete.png"
        :save-tabs="saveTabs"
      ></savetabs-list-item>
      <template v-if="tabGroupsAvailable">
        <savetabs-separator></savetabs-separator>
        <savetabs-list-item
          id="tabGroup"
          icon="groups.png"
          :save-tabs="saveTabs"
        >
          {{ tabGroupMenu }}&nbsp;
          <select
            class="browser-style savetabs-panel-content"
            v-model="selectedTabGroup"
          >
            <option v-for="tabGroup in tabGroups" v-bind:key="tabGroup">
              {{ tabGroup }}
            </option>
          </select>
        </savetabs-list-item>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import ListItem from '@/components/ListItem.vue'
import Separator from '@/components/Separator.vue'

@Options({
  components: {
    ListItem,
    Separator
  }
})
export default class App extends Vue {}
</script>

<style>
.savetabs-panel-content {
  margin-top: 5px;
}
</style>
