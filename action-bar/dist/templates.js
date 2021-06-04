angular.module('app').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('directives/tag_cell.html',
    "<li>\n" +
    "<div class='self' draggable='true' drop='onDrop' ng-class='{&#39;selected&#39; : tag.selected}' ng-click='selectTag()' tag-id='tag.uuid'>\n" +
    "{{tag.displayTitle}}\n" +
    "</div>\n" +
    "</li>\n" +
    "<li ng-if='tag.children'>\n" +
    "<ul>\n" +
    "<div change-parent='changeParent()' class='tag-cell' ng-repeat='child in tag.children' on-select='onSelect()' tag='child'></div>\n" +
    "</ul>\n" +
    "</li>\n"
  );


  $templateCache.put('directives/tag_tree.html',
    "<div ng-if='tag'>\n" +
    "<div class='self' draggable='true' drop='onDrop' is-draggable='!tag.master' ng-class='{&#39;selected&#39; : tag.selected}' ng-click='selectTag()' tag-id='tag.uuid'>\n" +
    "<div class='info'>\n" +
    "<div class='circle' ng-class='circleClassForTag(tag)'></div>\n" +
    "<div class='title'>\n" +
    "{{tag.displayTitle}}\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div ng-repeat='child in tag.children'>\n" +
    "<div change-parent='changeParent()' class='tag-tree' on-select='onSelect()' tag='child'></div>\n" +
    "</div>\n" +
    "</div>\n"
  );


  $templateCache.put('home.html',
    "<div class='sn-component'>\n" +
    "<div class='sk-panel static'>\n" +
    "<div class='sk-panel-content' id='panel-content'>\n" +
    "<div class='sk-panel-section'>\n" +
    "<div class='sk-panel-row' id='main-content'>\n" +
    "<div class='sk-panel-column meta'>\n" +
    "<div class='title' ng-click='note.showId = !note.showId'>{{note.content.title}}</div>\n" +
    "<div class='created' ng-if='note.showId'>ID {{note.uuid}}</div>\n" +
    "<div class='created'>Created on {{createdAt}}</div>\n" +
    "<div class='created'>Updated on {{updatedAt}}</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-column info-sections'>\n" +
    "<div class='section'>\n" +
    "<div class='title'>Words</div>\n" +
    "<div class='info-content'>{{wordCount}}</div>\n" +
    "</div>\n" +
    "<div class='section'>\n" +
    "<div class='title'>Paragraphs</div>\n" +
    "<div class='info-content'>{{paragraphCount}}</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-column info-sections'>\n" +
    "<div class='section'>\n" +
    "<div class='title'>Characters</div>\n" +
    "<div class='info-content'>{{characterCount}}</div>\n" +
    "</div>\n" +
    "<div class='section'>\n" +
    "<div class='title'>Read Time</div>\n" +
    "<div class='info-content'>{{readTime}}</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-column sk-segmented-buttons'>\n" +
    "<div class='sk-button sk-secondary-contrast' ng-click='buttonPressed(&#39;date&#39;)' title='Copy the current date to the clipboard'>\n" +
    "<div class='sk-label'>{{copiedDate ? \"Copied to Clipboard\" : \"Copy Date\"}}</div>\n" +
    "</div>\n" +
    "<div class='sk-button sk-secondary-contrast' ng-click='buttonPressed(&#39;duplicate&#39;)' title='Create a copy of the note'>\n" +
    "<div class='sk-label'>Duplicate</div>\n" +
    "</div>\n" +
    "<div class='sk-button sk-secondary-contrast' ng-click='buttonPressed(&#39;copy&#39;)' title='Copy the note&#39;s text to the clipboard'>\n" +
    "<div class='sk-label'>{{copyText || \"Copy\"}}</div>\n" +
    "</div>\n" +
    "<div class='sk-button sk-secondary-contrast' ng-click='buttonPressed(&#39;save&#39;)' title='Save the note as a file'>\n" +
    "<div class='sk-label'>Save</div>\n" +
    "</div>\n" +
    "<div class='sk-button sk-secondary-contrast' ng-click='buttonPressed(&#39;email&#39;)' title='Start a new email with the note&#39;s text'>\n" +
    "<div class='sk-label'>Email</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n"
  );

}]);
