/*
 * Copyright (c) 2011-2012, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
YUI().use('mojito-loader', 'test', function(Y) {

    var suite = new Y.Test.Suite('mojito-loader-tests'),
        stashYGet, yGetPasses = true, yGetLoaded,
        A = Y.Assert,
        AA = Y.ArrayAssert,
        OA = Y.ObjectAssert;

    suite.add(new Y.Test.Case({

        setUp: function() {
            stashYGet = Y.Get;
            Y.Get = {
                script: function(scripts, cfg) {
                    if (! yGetPasses) {
                        cfg.onFailure();
                        return;
                    }
                    yGetLoaded = scripts;
                    if (typeof window !== 'undefined') {
                        cfg.onSuccess();
                    }
                    else {
                        for (var i=0; i<scripts.length; i++) {
                            cfg.onSuccess();
                        }
                    }
                }
            };
        },

        tearDown: function() {
            Y.Get = stashYGet;
        },


        'test load() succeeds': function() {
            var appConfig = {};
            var loader = new Y.mojito.Loader(appConfig);
            A.isNotUndefined(loader);
            YUI.Env.mods.y = true;

            var paths = {
                x: 'xxx.js',
                y: 'yyy.js',
                z: 'zzz.js'
            };

            yGetLoaded = [];
            loader.load(paths, function(err) {
                A.isFalse(!!err);
                AA.itemsAreEqual(['xxx.js','zzz.js'], yGetLoaded);
            });
        },


        'test load() succeeds w/out dupes': function() {
            var appConfig = {};
            var loader = new Y.mojito.Loader(appConfig);
            A.isNotUndefined(loader);

            var paths = {
                x: 'xxx.js',
                y: 'xxx.js',
                z: 'zzz.JS'
            };

            yGetLoaded = [];
            loader.load(paths, function(err) {
                A.isFalse(!!err);
                AA.itemsAreEqual(['xxx.js','zzz.JS'], yGetLoaded);
            });
        },


        'test load() fails': function() {
            var appConfig = {};
            var loader = new Y.mojito.Loader(appConfig);
            A.isNotUndefined(loader);
            YUI.Env.mods.y = true;

            var paths = {
                x: 'xxx.js',
                y: 'yyy.js',
                z: 'zzz.js'
            };

            yGetPasses = false;
            yGetLoaded = [];
            loader.load(paths, function(err) {
                A.isTrue(!!err);
            });
        },


        'ignore: test create yui-lib combo URLs': function() {
            var appConfig = {};
            var loader = new Y.mojito.Loader(appConfig);
            A.isNotUndefined(loader);
            var modules = [
                'yui',
                'collection',
                'oop',
                'dom-base',
                'selector-css2',
                'array-extras'
            ];
            var filter = 'debug';
            var got = loader.createYuiLibComboUrl(modules, filter);
            var expected = [
                'http://yui.yahooapis.com/combo?' +
                    Y.version + '/build/yui/yui-debug.js&' +
                    Y.version + '/build/yui-base/yui-base-debug.js&' +
                    Y.version + '/build/collection/collection-debug.js&' +
                    Y.version + '/build/oop/oop-debug.js&' +
                    Y.version + '/build/features/features-debug.js&' +
                    Y.version + '/build/dom-core/dom-core-debug.js&' +
                    Y.version + '/build/dom-base/dom-base-debug.js&' +
                    Y.version + '/build/selector-native/selector-native-debug.js&' +
                    Y.version + '/build/selector-css2/selector-css2-debug.js'
            ];
            AA.itemsAreEqual(expected, got.js);
            A.isArray(got.css);
        },

        'ignore: test create yui-lib combo URL with custom yui settings': function() {
            var appConfig = {
                yui: {
                    config: {
                        comboBase: "https://custom/combo?"
                    }
                }
            };
            var loader = new Y.mojito.Loader(appConfig);
            A.isNotUndefined(loader);
            var modules = [
                'autocomplete'
            ];
            var got = loader.createYuiLibComboUrl(modules);
            A.isArray(got.js);
            A.areEqual(0 , got.js[0].indexOf('https://custom/combo?'), 'the comboBase setting is not being honored');
        }

    }));

    Y.Test.Runner.add(suite);

});
