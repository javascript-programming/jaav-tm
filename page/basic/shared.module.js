import { Scheduler,WidgetHelper,AjaxHelper,DomHelper,Popup,Tooltip,Toast,BrowserHelper,StringHelper,LocaleManager,Localizable,DataGenerator,Fullscreen,Events,GlobalEvents,VersionHelper } from 'https://www.bryntum.com/examples/build/scheduler.module.js?1538392410036';

if (document.location.protocol === 'file:') {
    alert('ERROR: You must run examples on a webserver (not using the file: protocol)');
}

const hintKey      = 'preventhints-' + document.location.href,
    productName  = 'scheduler', //LEAVE AS IS, DEFAULT PRODUCT NAME
    defaultTheme = 'Default',
    browserPaths = [
        '/examples/', // In our source structure
        '/grid/', // On bryntum.com...
        '/scheduler/',
        '/gantt/'
    ];

class Shared extends Localizable(Events()) {
    //region Init

    constructor() {
        super();

        const me    = this,
            reset = document.location.href.match(/(\?|&)reset/);

        if (reset) {
            BrowserHelper.removeLocalStorageItem('exampleLanguage');
            BrowserHelper.removeLocalStorageItem('exampleTheme');
        }

        me.onResize = me.onResize.bind(me);
        me.destroyTooltips = me.destroyTooltips.bind(me);
        //me.onWindowScroll  = me.onWindowScroll.bind(me);

        me.isBrowser = browserPaths.some(path => document.location.pathname.endsWith(path)) || Boolean(document.location.pathname.match(/examples\/index.*html$/));
        // isBundled does actually mean isBabeled...
        me.isBundled = document.location.pathname.endsWith('bundle.html');
        me.developmentMode = document.location.href.match(/(\?|&)develop/);

        //if (!me.isBrowser) {
        const theme = me.qs('theme', BrowserHelper.getLocalStorageItem('exampleTheme') || defaultTheme);

        // Apply default theme first time when the page is loading
        me.applyTheme(theme, true);

        // Subscribe on locale update to save it into the localStorage
        me.localeManager.on('locale', (localeConfig) => BrowserHelper.setLocalStorageItem('exampleLanguage', localeConfig.locale.localeName));

        // Apply default locale first time when the page is loading
        me.localeManager.applyLocale(BrowserHelper.getLocalStorageItem('exampleLanguage') || LocaleManager.locale.localeName, false, true);
        //}

        const overrideRowCount = document.location.search.match(/(?:\?|&)rowCount=([^&]*)/);
        if (overrideRowCount) {
            let parts = overrideRowCount[1].split(',');
            if (parts.length === 1) {
                DataGenerator.overrideRowCount = parseInt(parts[0]);
            }
            else {
                DataGenerator.overrideRowCount = parts.map(p => parseInt(p));
            }
        }

        //<debug>
        // const positionMode    = me.qs('position', 'translate'),
        //     testPerformance = me.qs('testPerformance'),
        //     rowScrollMode   = me.qs('rowScrollMode', 'move');
        //
        // let defaultConfig = Grid.defaultConfig;
        // Object.defineProperty(Grid, 'defaultConfig', {
        //     get : () => {
        //         return Object.assign(defaultConfig, {
        //             testPerformance : testPerformance,
        //             positionMode    : positionMode,
        //             rowScrollMode   : rowScrollMode,
        //             destroyStore    : true
        //         });
        //     }
        // });
        //</debug>

        me.insertHeader();

        window.addEventListener('resize', me.onResize.bind(me));
        me.onResize();

        me.loadDescription();
        // Don't load hints for the example browser (or if viewing with ?develop)
        if (!me.isBrowser && !me.developmentMode) {
            me.loadHints();
        }

        me.initRootCause();
        me.initAnalytics();
    }

    onResize() {
        const container = document.getElementById('container');
        if (document.body.matches('.b-size-phone')) {
            const contentHeight = 667 + 60 + 20;

            if (contentHeight > document.body.offsetHeight) {
                const scale = document.body.offsetHeight / contentHeight;
                container.style.transform = `translate(-50%, -50%) scale(${scale})`;
            }
        }
        else {
            container.style.transform = '';
        }
    }

    //endregion

    //region Header with tools

