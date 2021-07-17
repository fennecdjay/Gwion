ace.define("ace/mode/gwion_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function(e, t, n) {
    "use strict";
    var interp = 0;
    var r = e("../lib/oop")
      , i = e("./text_highlight_rules").TextHighlightRules
      , s = /\\(?:[nrt0'"\\]|x[\da-fA-F]{2}|u\{[\da-fA-F]{6}\})/.source
      , o = function() {
        this.$rules = {
            start: [{
                token: "variable.other.source.gwion",
                regex: "'[a-zA-Z_][a-zA-Z0-9_]*"
            }, {
                token: "string.quoted.single.source.gwion",
                regex: "'(?:[^'\\\\]|" + s + ")'"
            }, {
                token: "identifier",
                regex: /r#[a-zA-Z_][a-zA-Z0-9_]*\b/
            }, {
                stateName: "bracketedComment",
                onMatch: function(e, t, n) {
                    return n.unshift(this.next, e.length - 1, t),
                    "string.quoted.raw.source.gwion"
                },
                regex: /r#*"/,
                next: [{
                    onMatch: function(e, t, n) {
                        var r = "string.quoted.raw.source.gwion";
                        return e.length >= n[1] ? (e.length > n[1] && (r = "invalid"),
                        n.shift(),
                        n.shift(),
                        this.next = n.shift()) : this.next = "",
                        r
                    },
                    regex: /"#*/,
                    next: "start"
                }, {
                    defaultToken: "string.quoted.raw.source.gwion"
                }]
            }, {
                token: "string.quoted.double.source.gwion",
                regex: '"',
                push: [{
                    token: "string.quoted.double.source.gwion",
                    regex: '"',
                    next: "pop"
                }, {
                    token: "constant.character.escape.source.gwion",
                    regex: s
                }, {
                    defaultToken: "string.quoted.double.source.gwion"
                }]
            }, {
                token: ["keyword.source.gwion", "text", "entity.name.function.source.gwion"],
                regex: "\\b(fn)(\\s+)((?:r#)?[a-zA-Z_][a-zA-Z0-9_]*)"
            }, {
                token: "support.constant",
                regex: "\\b[a-zA-Z_][\\w\\d]*::"
            }, {
                token: "keyword.source.gwion",
                regex: "\\b(?:abstract|defer|repeat|foreach|break|continue|const|var|late|do|else|enum|for|final|if|extends|match|case|private|protect|global|return|self|static|public|class|struct|fun|operator|funcdef|trait|union|where|when|while|new)\\b"
            }, {
                token: "storage.type.source.gwion",
                regex: "\\b(?:Self|int|float|string|Event|Object|bool|Option|Ref|Array)\\b"
            }, {
                token: "variable.language.source.gwion",
                regex: "\\b(?:self|this|me|adc|dac)\\b"
            }, {
                token: "comment.line.doc.source.gwion",
                regex: "#!!.*$"
            }, {
                token: "comment.block.source.gwion",
                regex: "#!.*!#",
            }, {
                token: "comment.line.double-dash.source.gwion",
                regex: "#!.*$"
            }, {
                token: "keyword.operator",
                regex: /\$|[-=]>|[-+%^=!&|<>~:]=?|[*/](?![*/>])=?/
            }, {
                token: "punctuation.operator",
                regex: /[?:,;.]/
            }, {
                token: "paren.lparen",
                regex: /[\[({]/
            }, {
                token: "paren.rparen",
                regex: /[\])}]/
            }, {
                token: "constant.language.source.gwion",
                regex: "\\b(?:true|false|maybe|None)\\b"
            }, {
                token: "support.constant.source.gwion",
                regex: "\\b(?:pi|EXIT_FAILURE|EXIT_SUCCESS|RAND_MAX|EOF|SEEK_SET|SEEK_CUR|SEEK_END|_IOFBF|_IONBF|_IOLBF|BUFSIZ|FOPEN_MAX|FILENAME_MAX|L_tmpnam|TMP_MAX|O_RDONLY|O_WRONLY|O_RDWR|O_APPEND|O_CREAT|O_EXCL|O_TRUNC|S_IFIFO|S_IFCHR|S_IFBLK|S_IFDIR|S_IFREG|S_IFMT|S_IEXEC|S_IWRITE|S_IREAD|S_IRWXU|S_IXUSR|S_IWUSR|S_IRUSR|F_OK|R_OK|W_OK|X_OK|STDIN_FILENO|STDOUT_FILENO|STDERR_FILENO)\\b"
            }, {
                token: "meta.preprocessor.source.gwion",
                regex : "#\\s*(?:include|require|pragma|__line__|__file__|__func__|ifdef|undef|define|undef)\\b"
            }, {
                token: "constant.numeric.source.gwion",
                regex: /\b(?:0x[a-fA-F0-9_]+|0o[0-7_]+|0b[01_]+|[0-9][0-9_]*(?!\.))(?:[iu](?:size|8|16|32|64|128))?\b/
            }, {
                token: "constant.numeric.source.gwion",
                regex: /\b(?:[0-9][0-9_]*)(?:\.[0-9][0-9_]*)?(?:[Ee][+-][0-9][0-9_]*)?(?:f32|f64)?\b/
            }]
        },
        this.normalizeRules()
    };
    o.metaData = {
        fileTypes: ["rs", "rc"],
        foldingStartMarker: "^.*\\bfn\\s*(\\w+\\s*)?\\([^\\)]*\\)(\\s*\\{[^\\}]*)?\\s*$",
        foldingStopMarker: "^\\s*\\}",
        name: "Rust",
        scopeName: "source.gwion"
    },
    r.inherits(o, i),
    t.RustHighlightRules = o
}),
ace.define("ace/mode/folding/cstyle", ["require", "exports", "module", "ace/lib/oop", "ace/range", "ace/mode/folding/fold_mode"], function(e, t, n) {
    "use strict";
    var r = e("../../lib/oop")
      , i = e("../../range").Range
      , s = e("./fold_mode").FoldMode
      , o = t.FoldMode = function(e) {
        e && (this.foldingStartMarker = new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/, "|" + e.start)),
        this.foldingStopMarker = new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + e.end)))
    }
    ;
    r.inherits(o, s),
    function() {
        this.foldingStartMarker = /([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/,
        this.foldingStopMarker = /^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/,
        this.singleLineBlockCommentRe = /^\s*(\/\*).*\*\/\s*$/,
        this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/,
        this.startRegionRe = /^\s*(\/\*|\/\/)#?region\b/,
        this._getFoldWidgetBase = this.getFoldWidget,
        this.getFoldWidget = function(e, t, n) {
            var r = e.getLine(n);
            if (this.singleLineBlockCommentRe.test(r) && !this.startRegionRe.test(r) && !this.tripleStarBlockCommentRe.test(r))
                return "";
            var i = this._getFoldWidgetBase(e, t, n);
            return !i && this.startRegionRe.test(r) ? "start" : i
        }
        ,
        this.getFoldWidgetRange = function(e, t, n, r) {
            var i = e.getLine(n);
            if (this.startRegionRe.test(i))
                return this.getCommentRegionBlock(e, i, n);
            var s = i.match(this.foldingStartMarker);
            if (s) {
                var o = s.index;
                if (s[1])
                    return this.openingBracketBlock(e, s[1], n, o);
                var u = e.getCommentFoldRange(n, o + s[0].length, 1);
                return u && !u.isMultiLine() && (r ? u = this.getSectionRange(e, n) : t != "all" && (u = null)),
                u
            }
            if (t === "markbegin")
                return;
            var s = i.match(this.foldingStopMarker);
            if (s) {
                var o = s.index + s[0].length;
                return s[1] ? this.closingBracketBlock(e, s[1], n, o) : e.getCommentFoldRange(n, o, -1)
            }
        }
        ,
        this.getSectionRange = function(e, t) {
            var n = e.getLine(t)
              , r = n.search(/\S/)
              , s = t
              , o = n.length;
            t += 1;
            var u = t
              , a = e.getLength();
            while (++t < a) {
                n = e.getLine(t);
                var f = n.search(/\S/);
                if (f === -1)
                    continue;
                if (r > f)
                    break;
                var l = this.getFoldWidgetRange(e, "all", t);
                if (l) {
                    if (l.start.row <= s)
                        break;
                    if (l.isMultiLine())
                        t = l.end.row;
                    else if (r == f)
                        break
                }
                u = t
            }
            return new i(s,o,u,e.getLine(u).length)
        }
        ,
        this.getCommentRegionBlock = function(e, t, n) {
            var r = t.search(/\s*$/)
              , s = e.getLength()
              , o = n
              , u = /^\s*(?:\/\*|\/\/|--)#?(end)?region\b/
              , a = 1;
            while (++n < s) {
                t = e.getLine(n);
                var f = u.exec(t);
                if (!f)
                    continue;
                f[1] ? a-- : a++;
                if (!a)
                    break
            }
            var l = n;
            if (l > o)
                return new i(o,r,l,t.length)
        }
    }
    .call(o.prototype)
}),
ace.define("ace/mode/gwion", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/gwion_highlight_rules", "ace/mode/folding/cstyle"], function(e, t, n) {
    "use strict";
    var r = e("../lib/oop")
      , i = e("./text").Mode
      , s = e("./gwion_highlight_rules").RustHighlightRules
      , o = e("./folding/cstyle").FoldMode
      , u = function() {
        this.HighlightRules = s,
        this.foldingRules = new o,
        this.$behaviour = this.$defaultBehaviour
    };
    r.inherits(u, i),
    function() {
        this.lineCommentStart = "//",
        this.blockComment = {
            start: "/*",
            end: "*/",
            nestable: !0
        },
        this.$quotes = {
            '"': '"'
        },
        this.$id = "ace/mode/gwion"
    }
    .call(u.prototype),
    t.Mode = u
});
(function() {
    ace.require(["ace/mode/gwion"], function(m) {
        if (typeof module == "object" && typeof exports == "object" && module) {
            module.exports = m;
        }
    });
}
)();
