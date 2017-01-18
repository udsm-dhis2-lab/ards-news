'use strict';

/* App Module */

var home = angular.module('news',
                    ['ui.bootstrap',
                        'ngRoute',
                        'ngCookies',
                        'ngSanitize',
                        'highcharts-ng',
                        'ngCsv',
                        'newsDirectives',
                        'chartServices',
                        'newsControllers',
                        'newsServices',
                        'newsFilters',
                        'multi-select-tree',
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
        .when('/:tab/menu/:menuId/favourite/:favourite', {
            templateUrl: "views/analysis.html",
            controller: 'analysisController'
        })
        .when('/:tab/menu/:menuId/favourite/:favourite/period/:period/orgunit/:orgunit/dx/:dx/type/:type/category/:category', {
            templateUrl: "views/analysis.html",
            controller: 'analysisDataController'
        })
        .otherwise('/');
    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy('escaped');
    $translateProvider.useLoader('i18nLoader');
});