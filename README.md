ng-django-translate
=========================

AngularJS module for django i18n translations support. 
Work together with django module [djangular-translate](https://github.com/magnitronus/djangular-translate)


How do I add this to my project?
======================================

1) Download it or install using bower install https://github.com/magnitronus/ng-django-translate.git

2) We need to do is add a dependency to ng-django-translate module which is called ngDjangoTranslate:

    angular.module('your-app', ['ngDjangoTranslate']);
    
3) Configure provider:

    YourApp.config(function(ngDjangoTranslateProvider) {
        ngDjangoTranslateProvider.config(<your_settings_dict>);
    });


Provider configuration settings
============================

* **urls**: here is urls which you define when install django module [djangular-translate](https://github.com/magnitronus/djangular-translate). For example:     
    
    urls: { languages:'/i18n/languages/', 
      catalog:'/i18n/catalog/'
    }

* **selector_template**: Optional. Defines template for lang-selector directive.
                                        

Using
========================

Directives
------------------------

### dj-translatable

This directive specifies content that should be translated. There is two ways for using it:

1) Attribute without value:

    <span dj-translatable>Hello world!</span>
   
  In this case text "Hello world!" should be translated.
  
2) Attribute with value:

    <input name="somevalue" placeholder="Some Value" dj-translatable="placeholder">
    
  In this case placeholder "Some Value" should be translated.
  
### lang-selector

This directive transclude template of some languages dropdown list etc. You can use default template or define your own by **selector_template** option in provider settings.
