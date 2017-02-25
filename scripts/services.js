/* global angular, dhis2 */

'use strict';

/* Services */

var homeServices = angular.module('newsServices', ['ngResource']);

homeServices.service('homeService', ['$http', 'DHIS2URL', function ($http, DHIS2URL) {
    var home = this;
    home.baseUrl = DHIS2URL;
    home._appPrograms = [];
    home._tabProgram = null;
    home._tabContentProgram = null;
    home._smsProgram = null;
    home.parentOrganisationUnit = null;
    home.getParentOrgUnit = function () {
        var url = "../../../api/organisationUnits.json?paging=false&&filter=level:eq:1";
        return $http.get(url).then(handleSuccess, handleError('Error loading parent org unit groups'));
    }


    home.getPrograms = function () {
        var url = "../../../api/programs.json?filter=programType:eq:WITHOUT_REGISTRATION&filter=name:ilike:home&&paging=false&fields=id,name,version,categoryCombo[id,isDefault,categories[id]],programStages[id,version,programStageSections[id],programStageDataElements[dataElement[id,optionSet[id,version]]]]";
        return $http.get(url).then(handleSuccess, handleError('Error loading data elements groups'));
    }
    home.getCharts = function () {
        var url = "../../../api/charts.json?paging=false";
        return $http.get(url).then(handleSuccess, handleError('Error loading favourite charts'));
    }

    home.listExternalLink = function () {

        var url = "../../../api/dataStore/linksStorage/externalLinks";
        return $http({method: 'GET', url: url}).then(handleSuccess, handleError("Error list external links"));
    }

    home.checkSession = function(){
        setInterval(function(){
            $http.get("../../../api/me.json").then(function(myJsonObject){
                if (typeof myJsonObject.data == "string"){
                    window.location.href = "../../../dhis-web-commons/security/login.action";
                }
            },function(){

            });
        }, 2000);
    }


    home.getDocuments = function (charts) {
        // save document to storage
        var documents = [];
        var url = "../../../api/dataStore/documentStorage/documents";
        return $http({
            method: 'POST',
            data: documents,
            url: url
        }).then(handleSuccess, handleError("Error getting documents"));
    }


    home.saveCharts = function (charts) {
        // save charts to storage
        var modifiedCharts = [];
        angular.forEach(charts, function (chartValue, chartIndex) {
            modifiedCharts.push({id: chartValue.id, name: chartValue.displayName});
        });
        var url = "../../../api/dataStore/chartsStorage/availableCharts";
        return $http({
            method: 'PUT',
            data: modifiedCharts,
            url: url
        }).then(handleSuccess, handleError("Error storing adding charts"));
    }


    home.saveSelectedCharts = function (charts) {
        // save charts to storage
        var modifiedCharts = [];
        angular.forEach(charts, function (chartValue, chartIndex) {

            modifiedCharts.push({id: chartValue.id, name: chartValue.displayName});
        });
        var url = "/" + dhis2.settings.baseUrl + "api/dataStore/chartsStorage/selectedCharts";
        return $http({
            method: 'POST',
            data: modifiedCharts,
            url: url
        }).then(handleSuccess, handleError("Error storing adding charts"));
    }

    home.refineCharts = function (charts) {
        var newCharts = [];
        angular.forEach(charts, function (newChart, oldChart) {

            newCharts.push(eval("(" + newChart + ")"));
            newCharts.push(JSON.parse((newChart)));
        });
        return newCharts;
    }


    home.getSelectedCharts = function (charts) {
        var url = "/" + dhis2.settings.baseUrl + "/api/dataStore/chartsStorage/selectedCharts";
        return $http({method: 'GET', data: charts, url: url}).then(handleSuccess, handleError("Error getting charts"));
    }


    home.getPageTemplates = function (orientation, page) {
        var templates = "";
        if (page == "home") {

            if (orientation == "left") {
                templates = "views/menus/leftmenu.html";
            }

            if (orientation == "center") {
                templates = "views/partials/home.html";
            }

            if (orientation == "right") {
                templates = "views/menus/rightmenu.html";
            }

        } else {

            if (orientation == "left") {
                templates = "views/menus/leftmenu_home.html";
            }
            if (orientation == "center") {
                templates = "views/partials/home_home.html";
            }
            if (orientation == "right") {
                templates = "views/menus/rightmenu_home.html";
            }

        }


        return templates;
    }

    home.getTabs = function () {
        var url = "../../../api/dataStore/articles/tabs";
        return $http({method: 'GET', url: url}).then(handleSuccess, handleError("Error getting tabs"));
    }

    home.getTabContent = function () {

        var url = "../../../api/dataStore/articles/tabContents";
        return $http({method: 'GET', url: url}).then(handleSuccess, handleError("Error getting tab contents"));
    }


    home.getMessages = function () {
        return home.retrieveMessages();
    }

    home.addMessage = function (settingObject) {

        return home.postSettings(settingObject);
    }


    home.loadEvent = function (eventObject) {
        var url = "../../../api/events.json?orgUnit=" + home.parentOrganisationUnit + "&program=" + eventObject.id + "&paging=false";
        return $http.get(url).then(handleSuccess, handleError('Error loading external links'));
    }


    home.getDataDimension = function (analytics, dataArray) {
        var dx = analytics.metaData.dx;
        var names = analytics.metaData.names;
        var datadimensions = [];

        angular.forEach(dx, function (value) {
            if (names[value]) {
                datadimensions.push({name: names[value], id: value});
            }
        });

        angular.forEach(datadimensions, function (dimensionValue, index) {

            angular.forEach(dataArray, function (dataValue) {
                if (dataValue == dimensionValue.id) {

                    datadimensions[index].isExpanded = false;
                    datadimensions[index].isActive = false;
                    datadimensions[index].selected = true;
                }
            });
        });

        return datadimensions;
    }

    home.getSelectionCriterias = function (item, selectedItems, selectedType, newUrl) {

        var organisationUnit = "";
        var period = "";
        var data = "";
        var category = "";
        var type = "";

        if (selectedType == "orgUnit" && selectedItems.length > 0) {
            angular.forEach(selectedItems, function (item) {
                organisationUnit += item.id + ";";
            })

        }

        if (selectedType == "period" && selectedItems.length > 0) {
            angular.forEach(selectedItems, function (item) {
                period += item.value + ";";
            })
        }

        if (selectedType == "data" && selectedItems.length > 0) {
            angular.forEach(selectedItems, function (item) {
                data += item.id + ";";
            })
        }


        if (selectedType == "category" && selectedItems.length > 0) {
            console.log(selectedItems)
            angular.forEach(selectedItems, function (item) {
                category = item.id;
            })
        }


        var extractingCategory = newUrl.split('/category/');
        var extractingType = extractingCategory[0].split('/type/');
        var extractingDx = extractingType[0].split('/dx/');
        var extractingOrgUnit = extractingDx[0].split('/orgunit/');
        var extractingPeriod = extractingOrgUnit[0].split('/period/');

        if (organisationUnit == "") {
            organisationUnit = extractingOrgUnit[1];
        }
        if (data == "") {
            data = extractingDx[1];
        }
        if (period == "") {
            period = extractingPeriod[1];
        }

        if (category == "") {
            category = extractingCategory[1];
        }
        if (type == "") {
            type = extractingType[1];
        }

        return {
            newUrl: extractingPeriod[0] + '/period/' + period + '/orgunit/' + organisationUnit + '/dx/' + data + '/type/' + type + '/category/' + category,
            category: category
        }

    }

    home.prepareUrlForChange = function (url, param, paramValue) {
        var extractingCategory = url.split('/category/');
        var extractingType = url.split('/type/');
        var extractingDx = extractingType[0].split('/dx/');
        var extractingOrgUnit = extractingDx[0].split('/orgunit/');
        var extractingPeriod = extractingOrgUnit[0].split('/period/');

        var category = extractingCategory[1];

        var organisationUnit = extractingOrgUnit[1];


        var data = extractingDx[1];

        var period = extractingPeriod[1];


        return {newUrl: extractingPeriod[0] + '/period/' + period + '/orgunit/' + organisationUnit + '/dx/' + data + '/type/' + paramValue + '/category/' + category};
    }

    home.setSelectedCategory = function (dataArray, category) {
        angular.forEach(dataArray, function (value, index) {
            if (value.id == category) {
                dataArray[index].isExpanded = false;
                dataArray[index].isActive = false;
                dataArray[index].selected = true;
            }
        });

        return dataArray;
    }


    home.loadChartStorage = function () {

        var url = "../../../api/dataStore/chartsStorage/availableCharts";
        return $http.get(url).then(handleSuccess, handleError("Error loading Messages"));
    }

    home.loadInformations = function () {

        var url = "../../../api/dataStore/informationSharing/sharing";
        return $http.get(url).then(handleSuccess, handleError("Error loading Information sharing"));
    }


    home.retrieveMessages = function () {
        var url = "../../../api/dataStore/messages/textMessages";
        return $http.get(url).then(handleSuccess, handleError("Error loading Messages"));
    };

    home.getReportTables = function () {
        var url = "../../../api/reportTables.json?fields=:all&paging=false";
        return $http.get(url).then(handleSuccess, handleError("Error Loading favourites"));
    }

    home.prepareLeftMenu = function (reportTables) {

        var mainmenu = new Array();
        var menuarr = [{'name': "Agriculture", values: []}, {'name': "Livestock", values: []}, {
            'name': "Fishery",
            values: []
        }, {'name': "Trade", values: []}, {'name': "General Information", values: []}];
        var arrayCounter = 0;


        angular.forEach(reportTables, function (value) {
            var arr = value.displayName.split(':');
            if (arr.length != 1) {
                angular.forEach(menuarr, function (menuValue) {
                    if (arr[0] == menuValue.name) {
                        var filterDimension = "pe";
                        if (value.filterDimensions.length > 0) {
                            filterDimension = value.filterDimensions[0];
                        }
                        menuValue.values.push({
                            id: value.id,
                            displayName: arr[1],
                            shortName: arr[1].substring(0, 20) + "...",
                            period: home.preparePeriodFromReportTables(value),
                            orgUnit: home.prepareOrgUnitFromReportTables(value),
                            dx: home.prepareDxFromReportTables(value),
                            filter: filterDimension
                        });
                    }
                })

            }
        });

        return menuarr;

    }

    home.preparePeriodFromReportTables = function (reportTable) {
        var hasRelativePeriod = false;
        var relativePeriod = "";


        angular.forEach(reportTable.relativePeriods, function (rIsSelected, rPeriod) {

            if (rIsSelected) {
                hasRelativePeriod = rIsSelected;
                relativePeriod = rPeriod;
            }

        });

        var period = "";

        if (hasRelativePeriod) {

            var periods = home.getAppropiateRelativePeriod(relativePeriod);
            if (periods) {
                var periodLength = periods.length;
            } else {
                return false
            }

            angular.forEach(periods, function (value) {

                if (periodLength > 1) {
                    period += ";"
                }

                period += value;
            });
        }
        else {
            var periodLength = reportTable.periods.length;

            angular.forEach(reportTable.periods, function (value) {

                if (periodLength > 1) {
                    period += ";"
                }

                period += value.id;
            });
        }


        return period;

    }

    home.getAppropiateRelativePeriod = function (relativePeriod) {

        var periodGroups = {

            "lastMonth": {
                populate: function () {
                    var date = new Date();
                    var thisYear = date.getFullYear();
                    var thisMonth = date.getMonth();
                    var newYear = thisYear;
                    var newMonth = thisMonth;
                    if (newMonth == 1) {
                        newMonth = 12;
                        newYear -= 1;
                    } else {
                        newMonth -= 1;
                    }
                    if (newMonth < 10) {
                        newMonth = "0" + newMonth;
                    }
                    var lastMonth = newYear + newMonth;
                    this.list.push(lastMonth);
                    return this.list;
                }, list: []
            },
            "last3Months": {
                populate: function () {
                    var date = new Date();
                    var thisYear = date.getFullYear();
                    var thisMonth = date.getMonth();
                    var newYear = thisYear;
                    var newMonth = thisMonth;

                    var counter = 0;
                    for (var counter = 0; counter < 3; counter++) {
                        if (newMonth == 1) {
                            newMonth = 12;
                            newYear -= 1;
                        } else {
                            newMonth -= 1;
                        }

                        if (newMonth < 10) {
                            newMonth = "0" + newMonth;
                        }
                        var lastMonth = newYear + newMonth;
                        this.list.push(lastMonth);

                    }


                    return this.list;
                }, list: []
            },


            "last12Months": {
                populate: function () {
                    var date = new Date();
                    var thisYear = date.getFullYear();
                    var thisMonth = date.getMonth();
                    var newYear = thisYear;
                    var newMonth = thisMonth;


                    for (var counter = 0; counter < 12; counter++) {
                        newMonth -= 1;
                        if (newMonth == 0) {
                            newMonth = 12;
                            newYear -= 1;
                        }
                        if (newMonth < 10) {
                            newMonth = "0" + newMonth;
                        }
                        var newPeriod = newYear + "" + newMonth;
                        this.list.push(newPeriod);

                    }

                    return this.list;
                }, list: []
            },
            "lastQuarter": {
                populate: function () {
                    var date = new Date();
                    var thisYear = date.getFullYear();
                    var thisMonth = date.getMonth();
                    var thisQuarter = home.getQuarterInDate(date);
                    var newQuarter = thisQuarter;

                    var counter = 0;

                    for (var counter = 0; counter < 1; counter++) {
                        if (thisQuarter == 1) {
                            newQuarter = 4;
                            thisYear -= 1;
                        } else {
                            newQuarter -= 1;
                        }

                        this.list.push(thisYear + "Q" + newQuarter);
                    }
                    return this.list;
                }, list: []
            },
            "last4Quarters": {
                populate: function () {
                    var date = new Date();
                    var thisYear = date.getFullYear();
                    var thisQuarter = home.getQuarterInDate(date);
                    var newQuarter = thisQuarter;

                    var counter = 0;

                    for (var counter = 0; counter < 4; counter++) {
                        if (thisQuarter == 1) {
                            newQuarter = 4;
                            thisYear -= 1;
                        } else {
                            newQuarter -= 1;
                        }

                        this.list.push(thisYear + "Q" + newQuarter);
                    }
                    return this.list;
                }, list: []
            },
            "last5FinancialYears": {
                populate: function () {
                    var date = new Date();
                    var thisYear = date.getFullYear();

                    var counter = 0;

                    for (var counter = 0; counter < 5; counter++) {
                        thisYear -= 1;

                        this.list.push(thisYear + "July");

                    }
                    return this.list;
                }, list: []
            },
            "lastFinancialYear": {
                populate: function () {
                    var date = new Date();
                    var thisYear = date.getFullYear();

                    var counter = 0;

                    for (var counter = 0; counter < 1; counter++) {
                        thisYear -= 1;

                        this.list.push(thisYear + "July");

                    }
                    return this.list;
                }, list: []
            }
        }

        return periodGroups[relativePeriod].populate();
    }

    home.getQuarterInDate = function (date) {

        date = date || new Date(); // If no date supplied, use today
        var q = [1, 2, 3, 4];
        return q[Math.floor(date.getMonth() / 3)];

    }

    home.prepareOrgUnitFromReportTables = function (reportTable) {

        var organisationUnitsLength = reportTable.organisationUnits.length;
        var organisationUnits = "";

        if (organisationUnitsLength > 0) {
            angular.forEach(reportTable.organisationUnits, function (value) {

                if (organisationUnitsLength > 1) {
                    organisationUnits += ";"
                }

                organisationUnits += value.id;
            });
        }
        else {
            var selectedOrganisationUnit = home.getSelectedOrganisationUnit(reportTable);
            if (selectedOrganisationUnit) {
                switch (selectedOrganisationUnit) {
                    case "userOrganisationUnit":
                        organisationUnits = home.getOrgUnit();
                        console.log(organisationUnits);
                        break;
                    case "userOrganisationUnitChildren":
                        organisationUnits = home.getOrgUnitChildren();
                        break;
                    case "userOrganisationUnitGrandChildren":
                        organisationUnits = home.getOrgUnitGrandChildren();
                        break;
                    default:
                        console.log(selectedOrganisationUnit);
                }

            }

        }


        return organisationUnits;
    }

    home.getOrgUnit = function () {
        var fromLocalStorage = eval(localStorage.getItem('userOrganisationUnits'));
        return fromLocalStorage[0].id;
    }

    home.getOrgUnitChildren = function () {
        var fromLocalStorage = eval(localStorage.getItem('userOrganisationUnits'));
        var orgUnitsUids = "";
        fromLocalStorage[0].children.forEach(function (child) {
            orgUnitsUids += ";" + child.id;
        });

        return orgUnitsUids;
    }

    home.getOrgUnitGrandChildren = function () {
        var fromLocalStorage = eval(localStorage.getItem('userOrganisationUnits'));
        var orgUnitsUids = "";
        fromLocalStorage[0].children.forEach(function (child) {
            child.children.forEach(function (grandChild) {
                orgUnitsUids += ";" + grandChild.id;
            });
        });

        return orgUnitsUids;
    }

    home.getSelectedOrganisationUnit = function (reportTable) {
        var organisationUnit = null;
        var orgUnitChoices = ['userOrganisationUnit', 'userOrganisationUnitChildren', 'userOrganisationUnitGrandChildren'];
        orgUnitChoices.forEach(function (orgUnit) {
            if (reportTable[orgUnit]) {
                organisationUnit = orgUnit;
            }
        })

        return organisationUnit;

    }

    home.prepareDxFromReportTables = function (reportTable) {

        var dataDimensionItemsLength = reportTable.dataDimensionItems.length;
        var dataDimensionItems = "";

        angular.forEach(reportTable.dataDimensionItems, function (value) {

            if (value.dataDimensionItemType == "AGGREGATE_DATA_ELEMENT") {

                dataDimensionItems += value.dataElement.id + ";"
            }


            if (value.dataDimensionItemType == "INDICATOR") {

                dataDimensionItems += value.indicator.id + ";"
            }
        });
        dataDimensionItems = dataDimensionItems.substring(0, dataDimensionItems.length - 1);

        return dataDimensionItems;
    }

    home.getAnalytics = function (url) {

        return $http.get(url).then(handleSuccess, handleError('Error getting analytics'));

    }

    home.sortOrganisationUnits = function (orgUnit, orgUnitArray) {

        angular.forEach(orgUnitArray, function (unitData) {

            if (unitData == orgUnit.id) {
                orgUnit.isExpanded = false;
                orgUnit.isActive = false
                orgUnit.selected = true;

            }

        })

        var that = this;
        if (orgUnit.children) {
            orgUnit.children.sort(function (child1, child2) {
                return orgUnitFunction(child1).localeCompare(orgUnitFunction(child2));
            });
            orgUnit.children.forEach(function (child) {
                that.sortOrganisationUnits(child, orgUnitArray);
            })
        }
    }

    home.loggedUser = function () {
        var url = "../../../api/me.json";
        return $http.get(url).then(handleSuccess, handleError('Error loading logeged in user'));
    }

    home.getOrgUnitTree = function (userOrgUnit) {
        var orgUnitIds = [];
        userOrgUnit.forEach(function (orgUnit) {
            orgUnitIds.push(orgUnit.id);
        });
        return $http.get("../../../api/organisationUnits.json?filter=id:in:[" + orgUnitIds + "]&fields=id,name,level,children[id,name,level,children[id,name,level,children[id,name,level,children[id,name,level,children]]]]");

    }

    home.getUsers = function () {
        var url = "../../../api/users.json?paging=false";
        return $http.get(url).then(handleSuccess, handleError('Error loading users'));
    }

    home.loggedUserRole = function () {
        var url = "../../../api/me/authorization.json";
        return $http.get(url).then(handleSuccess, handleError('Error loading logeged in user'));
    }

    home.processUsers = function (users) {
        var finalUsers = []
        angular.forEach(users, function (user, index) {
            user.icon = "<i class='fa fa-user'></i>";
            finalUsers.push(user);
        })

        return finalUsers;
    }
    function orgUnitFunction(child) {
        return child.name;
    }

    return home;
}]);

