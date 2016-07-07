'use strict';

/* App Module */

var home = angular.module('news',
                    ['ui.bootstrap',
                        'ngRoute',
                        'ngCookies',
                        'ngSanitize',
                        'newsDirectives',
                        'newsControllers',
                        'feeds',
                        'newsServices',
                        'newsFilters',
                        'd2Directives',
                        'd2Services',
                        'd2Controllers',
                        'pascalprecht.translate',
                    'd2HeaderBar'])

.value('DHIS2URL', '..')

.config(function ($routeProvider, $translateProvider) {


    $routeProvider.when('/', {
            templateUrl: "views/news.html",
            controller: 'newsController'
        })
        .when('/:tabs', {
            templateUrl: "views/news.html",
            controller: 'newsController'
        }).when('/analysis', {
            templateUrl: "views/analysis.html",
            controller: 'analysisController'
        })
        .otherwise('/');
    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy('escaped');
    $translateProvider.useLoader('i18nLoader');
});