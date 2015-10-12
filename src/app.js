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
                                defferer.resolve(thisModule.languages[thisModule.current_language]);
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