    insertHeader() {
        DomHelper.insertFirst(document.getElementById('container'), {
            tag       : 'header',
            className : 'demo-header',
            html      : `
            <div id="title-container">
                <a id="title" href="${this.isBrowser ? '#' : '../'}${!this.isBrowser && this.isBundled ? 'index.umd.html' : ''}">
                    ${document.title}
                </a>
            </div>
            <div id="tools"></div>
        `
        });

        let tools = document.getElementById('tools') || document.body;

        if (Fullscreen.enabled) {
            const fullscreenButton = WidgetHelper.createWidget({
                type       : 'button',
                id         : 'fullscreen-button',
                icon       : 'b-icon b-icon-fullscreen',
                tooltip    : 'Fullscreen',
                toggleable : true,
                cls        : 'b-blue b-raised',
                appendTo   : tools,
                onToggle   : ({ pressed }) => {
                    if (pressed) {
                        Fullscreen.request(document.documentElement);
                    }
                    else {
                        Fullscreen.exit();
                    }
                }
            });

            Fullscreen.onFullscreenChange(() => {
                fullscreenButton.pressed = Fullscreen.isFullscreen;
            });
        }

        const button = this.infoButton = WidgetHelper.createWidget({
            type       : 'button',
            id         : 'info-button',
            icon       : 'b-icon b-icon-info',
            cls        : 'b-blue b-raised',
            disabled   : true,
            toggleable : true,
            tooltip    : {
                html  : 'Click to show info and switch theme or locale',
                align : 't100-b100'
            },
            preventTooltipOnTouch : true,
            appendTo              : tools
        });

        const headerTools = document.getElementById('header-tools');
        if (headerTools) {
            Array.from(headerTools.children).forEach(child => {
                tools.insertBefore(child, button);
            });
            headerTools.remove();
        }
    }

    //endregion

    //region Hints

    initHints() {
        let me = this;

        if (!me.hints || !WidgetHelper.hasAdapter) return;

        me.toolTips = [];

        let delay = me.hints.delay || 0;

        setTimeout(() =>
            Object.keys(me.hints).forEach((key, i) => {
                if (key) {
                    let target = DomHelper.down(document.body, key);
                    if (!target) return; //throw new Error(`Hint selector ${key} doesnt' match anything`);
                    setTimeout(() => {
                        if (!me.preventHints) {
                            const hint = me.hints[key];
                            me.toolTips.push(new Tooltip({
                                forElement   : target,
                                scrollAction : 'hide',
                                align        : hint.align || 't-b',
                                html         : `<div class="header">${hint.title}</div><div class="description">${hint.content}</div>`,
                                autoShow     : true,
                                cls          : 'b-hint'
                            }));
                        }
                    }, (i + 1) * 500);
                }
            }), delay);

        // Hide all hints on click anywhere, it also handles touch
        document.body.addEventListener('mousedown', this.destroyTooltips, true);

        //window.addEventListener('scroll', this.onWindowScroll, true);
    }

    // NOTE: this was commented out since it has negative effect on scrolling performance
    // onWindowScroll(e) {
    //     if (!e.target.matches('[class^=b-resize-monitor]')) {
    //         this.destroyTooltips();
    //     }
    // }

    destroyTooltips() {
        const me = this;

        me.toolTips.forEach(tip => tip.destroy());
        me.toolTips.length = 0;
        me.preventHints = true;

        document.body.removeEventListener('mousedown', me.destroyTooltips, true);
        //window.removeEventListener('scroll', me.onWindowScroll, true);
    }

    loadHints() {
        AjaxHelper.get('meta/hints.json').then(request => {
            let response = request.responseText;

            this.hints = JSON.parse(response);

            if (Object.keys(this.hints).length) this.hasHints = true;
            if (!localStorage.getItem(hintKey)) this.initHints();
        });
    }

    //endregion

    //region Description

