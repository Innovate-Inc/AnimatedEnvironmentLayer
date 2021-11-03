import MapView from "esri/views/MapView";
import Map from "esri/Map";
import Point from "esri/geometry/Point";
import SpatialReference from "esri/geometry/SpatialReference";
import Basemap from "esri/Basemap";
import { AnimatedEnvironmentLayer } from "./animatedEnvironmentLayer";
import Legend from 'esri/widgets/Legend';
import FeatureLayer from 'esri/layers/FeatureLayer';
var PageSetup = /** @class */ (function () {
    function PageSetup() {
        this._dataOptions = [];
    }
    PageSetup.prototype.init = function () {
        var _this = this;
        this._initDataOptions();
        var base = Basemap.fromId("dark-gray-vector");
        this.map = new Map({
            basemap: base
        });
        this.mapView = new MapView({
            container: "map-view",
            center: new Point({ x: -122.226216, y: 41.861379, spatialReference: new SpatialReference({ wkid: 4326 }) }),
            zoom: 4,
            map: this.map,
            ui: { components: ["compass", "zoom"] }
        });
        this.mapView.ui.move("zoom", "bottom-right");
        this.mapView.ui.move("compass", "bottom-right");
        this.environmentLayer = new AnimatedEnvironmentLayer({
            id: "ael-layer",
            url: this._dataOptions[0].url,
            displayOptions: this._dataOptions[0].displayOptions
        });
        var testLayer = new FeatureLayer({ url: "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/Current_WildlandFire_Perimeters/FeatureServer/0" });
        this.map.add(testLayer);
        this.map.add(this.environmentLayer);
        //setup some event handlers to react to change of options
        document.getElementById("data-select").addEventListener("change", function (evt) { return _this._dataChange(evt.target.value); });
        document.getElementById("basemap-select").addEventListener("change", function (evt) { return _this._basemapChange(evt.target.value); });
        // subscribe to the point-report event and display the values in UI.
        var windLayerAny = this.environmentLayer;
        windLayerAny.on("point-report", function (rpt) {
            document.getElementById("direction").innerHTML = rpt.degree ? rpt.degree.toFixed(1) : "n/a";
            document.getElementById("speed").innerHTML = rpt.velocity ? rpt.velocity.toFixed(2) : "n/a";
        });
        var legend = new Legend({ view: this.mapView });
        this.mapView.ui.add(legend, "top-right");
    };
    PageSetup.prototype._dataChange = function (id) {
        var opt = undefined;
        for (var i = 0, len = this._dataOptions.length; i < len; i++) {
            if (this._dataOptions[i].id === id) {
                opt = this._dataOptions[i];
                break;
            }
        }
        if (!opt)
            return;
        this.environmentLayer.displayOptions = opt.displayOptions;
        this.environmentLayer.url = opt.url;
    };
    /**
     * Seed some options for data
     */
    PageSetup.prototype._initDataOptions = function () {
        // setup some data options
        var globalWind = {
            url: "./data/global-wind.json",
            id: "Global wind",
            displayOptions: {
                maxVelocity: 15
            },
        };
        // Make swell look different to wind
        var ausSwell = {
            url: "./data/auswave_pop_flds_combined.json",
            id: "Australian swell",
            displayOptions: {
                maxVelocity: 5,
                lineWidth: 10,
                particleAge: 30,
            }
        };
        // change up some display options to make it look different for global wind 2.
        var globalWind2 = {
            url: "./data/global-wind2.json",
            id: "Global wind 2",
            displayOptions: {
                maxVelocity: 15,
                velocityScale: 0.01,
                frameRate: 30,
                particleDensity: [{ zoom: 2, density: 10 }, { zoom: 4, density: 9 }, { zoom: 8, density: 6 }, {
                        zoom: 10,
                        density: 4
                    }, { zoom: 12, density: 3 }],
                customFadeFunction: this.customFadeFunction,
                customDrawFunction: this.customDrawFunction // a custom draw function
            }
        };
        this._dataOptions.push(globalWind);
        this._dataOptions.push(ausSwell);
        this._dataOptions.push(globalWind2);
        var select = document.getElementById("data-select");
        this._dataOptions.forEach(function (opt) {
            var element = document.createElement("option");
            element.id = opt.id;
            element.innerHTML = opt.id;
            select.appendChild(element);
        });
    };
    PageSetup.prototype.customDrawFunction = function (context, particle, colorStyle) {
        // draw a circle and make the radius a factor of the magnitude
        var radius = particle.currentVector[2] / 9;
        context.beginPath();
        context.fillStyle = colorStyle;
        context.arc(particle.x, particle.y, radius, 0, 2 * Math.PI);
        context.fill();
    };
    PageSetup.prototype.customFadeFunction = function (context, bounds) {
        // Fade existing particle trails
        context.globalCompositeOperation = "destination-in";
        context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        context.globalCompositeOperation = "lighter";
        context.globalAlpha = 0.95;
        // perhaps you don't want a trail and just want it cleared between each frame - then just use the below line.
        //context.clearRect(bounds.x, bounds.y, bounds.width, bounds.height);
    };
    PageSetup.prototype._basemapChange = function (id) {
        var bm = Basemap.fromId(id);
        this.map.basemap = bm;
    };
    return PageSetup;
}());
export { PageSetup };
//# sourceMappingURL=pageSetup.js.map