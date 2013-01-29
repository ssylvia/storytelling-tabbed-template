dojo.require("esri.layout");
dojo.require("esri.widgets");

dojo.requireLocalization("esriTemplate", "template");

dojo.require("esri.arcgis.utils");



var map, urlObject;

var j = 0;
var mapChange = false;
var mapExtent;
//var firstMap = false;
var _maps = [];

function initMap() {



    dojo.byId('continue').innerHTML = i18n.viewer.splash.title;
    dojo.byId('introTab').innerHTML = i18n.viewer.tabs.title;

    if (configOptions.geometryserviceurl && location.protocol === "https:") {
        configOptions.geometryserviceurl = configOptions.geometryserviceurl.replace('http:', 'https:');
    }
    esri.config.defaults.geometryService = new esri.tasks.GeometryService(configOptions.geometryserviceurl);



    if (!configOptions.sharingurl) {
        configOptions.sharingurl = location.protocol + '//' + location.host + "/sharing/content/items";
    }
    esri.arcgis.utils.arcgisUrl = configOptions.sharingurl;

    if (!configOptions.proxyurl) {
        configOptions.proxyurl = location.protocol + '//' + location.host + "/sharing/proxy";
    }

    esri.config.defaults.io.proxyUrl = configOptions.proxyurl;

    esri.config.defaults.io.alwaysUseProxy = false;

    urlObject = esri.urlToObject(document.location.href);
    urlObject.query = urlObject.query || {};

    if (urlObject.query.title) {
        configOptions.title = urlObject.query.title;
    }
    if (urlObject.query.subtitle) {
        configOptions.title = urlObject.query.subtitle;
    }
    if (urlObject.query.webmap) {
        configOptions.webmaps = getWebMaps(urlObject.query.webmap);
    }
    if (urlObject.query.bingMapsKey) {
        configOptions.bingmapskey = urlObject.query.bingMapsKey;
    }

    //is an appid specified - if so read json from there
    if (configOptions.appid || (urlObject.query && urlObject.query.appid)) {
        var appid = configOptions.appid || urlObject.query.appid;
        var requestHandle = esri.request({
            url: configOptions.sharingurl + "/" + appid + "/data",
            content: {
                f: "json"
            },
            callbackParamName: "callback",
            load: function (response) {
                if (response.values.introTitle !== undefined) {
                    configOptions.introTitle = response.values.introTitle;
                }
                if (response.values.introText !== undefined) {
                    configOptions.introText = response.values.introText;
                }
                if (response.values.introImage !== undefined) {
                    configOptions.introImage = response.values.introImage;
                }
                if (response.values.title !== undefined) {
                    configOptions.title = response.values.title;
                }
                if (response.values.syncMaps !== undefined) {
                    configOptions.syncMaps = response.values.syncMaps;
                }
                if (response.values.webmap !== undefined) {
                    configOptions.webmaps = getWebMaps(response.values.webmap);
                }
                if (response.values.tabs !== undefined) {
                    configOptions.navigationTabs = getTabs(response.values.tabs);
                }

                createMap();
                introImgSetup();
                bannerSetup();
            },
            error: function (response) {
                var e = response.message;
                alert(i18n.viewer.errors.createMap + " : " + response.message);
            }
        });
    } else {
        createMap();
        introImgSetup();
        bannerSetup();
    }

}


function createMap() {

    $("#mapContainer").append("<div id='mapDiv" + [j] + "' class='map'></div>");

    $("#sidePanel").append("<table id='content" + [j] + "' class='sideContent'><tr><td><h3 id='title" + [j] + "' class='mapTitle'></h3></td></tr><tr><td><div id='description" + [j] + "' class='mapText'></div></td></tr><tr><td><div id='legend" + [j] + "' class='legText' style='padding-top:20px;'></div></td></tr></table>");


    var mapDeferred = esri.arcgis.utils.createMap(configOptions.webmaps[j].id, "mapDiv" + [j], {
        mapOptions: {
            slider: true,
            nav: false,
            wrapAround180: true,
            extent: mapExtent
        },
        ignorePopups: false,
        bingMapsKey: configOptions.bingmapskey
    });

    mapDeferred.addCallback(function (response) {

        dojo.byId("title" + [j]).innerHTML = response.itemInfo.item.title || "";
        dojo.byId("description" + [j]).innerHTML = response.itemInfo.item.description || "";
        map = response.map;
        eval("map" + [j] + " = response.map");
        _maps.push(response.map);
        mapExtent = map.extent;


        dojo.connect(eval("map" + [j]), "onUpdateEnd", mapLoaded);
        dojo.connect(eval("map" + [j]), "onExtentChange", syncMaps);
        dojo.connect(eval("map" + [j]), "onUpdateEnd", syncMaps);


        var layers = response.itemInfo.itemData.operationalLayers;
        if (eval("map" + [j]).loaded) {
            initUI(layers);
        } else {
            dojo.connect(eval("map" + [j]), "onLoad", function () {
                initUI(layers);
            });
        }
        //resize the map when the browser resizes
        dojo.connect(dijit.byId('map'), 'resize', eval("map" + [j]), eval("map" + [j]).resize);
    });

    mapDeferred.addErrback(function (error) {
        alert(i18n.viewer.errors.createMap + " : " + error.message);
    });



}

