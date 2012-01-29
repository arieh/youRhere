/**************************************************************
    * youRhere v1.0 - Vanilla Plugin
    * Copyright 2012, Arieh Glazer
    * http://arieh.co.il
    * Dual licensed under the MIT or GPL Version 2 licenses.
    * Enjoy :)
***************************************************************/

(function(ns,doc) {
    function intgr(str){
        return parseInt(str,10);
    }

    function has(obj,prop){
        return Object.prototype.hasOwnProperty.call(obj,prop);
    }

    function merge(obj, params){
        var key;
        for (key in params) if (has(params,key)){
            obj[key] = params.key;
        }
    }

    function camelCase(str){
        return str.replace(/\-(\w)/g, function (strMatch, p1) {
            return p1.toUpperCase();
        });
    }


    function setStyles(el, styles, value){
        var name;

        function setStyle(name,value){
            name = camelCase(name);
            el.style[name] = styles[name];
        }

        if (value) return setStyle(styles, value);

        for (name in styles) if (has(styles,name)){
            setStyle(name,styles[name]);
        }
    }

    var getStyle, addEvent, bind, indexOf;

    getStyle = (function() {
        return function (element, cssRule){
            var str = "";
            if(document.defaultView && document.defaultView.getComputedStyle) {
                str = document.defaultView.getComputedStyle(element, "").getPropertyValue(cssRule);
            }
            else if(element.currentStyle) {
                cssRule = camelCase(cssRule);
                str = element.currentStyle[cssRule];
            }
            return str;
        };
    })();

    addEvent = 'addEventListener' in document
        ? function(el, type, fn, phase){
            el.addEventListener(type,fn,phase || false);
        }
        : function(el,type,fn,phase){
            el.attachEvent('on'+type,fn,phase);
        };

    bind = 'bind' in addEvent
        ? function(scope, fn){
            if (typeof fn == 'string') return scope[fn].bind(scope);

            return fn.bind(scope);
        }
        : function(scope, fn){
            if (typeof fn == 'string') fn = scope[fn];
            return function(){
                fn.apply(scope, arguments);
            };
        };

    indexOf = 'indexOf' in []
        ? function(arr,needle){
            return arr.indexOf(needle);
        }
        : function(arr, needle){
            var i, item;

            for (i=0; item =arr[i]; i++) if (item === needle) return i;

            return -1;
        };

    function YouAreHere(target, options){
        this.target = target;
        this.options = YouAreHere.defaultOptions;
        merge(this.options,options);

        this.elements = {};
                         
        this.bound = {
            click : bind(this,'click'),
            move  : bind(this,'move'),
            dblClick : bind(this,'dblClick')
        };

        this.setStyles();
        this.generate();
        this.attach();
    }

    YouAreHere.prototype = {
        constructor : YouAreHere,
        setStyles : function(){
            var child = this.target.firstChild;

            this.styles = {
                lineHeight : getStyle(this.target,'font-size'),
                zIndex : getStyle(this.target,'z-index')
            };

            if (this.styles.zIndex == 'auto') this.styles.zIndex = 10;

            if (getStyle(this.target,'position')=='static') setStyles(this.target,'position','relative');

            while (child){
                if (child.nodeType==1){
                    setStyles(child,{
                        'z-index' : this.styles.zIndex + 2,
                        'position' : 'relative'
                    });
                }
                child = child.nextSibling;
            }
        },

        generate : function(){
            this.elements.marker = document.createElement('div');
            this.elements.marker.className = 'yourhere-marker';

            this.elements.markerLine = document.createElement('div');
            this.elements.markerLine.className = 'yourhere-marker line';

            this.elements.tempMarker = document.createElement('div');
            this.elements.tempMarker.className = 'yourhere-marker temp';

            this.elements.style = document.createElement('style');
            this.elements.style.type = 'text/css';
            this.elements.style.appendChild( document.createTextNode(this.options.parentClass + ' ' +YouAreHere.css) );

            setStyles(this.elements.marker, {
                zIndex: this.styles.zIndex + 3,
                width: this.options.markerWidth,
                cursor: 'pointer',
                background : this.options.markerBackground,
                height: this.styles.lineHeight + 'px'
            });

            setStyles(this.elements.markerLine, {
                zIndex: this.styles.zIndex + 1,
                backgroundColor: this.options.markerLineBackground,
                opacity: this.options.markerBackgroundOpacity,
                height: this.styles.lineHeight + 'px'
            });

            setStyles(this.elements.tempMarker, {
                zIndex: this.styles.zIndex + 1,
                width: this.options.markerWidth,
                height: this.styles.lineHeight + 'px',
                top: 0,
                background: this.options.tempMarkerBackground
            });

            this.elements.style.appendChild( document.createTextNode(
                ".yourhere-marker { "+this.options.markerDirection +": -"+(intgr(this.options.markerWidth))+"px; }"
            ));

            document.getElementsByTagName('head')[0].appendChild(this.elements.style);

            this.target.appendChild(this.elements.marker);
            this.target.appendChild(this.elements.markerLine);
            this.target.appendChild(this.elements.tempMarker);
        },

        attach : function(){
            addEvent(this.target, 'click', this.bound.click);

            addEvent(this.target, 'mousemove', this.bound.move);

            addEvent(this.elements.marker, 'dblclick', this.bound.dblClick);
        },

        click : function(e){
            var el = e.target,
                elements = this.options.supportedElements,
                name = el.nodeName.toLowerCase(),
                targetOffset = this.target.offsetTop,
                lineHeight = intgr(getStyle(el,'line-hight')),
                fontSize = intgr(getStyle(el,'font-size')),
                offset,
                z,
                x,
                y
            ;

            if (indexOf(elements, name) == -1) return;

            if (!lineHeight || fontSize > lineHeight) lineHeight = fontSize;
            offset = el.offsetTop;
            z = e.pageY - offset;
            x = Math.floor(z / lineHeight);
            y = offset - targetOffset + (x * lineHeight);

            this.markerCreator(y, lineHeight);
        },

        move : function(e){
            var el = e.target,
                elements = this.options.supportedElements,
                name = el.nodeName.toLowerCase(),
                targetOffset = this.target.offsetTop,
                lineHeight = intgr(getStyle(el,'line-hight')),
                fontSize = intgr(getStyle(el,'font-size')),
                offset,
                y
            ;

            if (indexOf(elements, name) == -1) return;

            if (!lineHeight || fontSize > lineHeight) lineHeight = fontSize;

            y = e.pageY - targetOffset - lineHeight/2;

            if(e.pageY < targetOffset + lineHeight / 2 || e.pageY > this.target.offsetHeight + targetOffset) return;

            setStyles(this.elements.tempMarker,{
                top : y + 'px',
                height : lineHeight + 'px'
            });
        },

        dblClick : function(e){
            setStyles(this.elements.marker,'opacity',0);
            setStyles(this.elements.markerLine,'opacity',0);
        },

        markerCreator: function(y, lineHeight) {
            setStyles(this.elements.marker,{
                height : lineHeight + 'px',
                top : y+'px'
            });

            setStyles(this.elements.markerLine,{
                width : (this.target.offsetWidth + this.options.markerWidth) + 'px',
                height : lineHeight + 'px',
                top : y+'px'
            });
        }
    };

    YouAreHere.defaultOptions = {
        markerDirection: 'left',
        tempMarkerBackground: '#b7b7b7',
        markerLineBackground: '#FFF82A',
        markerBackgroundOpacity: '0.7',
        markerBackground: '#000',
        markerWidth: '5px',
        parentClass: '',
        supportedElements: 'h1 h2 h3 h4 h5 h6 p ul li'.split(' ')
    };

    YouAreHere.css =
        ".yourhere-marker {"
            +"position: absolute;"

            +"-webkit-transition-property: opacity, top;"
               +"-moz-transition-property: opacity, top;"
                    +"transition-property: opacity, top;"

            +"-webkit-transition-duration: 1s,1s;"
               +"-moz-transition-duration: 1s,1s;"
                    +"transition-duration: 1s,1s;"

            +"-webkit-transition-timing-function:ease-in,ease-in;"
               +"-moz-transition-timing-function:ease-in,ease-in;"
                    +"transition-timing-function:ease-in,ease-in;"
        +"}";

    this.YouAreHere = YouAreHere;
}).call(this,document);