homeServices.service('utilityService', function () {
    var utilityService = this;
    utilityService.prepareEventObject = function (assignedProgram) {
        var eventObject = {id: assignedProgram.id};

        return eventObject;
    }


    utilityService.refineTabs = function (events) {
        var tabs = [];
        var activeClass = "";
        var contentClass = "";
        angular.forEach(events, function (eventValues, eventIndexs) {
            angular.forEach(eventValues.dataValues, function (eventValue, eventIndex) {
                if (eventValue.value == "Agriculture") {
                    activeClass = "current";
                    contentClass = "show";
                } else {
                    activeClass = "";
                    contentClass = "hide";
                }
                tabs.push({
                    event: eventValues.event,
                    program: eventValues.program,
                    programStage: eventValues.programStage,
                    dataelement: eventValue.dataElement,
                    value: eventValue.value,
                    active: activeClass,
                    content: contentClass
                })

            })

        });

        return tabs;
    }

    utilityService.refineTabContent = function (events) {
        var content = [];
        var activeClass = "";
        var contentClass = "";
        angular.forEach(events, function (eventValues, eventIndexs) {
            var template = {
                id: eventValues.event,
                menu: utilityService.getValue('tz5ttCEyPhf', eventValues.dataValues),
                order: utilityService.getValue('JTvaqwY7kDy', eventValues.dataValues),
                content: utilityService.getValue('qYjGeQATsEh', eventValues.dataValues),
                shown: utilityService.getValue('xiXnJ2aTlzz', eventValues.dataValues)
            }
            content.push(template);
        })

        return content;

    }

    utilityService.refineMessage = function (message) {
        var content = [];
        var activeClass = "";
        var contentClass = "";

        angular.forEach(message.messageConversations, function (messageValues, messageIndexs) {
            //    var template = {from:utilityService.getValue('r7FUBZIK1iH',eventValues.dataValues),to:utilityService.getValue('Am2wAwoJdCV',eventValues.dataValues),subject:utilityService.getValue('QLfNQoTlAM9',eventValues.dataValues),body:utilityService.getValue('qYjGeQATsEh',eventValues.dataValues),date:eventValues.created.substring(0,10)}
            //        angular.forEach(template,function(value,index){
            //            if(index == "from"){
            //                template[index] = eval("("+value+")");
            //            }
            //        });
            messageValues.created = messageValues.created.substring(0, 10)
            content.push(messageValues);
        })
        //console.log(message.messageConversations);
        return content;

    }

    utilityService.getValue = function (element, arrayContainer) {
        var value = "";
        angular.forEach(arrayContainer, function (elementObject, elementIndex) {
            if (element == elementObject.dataElement) {
                value = elementObject.value;
            }
        });

        return value;
    }
    utilityService.prepareReportTables = function (reportTables) {

        // order the ards menus as required
        var mainmenu = new Array();
        var menuarr = ["Agriculture", "Livestock", "Fishery", "Trade", "General Information"];
        var arrayCounter = 0;
        angular.forEach(reportTables, function (value, key) {
            var arr = value.displayName.split(':');
            if (arr.length > 1) {
                if ($.inArray(arr[0], menuarr) == -1) {
                    var len = menuarr.length - 1;
                    menuarr[len] = arr[0];
                    menuarr[menuarr.length] = "General Information";
                    mainmenu[arrayCounter] = arr[0];
                    arrayCounter++;
                }
            }
        });
        return menuarr;
    }

    return utilityService;
});

function handleSuccess(res) {
    return res.data;
}

function handleError(error) {
    return function () {
        return {success: false, message: error};
    };
}