    loadDescription() {
        const me     = this,
            button = me.infoButton,
            url    = me.isBrowser ? '_shared/browser/meta/description.html' : 'meta/description.html';

        AjaxHelper.get(url).then(request => {
            button.disabled = false;

            const locales = [];

            Object.keys(me.localeManager.locales).forEach(key => {
                const locale = me.localeManager.locales[key];
                locales.push({ value : key, text : locale.desc, data : locale });
            });

            let localeValue       = me.localeManager.locale.localeName,
                storedLocaleValue = BrowserHelper.getLocalStorageItem('exampleLanguage');

            // check that stored locale is actually available among locales for this demo
            if (storedLocaleValue && locales.some(l => l.key === storedLocaleValue)) localeValue = storedLocaleValue;

            const popup = button.popup = new Popup({
                forElement : button.element,
                anchor     : true,
                align      : 't100-b100',
                cls        : 'info-popup',
                width      : '22em',
                autoShow   : false,
                widgets    : [
                    {
                        type : 'widget',
                        html : request.responseText + (me.hints ? '<br>Click to display hints again.' : '')
                    },
                    {
                        type        : 'combo',
                        id          : 'theme-combo',
                        placeholder : 'Select theme',
                        editable    : false,
                        value       : StringHelper.capitalizeFirstLetter(BrowserHelper.getLocalStorageItem('exampleTheme') || defaultTheme),
                        hidden      : document.querySelector('link#theme-css') === null,
                        items       : [
                            ['default', 'Default'],
                            ['light', 'Light'],
                            ['dark', 'Dark'],
                            ['material', 'Material']
                        ],
                        onAction : ({ value }) => {
                            me.applyTheme(value);
                            button.popup.hide();
                        }
                    },
                    {
                        type        : 'combo',
                        id          : 'locale-combo',
                        placeholder : 'Select locale',
                        editable    : false,
                        items       : locales,
                        value       : localeValue,
                        onAction    : ({ value }) => {
                            me.localeManager.applyLocale(value);
                            Toast.show(me.L('Locale changed'));
                            button.popup.hide();
                        }
                    }].concat(me.isBrowser ? [] : [
                    {
                        type        : 'combo',
                        id          : 'size-combo',
                        placeholder : 'Select size',
                        editable    : false,
                        hidden      : me.isBrowser || productName === 'scheduler',
                        items       : [
                            { text : 'Full size', value : 'b-size-full' },
                            { text : 'Phone size', value : 'b-size-phone' }
                        ],
                        value    : 'Full size',
                        onAction : ({ value }) => {
                            if (me.curSize) document.body.classList.remove(me.curSize);
                            document.body.classList.add(value);
                            document.body.classList.add('b-change-size');
                            setTimeout(() => document.body.classList.remove('b-change-size'), 400);
                            me.curSize = value;
                            button.popup.hide();
                            // TODO: should remove this at some point
                            window.addEventListener('resize', me.onResize);
                            me.onResize();
                        }
                    },
                    {
                        type     : 'button',
                        id       : 'hintButton',
                        text     : 'Display hints',
                        cls      : 'b-blue',
                        onAction : () => {
                            button.popup.hide();
                            me.preventHints = false;
                            me.initHints();
                        }
                    },
                    {
                        type     : 'checkbox',
                        id       : 'hintCheck',
                        text     : 'Automatically',
                        cls      : 'b-blue',
                        tooltip  : 'Check to automatically display hints when loading the example',
                        checked  : !localStorage.getItem(hintKey),
                        onAction : ({ checked }) => {
                            if (checked) {
                                localStorage.removeItem(hintKey);
                            }
                            else {
                                localStorage.setItem(hintKey, true);
                            }
                        }
                    }
                ]),
                onHide : () => button.pressed = false
            });

            button.onToggle = ({ pressed }) => {
                if (pressed) {
                    if (!me.isBrowser) {
                        if (!me.hasHints) {
                            popup.widgetMap.hintButton.hide();
                            popup.widgetMap.hintCheck.hide();
                        }
                        else {
                            popup.widgetMap.hintButton.show();
                            popup.widgetMap.hintCheck.show();
                        }
                    }
                    popup.show();
                }
                else {
                    popup.hide();
                }
            };
        });
    }

    //endregion

    //region QueryString

    qs(key, defaultValue = null) {
        let regexp  = new RegExp(`(?:\\?|&)${key}=([^&]*)`),
            matches = document.location.href.match(regexp);

        if (!matches) return defaultValue;

        return matches[1];
    }

    //endregion

    //region Theme applying

    applyTheme(theme, initial = false) {
        const me = this,
            current = document.querySelector('link#theme-css'),
            link    = document.createElement('link');

        // allows us to disable theme selection for demos by not having id theme-css on any link tag
        if (!current) return;

        me.prevTheme = me.theme;
        me.theme = theme;

        if (current.href.includes(theme)) {
            // display after loading theme to not show initial transition from default theme
            document.body.style.visibility = 'visible';
            // do not reapply same theme
            return;
        }

        link.id = 'theme-css';
        link.rel = 'stylesheet';
        let url = `https://www.bryntum.com/examples/build/${productName}.${theme.toLowerCase()}.css`.toLowerCase();

        if (!me.isBrowser) {
            url = '../' + url;
        }

        link.href = url;

        BrowserHelper.setLocalStorageItem('exampleTheme', theme);

        current && link.addEventListener('load', () => {
            current.remove();
            // display after loading theme to not show initial transition from default theme
            document.body.style.visibility = 'visible';

            if (initial) {
                setTimeout(() => {
                    document.body.classList.remove('b-notransition');
                }, 100);
            }

            document.body.classList.add('b-theme-' + theme);
            document.body.classList.remove('b-theme-' + this.prevTheme);

            this.trigger('theme', { theme, prev : this.prevTheme });
            GlobalEvents.trigger('theme', { theme, prev : this.prevTheme });
        });

        // only want to block transition when doing initial apply of theme
        if (initial) {
            document.body.classList.add('b-notransition');
        }

       // document.head.insertBefore(link, document.head.firstElementChild);
    }

    //endregion

    initAnalytics() {

    }

    // region RootCause
    initRootCause() {

    }

    startRootCause() {

    }

    // endregion
}

//<debug>
// lazy debugging
setTimeout(() => {
    window.grid = bryntum.query('grid');
    window.scheduler = bryntum.query('scheduler');
    window.gantt = bryntum.query('gantt');
}, 100);
//</debug>

let shared = new Shared();

// ugly, but needed for bundled demo browser to work
window.shared = shared;

export default shared;
