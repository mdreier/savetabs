Vue.component('savetabs-separator', {
    template: '<div class="panel-section-separator"></div>',
});

Vue.component('savetabs-list-item', {
    template: '<div class="panel-list-item">\
                 <div class="icon"><img v-bind:src="iconPath" /></div>\
                 <div class="text" id="loadSavedTabs">{{ text }}</div>\
                 <div class="text-shortcut"></div>\
               </div>',
    props: ['id', 'icon'],
    data: function() {
        return {
            text: browser.i18n.getMessage(this.id),
            iconPath: '../icons/' + this.icon
        };
    }
})

window.addEventListener('load', function () {
    var vm = new Vue({
        el: '#popup-content'
    });
})
SaveTabs.createHooks(document);
