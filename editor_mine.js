"use strict";
window.editors = [];
(function(editors) {
    if (typeof(ace) === 'undefined' || !ace) {
        return;
    }
    Array.from(document.querySelectorAll('.editable')).forEach(function(editable) {
        let editor = ace.edit(editable);
            editor.setOptions({
            theme: 'ace/theme/tomorrow_night',
            mode: 'ace/mode/gwion'
        });

        editable.addEventListener('mouseenter', e => {
            editor.setOptions({
                highlightActiveLine: true
            });
        });
        editable.addEventListener('mouseleave', e => {
            editor.setOptions({
                highlightActiveLine: false
            });
        });

    });
})(window.editors);
