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
    "<div class='flex-container'>\n" +
    "<input ng-change='tagsInputChange($event)' ng-keyup='$event.keyCode == 13 &amp;&amp; onEnter()' ng-model='formData.input' placeholder='Add tags...' type='text'>\n" +
    "<div class='associates'>\n" +
    "<div class='associate' ng-click='removeActiveTag(tag)' ng-repeat='tag in activeTags'>\n" +
    "<div class='circle'></div>\n" +
    "<div class='title'>{{tag.content.title}}</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='results' ng-if='formData.showAutocomplete'>\n" +
    "<div class='result' ng-class='{&#39;highlighted&#39; : highlightedTag == tag}' ng-click='selectTag(tag)' ng-mouseover='highlightTag(tag)' ng-repeat='tag in results'>\n" +
    "<div class='circle'></div>\n" +
    "<div class='title'>{{tag.content.title}}</div>\n" +
    "</div>\n" +
    "</div>\n"
  );

}]);
