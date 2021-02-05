angular.module('app').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('directives/tag_cell.html',
    "<li>\n" +
    "  <div class='self' draggable='true' drop='onDrop' ng-class='{&#39;selected&#39; : tag.selected}' ng-click='selectTag()'\n" +
    "    tag-id='tag.uuid'>\n" +
    "    {{tag.displayTitle}}\n" +
    "  </div>\n" +
    "</li>\n" +
    "<li ng-if='tag.children'>\n" +
    "  <ul>\n" +
    "    <div change-parent='changeParent()' class='tag-cell' ng-repeat='child in tag.children' on-select='onSelect()'\n" +
    "      tag='child'>\n" +
    "    </div>\n" +
    "  </ul>\n" +
    "</li>\n"
  );


  $templateCache.put('directives/tag_tree.html',
    "<div ng-if='tag'>\n" +
    "  <div class='self' draggable='true' drop='onDrop' is-draggable='!tag.master'\n" +
    "    ng-class='{&#39;selected&#39; : tag.selected}' ng-click='selectTag()' tag-id='tag.uuid'>\n" +
    "    <div class='info'>\n" +
    "      <div class='circle' ng-class='circleClassForTag(tag)'></div>\n" +
    "      <div class='title'>\n" +
    "        {{tag.displayTitle}}\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div ng-repeat='child in tag.children'>\n" +
    "    <div change-parent='changeParent()' class='tag-tree' on-select='onSelect()' tag='child'></div>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('home.html',
    "<div class='sn-component'>\n" +
    "<div class='sk-panel static full-height'>\n" +
    "<div class='sk-panel-content full-height' id='panel-content' ng-if='formData.loading'>\n" +
    "<div class='sk-panel-row full-height justify-left'>\n" +
    "<div class='sk-panel-column'>\n" +
    "<div id='title-container'>\n" +
    "<div id='title'>GitHub Push</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='vertical-rule'></div>\n" +
    "<div class='sk-panel-column'>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='title'>\n" +
    "The extension failed to load.\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='title'>\n" +
    "Please reload Standard Notes and try again.\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-content full-height' id='panel-content' ng-if='!formData.loading'>\n" +
    "<div class='sk-panel-section no-bottom-pad full-height'>\n" +
    "<div class='sk-panel-row full-height justify-left'>\n" +
    "<div class='sk-panel-column'>\n" +
    "<div id='title-container'>\n" +
    "<div id='title'>GitHub Push</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='vertical-rule'></div>\n" +
    "<div class='sk-panel-column' ng-if='!token'>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='token-form'>\n" +
    "<input autocomplete='off' class='sk-input contrast' ng-keyup='$event.keyCode == 13 &amp;&amp; submitToken();' ng-model='formData.token' placeholder='Enter GitHub token' type='text'>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-column' ng-if='token'>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='title'>{{formData.loadingRepos ? 'Loading repositories...' : 'Repository:'}}</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-row'>\n" +
    "<select class='sk-input' ng-change='didSelectRepo()' ng-if='!formData.loadingRepos' ng-model='formData.selectedRepo'>\n" +
    "<option ng-repeat='repo in repos' ng-selected='repo == formData.selectedRepo' ng-value='repo'>\n" +
    "{{repo.full_name}}\n" +
    "</option>\n" +
    "</select>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='vertical-rule'></div>\n" +
    "<div class='sk-panel-column' ng-if='!token'>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='title'>\n" +
    "Click\n" +
    "<a href='https://github.com/settings/tokens/new' target='_blank'>here</a>\n" +
    "to generate a new token.\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='title'>\n" +
    "Paste your personal access token and press Enter/Return.\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-column' id='commit-info' ng-if='formData.selectedRepo'>\n" +
    "<div class='sk-panel-row'>\n" +
    "<input class='sk-input contrast file-path' ng-model='formData.fileDirectory' placeholder='Directory'>\n" +
    "<input class='sk-input contrast file-ext' ng-model='formData.fileExtension' placeholder='Ext'>\n" +
    "<input class='sk-input contrast commit-message' ng-keyup='$event.keyCode == 13 &amp;&amp; pushChanges($event);' ng-model='formData.commitMessage' placeholder='Commit message'>\n" +
    "<div class='sk-button no-border' ng-class='pushBtnClass' ng-click='pushChanges($event)'>\n" +
    "<div class='sk-label'>{{pushStatus}}</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='vertical-rule' ng-if='formData.selectedRepo'></div>\n" +
    "<div class='sk-panel-column' ng-if='token'>\n" +
    "<div class='sk-button danger no-border' ng-click='signOut()'>\n" +
    "<div class='sk-label'>Sign out</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n"
  );

}]);
