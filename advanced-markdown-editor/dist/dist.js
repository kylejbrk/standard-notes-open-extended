document.addEventListener("DOMContentLoaded",(function(){let e,t,i,n,o=new ComponentRelay({targetWindow:window,onReady:()=>{document.body.classList.add(o.platform),document.body.classList.add(o.environment)}}),d=!1,a=!0;function s(){function t(){const e=window.easymde;if(e){if(e.isPreviewActive())return"preview";if(e.isSideBySideActive())return"split"}return"edit"}const i=e;o.saveItemWithPresave(i,(()=>{i.clientData={mode:t()}}))}o.streamContextItem((o=>{if(o.uuid!==i&&(t=null,a=!0,i=o.uuid,n=o.clientData),e=o,!o.isMetadataUpdate&&window.easymde&&(o.content.text!==t&&(d=!0,window.easymde.value(o.content.text),d=!1),a)){a=!1,window.easymde.codemirror.getDoc().clearHistory();const e=n&&n.mode;"preview"===e?window.easymde.isPreviewActive()||window.easymde.togglePreview():"split"===e?window.easymde.isSideBySideActive()||window.easymde.toggleSideBySide():window.easymde.isPreviewActive()&&window.easymde.togglePreview()}})),window.easymde=new EasyMDE({element:document.getElementById("editor"),autoDownloadFontAwesome:!1,spellChecker:!1,status:!1,shortcuts:{toggleSideBySide:"Cmd-Alt-P"},toolbar:[{className:"fa fa-eye",default:!0,name:"preview",noDisable:!0,title:"Toggle Preview",action:function(){window.easymde.togglePreview(),s()}},{className:"fa fa-columns",default:!0,name:"side-by-side",noDisable:!0,noMobile:!0,title:"Toggle Side by Side",action:function(){window.easymde.toggleSideBySide(),s()}},"|","heading","bold","italic","strikethrough","|","quote","code","|","unordered-list","ordered-list","|","clean-block","|","link","image","|","table"]});try{window.easymde.toggleFullScreen()}catch(e){console.log("Error:",e)}window.easymde.codemirror.setOption("viewportMargin",100),window.easymde.codemirror.on("change",(function(){if(!d&&e){const i=e;o.saveItemWithPresave(i,(()=>{t=window.easymde.value();let e=function(e,t=90){return e.length<=t?e:e.substring(0,t)+"..."}(function(e){const t=document.implementation.createHTMLDocument("New").body;return t.innerHTML=e,t.textContent||t.innerText||""}(window.easymde.options.previewRender(window.easymde.value())));i.content.preview_plain=e,i.content.preview_html=null,i.content.text=t}))}}))}));
//# sourceMappingURL=dist.js.map