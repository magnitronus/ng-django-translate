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