function initUI(layers) {
    //add chrome theme for popup
    dojo.addClass(eval("map" + [j]).infoWindow.domNode, "chrome");
    //add the scalebar 
    var scalebar = new esri.dijit.Scalebar({
        map: eval("map" + [j]),
        scalebarUnit: i18n.viewer.main.scaleBarUnits //metric or english
    });

    var layerInfo = buildLayersList(layers);

    if (layerInfo.length > 0) {
        var legendDijit = new esri.dijit.Legend({
            map: eval("map" + [j]),
            layerInfos: layerInfo
        }, 'legend' + [j]);
        legendDijit.startup();
    } else {
        dojo.byId('legend' + [j]).innerHTML = i18n.viewer.sidePanel.message;
    }

}

function buildLayersList(layers) {

    //layers  arg is  response.itemInfo.itemData.operationalLayers;
    var layerInfos = [];
    dojo.forEach(layers, function (mapLayer, index) {
        var layerInfo = {};
        if (mapLayer.featureCollection && mapLayer.type !== "CSV") {
            if (mapLayer.featureCollection.showLegend === true) {
                dojo.forEach(mapLayer.featureCollection.layers, function (fcMapLayer) {
                    if (fcMapLayer.showLegend !== false) {
                        layerInfo = {
                            "layer": fcMapLayer.layerObject,
                            "title": mapLayer.title,
                            "defaultSymbol": false
                        };
                        if (mapLayer.featureCollection.layers.length > 1) {
                            layerInfo.title += " - " + fcMapLayer.layerDefinition.name;
                        }
                        layerInfos.push(layerInfo);
                    }
                });
            }
        } else if (mapLayer.showLegend !== false && mapLayer.layerObject) {
            var showDefaultSymbol = false;
            if (mapLayer.layerObject.version < 10.1 && (mapLayer.layerObject instanceof esri.layers.ArcGISDynamicMapServiceLayer || mapLayer.layerObject instanceof esri.layers.ArcGISTiledMapServiceLayer)) {
                showDefaultSymbol = true;
            }
            layerInfo = {
                "layer": mapLayer.layerObject,
                "title": mapLayer.title,
                "defaultSymbol": showDefaultSymbol
            };
            //does it have layers too? If so check to see if showLegend is false
            if (mapLayer.layers) {
                var hideLayers = dojo.map(dojo.filter(mapLayer.layers, function (lyr) {
                    return (lyr.showLegend === false);
                }), function (lyr) {
                    return lyr.id;
                });
                if (hideLayers.length) {
                    layerInfo.hideLayers = hideLayers;
                }
            }
            layerInfos.push(layerInfo);
        }
    });
    return layerInfos;
}


function getWebMaps(webmaps) {
    if (webmaps.indexOf(',') !== -1) {
        var mapIds = webmaps.split(',');
        webmapresults = dojo.map(mapIds, function (mapId) {
            return {
                id: mapId
            };
        });
    } else {
        var previewWebMap = {
            id: webmaps
        };
        webmapresults = [previewWebMap, previewWebMap, previewWebMap];
    }
    return webmapresults;
}

function getTabs(tabs) {
    if (tabs.indexOf(',') !== -1) {
        var mapIds = tabs.split(',');
        tabresults = dojo.map(mapIds, function (mapId) {
            return {
                title: mapId
            };
        });
    } else {
        var previewTab = {
            title: tabs
        };
        tabresults = [previewTab, previewTab, previewTab];
    }
    return tabresults;
}

/*function setExtent() {
    if (configOptions.syncMaps == true) {
        if (firstMap == false) {
            mapExtent = map0.extent();
            firstMap = true;
        }
    }
}*/

function mapLoaded() {
    mapChange = true;
    $('#loadImg').hide();
    $(".links").css('cursor', 'pointer');
    $(".selected").css('cursor', 'default');
}