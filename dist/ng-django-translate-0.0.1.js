/**
 * Setup of main AngularJS application.
 *
 * @see directives
 */
var module = angular.module('ngDjangoTranslate', ['ngDjangoTranslate.directives', 'templates-ngDjangoTranslate']);


module.provider('ngDjangoTranslate', function () {
        var settings = this.settings = {
            urls:{
                languages:'/languages/',
                catalog:'/catalog/'
            },
            default_lang: 'en'
        };

        this.config = function (newSettings) {
            angular.extend(settings, newSettings);
        };

        this.$get = ['$q', '$http', '$rootScope', function ($q, $http, $rootScope) {
                

                var thisModule = this;

                thisModule.loaded = false;
                
                
                var privateMethods = {
                    init: function() {
                        var defferer = $q.defer();
                        $http.get(thisModule.settings.urls.languages).then(function(resp){
                            var data = resp.data;
                            thisModule.languages = data.languages;
                            thisModule.current_language = data.current;
                            privateMethods.catalog_reload().then(function(){
                                thisModule.loaded = true;
                                thisModule.loader = null;
                                if (thisModule.languages[thisModule.current_language].code!=thisModule.settings.default_lang) {
                                    $rootScope.$broadcast('ngDjangoTranslate.language.changed');
                                }
                                defferer.resolve();
                            });
                        });
                        return defferer.promise;
                    },
                    catalog_reload: function(){
                        catalog_param = {'lang': thisModule.languages[thisModule.current_language].code};
                        return $http.get(thisModule.settings.urls.catalog,
                                      {params:catalog_param}).then(function(resp){
                                    thisModule.catalog = resp.data;
                                }
                               );
                    }
                };
                
                var publicMethods = {
                    is_ready: function(){
                        if (thisModule.loaded) return true;
                        else return false;
                    },
                    get_loader: function(){
                        return thisModule.loader;
                    },
                    get_languages: function(){
                        return thisModule.languages;
                    },
                    get_current_language:function(){
                        return thisModule.languages[thisModule.current_language];
                    },
                    get_catalog: function(){
                        return thisModule.catalog;
                    },
                    set_language: function(language_code) {
                        var defferer = $q.defer();
                        $http.post(thisModule.settings.urls.languages, 
                                        {lang:language_code}).then(function(resp){
                            var data = resp.data;
                            var i =0;
                            
                            var catalog_onreload = function() {
                                $rootScope.$broadcast('ngDjangoTranslate.language.changed');
                                defferer.resolve();
                            };
                            
                            if (data.success) {
                                while (i<thisModule.languages.length){
                                    if (thisModule.languages[i].code==language_code){
                                        thisModule.current_language = i;
                                        privateMethods.catalog_reload().then(catalog_onreload);
                                    }
                                    i++;
                                }
                            }
                        });
                        return defferer.promise;
                    },
                    settings: thisModule.settings
                };
                
                thisModule.loader = privateMethods.init();
                
                return publicMethods;
            }];
    });
/**
 * This is dj-translatable and langSelector directives.
 * 
 *
 * 
 */
