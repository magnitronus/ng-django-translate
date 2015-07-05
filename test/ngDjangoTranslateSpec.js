describe('ngDjangoTranslate', function () {
    
    var provider, http;
    var mockLanguages = {'current': 1,
                        'languages': [{'code': 'en', 'name': 'English'},
                                      {'code': 'ru', 'name': 'Russian'},
                                      {'code': 'de', 'name': 'German'}]};
    var catalog_ru = {'Test': 'Тест', 'Name': 'Имя'};
    var catalog_de = {'Test': 'Prüfvorschrift', 'Name': 'Benennung'};
    
    var $compile, $q, $rootScope, $timeout, $document;
    
    beforeEach(module('ngDjangoTranslate'));
    
    beforeEach(inject(function($injector, ngDjangoTranslate, $httpBackend, _$compile_, _$q_, _$timeout_, _$document_) {
      provider = ngDjangoTranslate;
      http = $httpBackend;
      $compile = _$compile_;
      $q = _$q_;
      $rootScope = $injector.get('$rootScope');
      $timeout = _$timeout_;
      $document = _$document_;
      http.expectGET('/languages/').respond(200,mockLanguages);
      http.expectGET('/catalog/?lang=ru').respond(200, catalog_ru);
    }));
    
    
    
    
    /**
     * Create the view with translation elements to test
     * @param  {Scope} scope         A scope to bind to
     * @return {[DOM element]}       A DOM element compiled
     */
    function createView(scope) {
        var element = angular.element('<html><div id="container">'
                                     +'<span dj-translatable>Test</span>'
                                     +'<input type="text" placeholder="Name" dj-translatable="placeholder"></div>'
                                     +'<div lang-selector></div></html>');
        var elementCompiled = $compile(element)(scope);
        $rootScope.$digest();
        return elementCompiled;
    }
    
    
    it('should initialize ngDjangoTranslate', function() {                
        expect(provider).toBeDefined();
        expect(provider.is_ready()).toEqual(false);
        
        var testProvider = function(initialized_provider) {
           expect(provider.get_languages()).toEqual(mockLanguages.languages);
           var current_language = mockLanguages.languages[mockLanguages.current];
           expect(provider.get_current_language()).toEqual(current_language);
           expect(provider.get_catalog()).toEqual(catalog_ru);
           expect(provider.is_ready()).toEqual(true);
        };
        
        provider.get_loader().then(function(){
            testProvider(provider);
        });
        
        expect(http).toBeDefined();
        http.flush();

    });
    
    it('should change language', function(){
        http.expectPOST('/languages/', {lang: 'de'}).respond(200,{success:true});
        http.expectGET('/catalog/?lang=de').respond(200, catalog_de);
        
        provider.get_loader().then(function(){
            provider.set_language('de').then(function(){
                expect(provider.get_current_language()).toEqual({'code': 'de', 
                                                                 'name': 'German'});
                expect(provider.get_catalog()).toEqual(catalog_de);
            });
        });
        
        http.flush();
    });
    
    it("should correctly create the selector", function() {
        var scope = $rootScope.$new();
        var view = createView(scope);
        
        provider.get_loader().then(function(){
            $timeout(function(){
                expect(view.find('li').length).toEqual(4);
            }, 100);
            
        });
        http.flush();
        $timeout.flush();
    });
    
    it("selector should open&close dropdown", function() {
        var scope = $rootScope.$new();
        var view = createView(scope);
        
        provider.get_loader().then(function(){
            $timeout(function(){
                var dd_button = angular.element(view.find('a')[0]);
                var dd_list = angular.element(view.find('ul')[1]);
                var directiveScope = dd_list.scope();
                
                spyOn(directiveScope, 'show_dropdown').andCallThrough();
                
                //spyOn(directiveScope, 'clickOutsideHandler').andCallThrough();
                
                expect(directiveScope.show_dd).toEqual(false);
                expect(dd_list.hasClass('ng-hide')).toBe(true);
                
                dd_button.triggerHandler('click');

                expect(directiveScope.show_dropdown).toHaveBeenCalled();
                expect(directiveScope.show_dd).toEqual(true);
                expect(dd_list.hasClass('ng-hide')).toBe(false);
               
                dd_button.triggerHandler('click');
                
                expect(directiveScope.show_dropdown.calls.length).toEqual(2);
                expect(directiveScope.show_dd).toEqual(false);
                expect(dd_list.hasClass('ng-hide')).toBe(true);
                
                dd_button.triggerHandler('click');
                
                expect(directiveScope.show_dropdown.calls.length).toEqual(3);
                expect(directiveScope.show_dd).toEqual(true);
                expect(dd_list.hasClass('ng-hide')).toBe(false);
                
                //TODO: Click outside dd_list test
                
            }, 100);
            
        });
        http.flush();
        $timeout.flush();
    });

    it("should change language through selector", function() {
        var scope = $rootScope.$new();
        var view = createView(scope);
  
        provider.get_loader().then(function(){
            $timeout(function(){
                var dd_button = angular.element(view.find('a')[0]);
                var dd_list = angular.element(view.find('ul')[1]),
                    link_de = angular.element(dd_list.find('a')[0]),
                    link_en = angular.element(dd_list.find('a')[1]),
                    link_ru = angular.element(dd_list.find('a')[2]);
                var directiveScope = dd_list.scope();
                var deferredSuccess = $q.defer();
                
                http.expectPOST('/languages/', {lang: 'de'}).respond(200,{success:true});
                http.expectGET('/catalog/?lang=de').respond(200, catalog_de);
                
                spyOn(directiveScope, 'set_language').andCallThrough();
                spyOn(provider, 'set_language').andCallThrough();
    
                
                dd_button.triggerHandler('click');
                expect(directiveScope.show_dd).toEqual(true);
                link_de.triggerHandler('click');
                
                http.flush();

                expect(directiveScope.set_language).toHaveBeenCalledWith("de");
                expect(provider.set_language).toHaveBeenCalledWith("de");
                expect(provider.get_current_language().code).toEqual("de");
                expect(directiveScope.show_dd).toEqual(false);
                
                http.expectPOST('/languages/', {lang: 'ru'}).respond(200,{success:true});
                http.expectGET('/catalog/?lang=ru').respond(200, catalog_ru);

                dd_button.triggerHandler('click');
                expect(directiveScope.show_dd).toEqual(true);
                link_ru.triggerHandler('click');
                
                http.flush();

                expect(directiveScope.set_language).toHaveBeenCalledWith("ru");
                expect(provider.set_language).toHaveBeenCalledWith("ru");
                expect(provider.get_current_language().code).toEqual("ru");
                expect(directiveScope.show_dd).toEqual(false);
            }, 100);
        });
       http.flush();
       $timeout.flush();
    });
    
    it("should translate", function() {
        var scope = $rootScope.$new();
        var view = createView(scope);
        var tr_span = angular.element(view.find('span')[0]),
            tr_input = angular.element(view.find('input')[0]);
        
        expect(tr_span.text()).toEqual("Test");
        expect(tr_input.attr('placeholder')).toEqual("Name");
        
        http.expectPOST('/languages/', {lang: 'de'}).respond(200,{success:true});
        http.expectGET('/catalog/?lang=de').respond(200, catalog_de);
        
        provider.get_loader().then(function(){
            provider.set_language('de').then(function(){
                expect(tr_span.text()).toEqual("Prüfvorschrift");
                expect(tr_input.attr('placeholder')).toEqual("Benennung");
                
                http.expectPOST('/languages/', {lang: 'ru'}).respond(200,{success:true});
                http.expectGET('/catalog/?lang=ru').respond(200, catalog_ru);
                
                provider.set_language('ru').then(function(){
                    expect(tr_span.text()).toEqual("Тест");
                    expect(tr_input.attr('placeholder')).toEqual("Имя");
                });
                
            });
        });
        
        http.flush();
    });
});