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
                if (elem.text()) {
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
                                elem.text(tr_catalog[value]);
                            }
                            else {
                                elem.attr(key, tr_catalog[value]);
                            }
                        }
                    });
                };
                $rootScope.$on('ngDjangoTranslate.language.changed', do_translate);
            }
        };
    }]);