var directives = angular.module('ngDjangoTranslate.directives', [])
    .directive('langSelector',['$document','$rootScope', 'ngDjangoTranslate',
                     function($document, $rootScope, ngDjangoTranslate) {
        return {
            restrict : 'AE',
            //replace: true,
            transclude : true,
            templateUrl: function(element, attributes) {
            return ngDjangoTranslate.settings.selector_template || "langselector.html";
                },
            scope: {

            },
            link : function(scope, element, attr) {
                
                var dd_id_generate = function(){ 
                    function _p8(s) {
                        var p = (Math.random().toString(16)+"000000000").substr(2,8);
                        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
                    }
                    return _p8() + _p8(true) + _p8(true) + _p8();
                };
                scope.show_dd = false;
                
                scope.dd_id = "DD-"+dd_id_generate();

                var set_languages = function(){
                    scope.languages = ngDjangoTranslate.get_languages();
                    scope.current_language = ngDjangoTranslate.get_current_language();
                };

                if (ngDjangoTranslate.is_ready()) set_languages();
                else ngDjangoTranslate.get_loader().then(set_languages);


                scope.show_dropdown = function(){
                    scope.show_dd=!scope.show_dd;
                    if (scope.show_dd) $document.bind('click', scope.clickOutsideHandler);
                    else $document.unbind('click', scope.clickOutsideHandler);
                };

                scope.lngFilterFn = function(language) {
                    return language !== scope.languages[scope.current_language];
                };

                scope.set_language = function(code) {
                    scope.show_dd = false;
                    ngDjangoTranslate.set_language(code).then(function(data){
                        scope.current_language = data;
                    });
                };

                //Handler for catch click outside dropdown and close it.
                scope.clickOutsideHandler = function(e) {
                    var i = 0,
                        element;
                    if (!e.target) return;
                    for (element = e.target; element; element = element.parentNode) {
                        var id = element.id;
                        var classNames = element.className;
                        if (angular.isDefined(id)&&id==scope.dd_id) return;
                    }
                    if (scope.show_dd) {
                        scope.show_dropdown();
                        scope.$apply();
                    }
                    };
            }
        };
    }])
    .directive('djTranslatable', ['ngDjangoTranslate','$rootScope',
                     function (ngDjangoTranslate, $rootScope) {
        return {
            restrict: 'A',
            scope : {
                djTranslatable: '@'
            },
            link: function (scope, elem, attrs) {

                scope.msg_ids = {};
                
                if (angular.isDefined(scope.djTranslatable)) {
                    var attr_names = scope.djTranslatable.split(',');
                    angular.forEach(attr_names, function(attr_name){
                        scope.msg_ids[attr_name]=attrs[attr_name];
                    });
                }
                if (elem.html()) {
                    scope.msg_ids.innerText=elem.html();
                }

                var do_translate = function() {
                    var tr_catalog = ngDjangoTranslate.get_catalog();
                    var curr_lang = ngDjangoTranslate.get_current_language();
                    var def_lang_code = ngDjangoTranslate.settings.default_lang;
                    
                    angular.forEach(scope.msg_ids, function(value, key){
                        if (curr_lang.code==def_lang_code) {
                            if (key=='innerText') {
                                elem.html(value);
                            }
                            else {
                                elem.attr(key, value);
                            }
                        }
                        else if (angular.isDefined(tr_catalog[value])){
                            if (key=='innerText') {
                                elem.html(tr_catalog[value]);
                            }
                            else {
                                elem.attr(key, tr_catalog[value]);
                            }
                        }
                    });
                };
                if (ngDjangoTranslate.is_ready()){
                    var curr_lang = ngDjangoTranslate.get_current_language();
                    var def_lang_code = ngDjangoTranslate.settings.default_lang;
                    if (curr_lang.code!=def_lang_code)  do_translate();
                }
                
                $rootScope.$on('ngDjangoTranslate.language.changed', do_translate);
            }
        };
    }]);
angular.module('templates-ngDjangoTranslate', ['langselector.html']);

angular.module("langselector.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("langselector.html",
    "<ul class=\"language_select\">\n" +
    "    <li class=\"current-language\">\n" +
    "        <a class=\"popup-button\" ng-click=\"show_dropdown()\">{$languages[current_language]['code'] | uppercase$}</a>\n" +
    "        <ul id=\"{$dd_id$}\" class=\"popup-menu\" ng-show=\"show_dd\">\n" +
    "            <li class=\"language-var\" ng-repeat=\"language in languages | filter:lngFilterFn | orderBy:'code'\">\n" +
    "\n" +
    "                <a title=\"Change to language: {$language.name$}\" class=\"language-link\" ng-click=\"set_language(language.code);\">\n" +
    "                    <span class=\"flag-16\" ng-class=\"'flag-16-'+language.code\"></span> {$language.name$}</a>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </li>\n" +
    "</ul>");
}]);
