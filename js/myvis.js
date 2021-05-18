function mpld3_load_lib(url, callback){
  var s = document.createElement('script');
  s.src = url;
  s.async = true;
  s.onreadystatechange = s.onload = callback;
  s.onerror = function(){console.warn("failed to load library " + url);};
  document.getElementsByTagName("head")[0].appendChild(s);
}

if(typeof(mpld3) !== "undefined" && mpld3._mpld3IsLoaded){
   // already loaded: just create the figure
   !function(mpld3){
       

    mpld3.register_plugin("networkxd3forcelayout", NetworkXD3ForceLayoutPlugin);
    NetworkXD3ForceLayoutPlugin.prototype = Object.create(mpld3.Plugin.prototype);
    NetworkXD3ForceLayoutPlugin.prototype.constructor = NetworkXD3ForceLayoutPlugin;
    NetworkXD3ForceLayoutPlugin.prototype.requiredProps = ["graph",
                                                                "ax_id",];
    NetworkXD3ForceLayoutPlugin.prototype.defaultProps = { coordinates: "data",
                                                               draggable: true,
                                                               gravity: 1,
                                                               charge: -30,
                                                               link_strength: 1,
                                                               friction: 0.9,
                                                               link_distance: 20,
                                                               maximum_stroke_width: 2,
                                                               minimum_stroke_width: 1,
                                                               nominal_stroke_width: 1,
                                                               maximum_radius: 10,
                                                               minimum_radius: 1,
                                                               nominal_radius: 5,
                                                            };

    function NetworkXD3ForceLayoutPlugin(fig, props){
        mpld3.Plugin.call(this, fig, props);
    };

    var color = d3.scale.category20();

    NetworkXD3ForceLayoutPlugin.prototype.zoomScaleProp = function (nominal_prop, minimum_prop, maximum_prop) {
        var zoom = this.ax.zoom;
        scalerFunction = function() {
            var prop = nominal_prop;
            if (nominal_prop*zoom.scale()>maximum_prop) prop = maximum_prop/zoom.scale();
            if (nominal_prop*zoom.scale()<minimum_prop) prop = minimum_prop/zoom.scale();
            return prop
        }
        return scalerFunction;
    }

    NetworkXD3ForceLayoutPlugin.prototype.setupDefaults = function () {

        this.zoomScaleStroke = this.zoomScaleProp(this.props.nominal_stroke_width,
                                                  this.props.minimum_stroke_width,
                                                  this.props.maximum_stroke_width)
        this.zoomScaleRadius = this.zoomScaleProp(this.props.nominal_radius,
                                                  this.props.minimum_radius,
                                                  this.props.maximum_radius)
    }

    NetworkXD3ForceLayoutPlugin.prototype.zoomed = function() {
            this.tick()
        }

    NetworkXD3ForceLayoutPlugin.prototype.draw = function(){

        plugin = this
        brush = this.fig.getBrush();

        DEFAULT_NODE_SIZE = this.props.nominal_radius;

        var height = this.fig.height
        var width = this.fig.width

        var graph = this.props.graph
        var gravity = this.props.gravity.toFixed()
        var charge = this.props.charge.toFixed()
        var link_distance = this.props.link_distance.toFixed()
        var link_strength = this.props.link_strength.toFixed()
        var friction = this.props.friction.toFixed()

        this.ax = mpld3.get_element(this.props.ax_id, this.fig)

        var ax = this.ax;

        this.ax.elements.push(this)

        ax_obj = this.ax;

        var width = d3.max(ax.x.range()) - d3.min(ax.x.range()),
            height = d3.max(ax.y.range()) - d3.min(ax.y.range());

        var color = d3.scale.category20();

        this.xScale = d3.scale.linear().domain([0, 1]).range([0, width]) // ax.x;
        this.yScale = d3.scale.linear().domain([0, 1]).range([height, 0]) // ax.y;

        this.force = d3.layout.force()
                            .size([width, height]);

        this.svg = this.ax.axes.append("g");

        for(var i = 0; i < graph.nodes.length; i++){
            var node = graph.nodes[i];
            if (node.hasOwnProperty('x')) {
                node.x = this.ax.x(node.x);
            }
            if (node.hasOwnProperty('y')) {
                node.y = this.ax.y(node.y);
            }
        }

        this.force
            .nodes(graph.nodes)
            .links(graph.links)
            .linkStrength(link_strength)
            .friction(friction)
            .linkDistance(link_distance)
            .charge(charge)
            .gravity(gravity)
            .start();

        this.link = this.svg.selectAll(".link")
            .data(graph.links)
          .enter().append("line")
            .attr("class", "link")
            .attr("stroke", "black")
            .style("stroke-width", function (d) { return Math.sqrt(d.value); });

        this.node = this.svg.selectAll(".node")
            .data(graph.nodes)
          .enter().append("circle")
            .attr("class", "node")
            .attr("r", function(d) {return d.size === undefined ? DEFAULT_NODE_SIZE : d.size ;})
            .style("fill", function (d) { return d.color; });

        this.node.append("title")
            .text(function (d) { return d.name; });

        this.force.on("tick", this.tick.bind(this));

        this.setupDefaults()
        this.conditional_features(this.svg);

    };

    NetworkXD3ForceLayoutPlugin.prototype.tick = function() {

        this.link.attr("x1", function (d) { return this.ax.x(this.xScale.invert(d.source.x)); }.bind(this))
                 .attr("y1", function (d) { return this.ax.y(this.yScale.invert(d.source.y)); }.bind(this))
                 .attr("x2", function (d) { return this.ax.x(this.xScale.invert(d.target.x)); }.bind(this))
                 .attr("y2", function (d) { return this.ax.y(this.yScale.invert(d.target.y)); }.bind(this));

        this.node.attr("transform", function (d) {
            return "translate(" + this.ax.x(this.xScale.invert(d.x)) + "," + this.ax.y(this.yScale.invert(d.y)) + ")";
            }.bind(this)
        );

    }

    NetworkXD3ForceLayoutPlugin.prototype.conditional_features = function(svg) {

        var drag = d3.behavior.drag()
                .on("dragstart", dragstarted)
                .on("drag", dragged.bind(this))
                .on("dragend", dragended);

        function dragstarted(d) {
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).classed("fixed", d.fixed = true);
            d.fixed = true;
        }

        function dblclick(d) {
          self.force.resume();
          d3.select(this).classed("fixed", d.fixed = false);
        }

        function dragged(d) {
            var mouse = d3.mouse(svg.node());
            d.x = this.xScale(this.ax.x.invert(mouse[0]));
            d.y = this.yScale(this.ax.y.invert(mouse[1]));
            d.px = d.x;
            d.py = d.y;
            d.fixed = true;
            this.force.resume();
        }

        function dragended(d) {
            d.fixed = true;
            }

        var self = this;
        if (this.props.draggable === true) {
            this.node.on("dblclick", dblclick).call(drag)
        }

    }


    
       mpld3.draw_figure("fig_el6303944499107368844826201", {"axes": [{"xlim": [0.0, 1.0], "yscale": "linear", "axesbg": "#FFFFFF", "texts": [], "zoomable": true, "images": [], "xdomain": [0.0, 1.0], "ylim": [0.0, 1.0], "paths": [], "sharey": [], "sharex": [], "axesbgalpha": null, "axes": [{"scale": "linear", "tickformat": null, "grid": {"gridOn": false}, "fontsize": 10.0, "position": "bottom", "nticks": 6, "tickvalues": null}, {"scale": "linear", "tickformat": null, "grid": {"gridOn": false}, "fontsize": 10.0, "position": "left", "nticks": 6, "tickvalues": null}], "lines": [], "markers": [], "id": "el630394450434960", "ydomain": [0.0, 1.0], "collections": [], "xscale": "linear", "bbox": [0.125, 0.125, 0.77500000000000002, 0.77500000000000002]}], "height": 288.0, "width": 432.0, "plugins": [{"type": "reset"}, {"enabled": false, "button": true, "type": "zoom"}, {"enabled": false, "button": true, "type": "boxzoom"}, {"draggable": true, "charge": -30, "link_distance": 20, "link_strength": 1, "ax_id": "el630394450434960", "graph": {"directed": false, "graph": {}, "nodes": [{"name": "Node1", "color": "red", "y": 0.25, "x": 0.25, "fixed": true, "id": 1}, {"y": 0.75, "x": 0.75, "fixed": true, "id": 2}, {"id": 3}], "links": [{"source": 0, "target": 1}, {"source": 0, "target": 2}, {"source": 1, "target": 2}], "multigraph": false}, "nominal_radius": 5, "type": "networkxd3forcelayout", "gravity": 1, "friction": 0.9}], "data": {}, "id": "el630394449910736"});
   }(mpld3);
}else if(typeof define === "function" && define.amd){
   // require.js is available: use it to load d3/mpld3
   require.config({paths: {d3: "https://mpld3.github.io/js/d3.v3.min"}});
   require(["d3"], function(d3){
      window.d3 = d3;
      mpld3_load_lib("https://mpld3.github.io/js/mpld3.v0.2.js", function(){
         

    mpld3.register_plugin("networkxd3forcelayout", NetworkXD3ForceLayoutPlugin);
    NetworkXD3ForceLayoutPlugin.prototype = Object.create(mpld3.Plugin.prototype);
    NetworkXD3ForceLayoutPlugin.prototype.constructor = NetworkXD3ForceLayoutPlugin;
    NetworkXD3ForceLayoutPlugin.prototype.requiredProps = ["graph",
                                                                "ax_id",];
    NetworkXD3ForceLayoutPlugin.prototype.defaultProps = { coordinates: "data",
                                                               draggable: true,
                                                               gravity: 1,
                                                               charge: -30,
                                                               link_strength: 1,
                                                               friction: 0.9,
                                                               link_distance: 20,
                                                               maximum_stroke_width: 2,
                                                               minimum_stroke_width: 1,
                                                               nominal_stroke_width: 1,
                                                               maximum_radius: 10,
                                                               minimum_radius: 1,
                                                               nominal_radius: 5,
                                                            };

    function NetworkXD3ForceLayoutPlugin(fig, props){
        mpld3.Plugin.call(this, fig, props);
    };

    var color = d3.scale.category20();

    NetworkXD3ForceLayoutPlugin.prototype.zoomScaleProp = function (nominal_prop, minimum_prop, maximum_prop) {
        var zoom = this.ax.zoom;
        scalerFunction = function() {
            var prop = nominal_prop;
            if (nominal_prop*zoom.scale()>maximum_prop) prop = maximum_prop/zoom.scale();
            if (nominal_prop*zoom.scale()<minimum_prop) prop = minimum_prop/zoom.scale();
            return prop
        }
        return scalerFunction;
    }

    NetworkXD3ForceLayoutPlugin.prototype.setupDefaults = function () {

        this.zoomScaleStroke = this.zoomScaleProp(this.props.nominal_stroke_width,
                                                  this.props.minimum_stroke_width,
                                                  this.props.maximum_stroke_width)
        this.zoomScaleRadius = this.zoomScaleProp(this.props.nominal_radius,
                                                  this.props.minimum_radius,
                                                  this.props.maximum_radius)
    }

    NetworkXD3ForceLayoutPlugin.prototype.zoomed = function() {
            this.tick()
        }

    NetworkXD3ForceLayoutPlugin.prototype.draw = function(){

        plugin = this
        brush = this.fig.getBrush();

        DEFAULT_NODE_SIZE = this.props.nominal_radius;

        var height = this.fig.height
        var width = this.fig.width

        var graph = this.props.graph
        var gravity = this.props.gravity.toFixed()
        var charge = this.props.charge.toFixed()
        var link_distance = this.props.link_distance.toFixed()
        var link_strength = this.props.link_strength.toFixed()
        var friction = this.props.friction.toFixed()

        this.ax = mpld3.get_element(this.props.ax_id, this.fig)

        var ax = this.ax;

        this.ax.elements.push(this)

        ax_obj = this.ax;

        var width = d3.max(ax.x.range()) - d3.min(ax.x.range()),
            height = d3.max(ax.y.range()) - d3.min(ax.y.range());

        var color = d3.scale.category20();

        this.xScale = d3.scale.linear().domain([0, 1]).range([0, width]) // ax.x;
        this.yScale = d3.scale.linear().domain([0, 1]).range([height, 0]) // ax.y;

        this.force = d3.layout.force()
                            .size([width, height]);

        this.svg = this.ax.axes.append("g");

        for(var i = 0; i < graph.nodes.length; i++){
            var node = graph.nodes[i];
            if (node.hasOwnProperty('x')) {
                node.x = this.ax.x(node.x);
            }
            if (node.hasOwnProperty('y')) {
                node.y = this.ax.y(node.y);
            }
        }

        this.force
            .nodes(graph.nodes)
            .links(graph.links)
            .linkStrength(link_strength)
            .friction(friction)
            .linkDistance(link_distance)
            .charge(charge)
            .gravity(gravity)
            .start();

        this.link = this.svg.selectAll(".link")
            .data(graph.links)
          .enter().append("line")
            .attr("class", "link")
            .attr("stroke", "black")
            .style("stroke-width", function (d) { return Math.sqrt(d.value); });

        this.node = this.svg.selectAll(".node")
            .data(graph.nodes)
          .enter().append("circle")
            .attr("class", "node")
            .attr("r", function(d) {return d.size === undefined ? DEFAULT_NODE_SIZE : d.size ;})
            .style("fill", function (d) { return d.color; });

        this.node.append("title")
            .text(function (d) { return d.name; });

        this.force.on("tick", this.tick.bind(this));

        this.setupDefaults()
        this.conditional_features(this.svg);

    };

    NetworkXD3ForceLayoutPlugin.prototype.tick = function() {

        this.link.attr("x1", function (d) { return this.ax.x(this.xScale.invert(d.source.x)); }.bind(this))
                 .attr("y1", function (d) { return this.ax.y(this.yScale.invert(d.source.y)); }.bind(this))
                 .attr("x2", function (d) { return this.ax.x(this.xScale.invert(d.target.x)); }.bind(this))
                 .attr("y2", function (d) { return this.ax.y(this.yScale.invert(d.target.y)); }.bind(this));

        this.node.attr("transform", function (d) {
            return "translate(" + this.ax.x(this.xScale.invert(d.x)) + "," + this.ax.y(this.yScale.invert(d.y)) + ")";
            }.bind(this)
        );

    }

    NetworkXD3ForceLayoutPlugin.prototype.conditional_features = function(svg) {

        var drag = d3.behavior.drag()
                .on("dragstart", dragstarted)
                .on("drag", dragged.bind(this))
                .on("dragend", dragended);

        function dragstarted(d) {
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).classed("fixed", d.fixed = true);
            d.fixed = true;
        }

        function dblclick(d) {
          self.force.resume();
          d3.select(this).classed("fixed", d.fixed = false);
        }

        function dragged(d) {
            var mouse = d3.mouse(svg.node());
            d.x = this.xScale(this.ax.x.invert(mouse[0]));
            d.y = this.yScale(this.ax.y.invert(mouse[1]));
            d.px = d.x;
            d.py = d.y;
            d.fixed = true;
            this.force.resume();
        }

        function dragended(d) {
            d.fixed = true;
            }

        var self = this;
        if (this.props.draggable === true) {
            this.node.on("dblclick", dblclick).call(drag)
        }

    }


    
         mpld3.draw_figure("fig_el6303944499107368844826201", {"axes": [{"xlim": [0.0, 1.0], "yscale": "linear", "axesbg": "#FFFFFF", "texts": [], "zoomable": true, "images": [], "xdomain": [0.0, 1.0], "ylim": [0.0, 1.0], "paths": [], "sharey": [], "sharex": [], "axesbgalpha": null, "axes": [{"scale": "linear", "tickformat": null, "grid": {"gridOn": false}, "fontsize": 10.0, "position": "bottom", "nticks": 6, "tickvalues": null}, {"scale": "linear", "tickformat": null, "grid": {"gridOn": false}, "fontsize": 10.0, "position": "left", "nticks": 6, "tickvalues": null}], "lines": [], "markers": [], "id": "el630394450434960", "ydomain": [0.0, 1.0], "collections": [], "xscale": "linear", "bbox": [0.125, 0.125, 0.77500000000000002, 0.77500000000000002]}], "height": 288.0, "width": 432.0, "plugins": [{"type": "reset"}, {"enabled": false, "button": true, "type": "zoom"}, {"enabled": false, "button": true, "type": "boxzoom"}, {"draggable": true, "charge": -30, "link_distance": 20, "link_strength": 1, "ax_id": "el630394450434960", "graph": {"directed": false, "graph": {}, "nodes": [{"name": "Node1", "color": "red", "y": 0.25, "x": 0.25, "fixed": true, "id": 1}, {"y": 0.75, "x": 0.75, "fixed": true, "id": 2}, {"id": 3}], "links": [{"source": 0, "target": 1}, {"source": 0, "target": 2}, {"source": 1, "target": 2}], "multigraph": false}, "nominal_radius": 5, "type": "networkxd3forcelayout", "gravity": 1, "friction": 0.9}], "data": {}, "id": "el630394449910736"});
      });
    });
}else{
    // require.js not available: dynamically load d3 & mpld3
    mpld3_load_lib("https://mpld3.github.io/js/d3.v3.min.js", function(){
         mpld3_load_lib("https://mpld3.github.io/js/mpld3.v0.2.js", function(){
                 

    mpld3.register_plugin("networkxd3forcelayout", NetworkXD3ForceLayoutPlugin);
    NetworkXD3ForceLayoutPlugin.prototype = Object.create(mpld3.Plugin.prototype);
    NetworkXD3ForceLayoutPlugin.prototype.constructor = NetworkXD3ForceLayoutPlugin;
    NetworkXD3ForceLayoutPlugin.prototype.requiredProps = ["graph",
                                                                "ax_id",];
    NetworkXD3ForceLayoutPlugin.prototype.defaultProps = { coordinates: "data",
                                                               draggable: true,
                                                               gravity: 1,
                                                               charge: -30,
                                                               link_strength: 1,
                                                               friction: 0.9,
                                                               link_distance: 20,
                                                               maximum_stroke_width: 2,
                                                               minimum_stroke_width: 1,
                                                               nominal_stroke_width: 1,
                                                               maximum_radius: 10,
                                                               minimum_radius: 1,
                                                               nominal_radius: 5,
                                                            };

    function NetworkXD3ForceLayoutPlugin(fig, props){
        mpld3.Plugin.call(this, fig, props);
    };

    var color = d3.scale.category20();

    NetworkXD3ForceLayoutPlugin.prototype.zoomScaleProp = function (nominal_prop, minimum_prop, maximum_prop) {
        var zoom = this.ax.zoom;
        scalerFunction = function() {
            var prop = nominal_prop;
            if (nominal_prop*zoom.scale()>maximum_prop) prop = maximum_prop/zoom.scale();
            if (nominal_prop*zoom.scale()<minimum_prop) prop = minimum_prop/zoom.scale();
            return prop
        }
        return scalerFunction;
    }

    NetworkXD3ForceLayoutPlugin.prototype.setupDefaults = function () {

        this.zoomScaleStroke = this.zoomScaleProp(this.props.nominal_stroke_width,
                                                  this.props.minimum_stroke_width,
                                                  this.props.maximum_stroke_width)
        this.zoomScaleRadius = this.zoomScaleProp(this.props.nominal_radius,
                                                  this.props.minimum_radius,
                                                  this.props.maximum_radius)
    }

    NetworkXD3ForceLayoutPlugin.prototype.zoomed = function() {
            this.tick()
        }

    NetworkXD3ForceLayoutPlugin.prototype.draw = function(){

        plugin = this
        brush = this.fig.getBrush();

        DEFAULT_NODE_SIZE = this.props.nominal_radius;

        var height = this.fig.height
        var width = this.fig.width

        var graph = this.props.graph
        var gravity = this.props.gravity.toFixed()
        var charge = this.props.charge.toFixed()
        var link_distance = this.props.link_distance.toFixed()
        var link_strength = this.props.link_strength.toFixed()
        var friction = this.props.friction.toFixed()

        this.ax = mpld3.get_element(this.props.ax_id, this.fig)

        var ax = this.ax;

        this.ax.elements.push(this)

        ax_obj = this.ax;

        var width = d3.max(ax.x.range()) - d3.min(ax.x.range()),
            height = d3.max(ax.y.range()) - d3.min(ax.y.range());

        var color = d3.scale.category20();

        this.xScale = d3.scale.linear().domain([0, 1]).range([0, width]) // ax.x;
        this.yScale = d3.scale.linear().domain([0, 1]).range([height, 0]) // ax.y;

        this.force = d3.layout.force()
                            .size([width, height]);

        this.svg = this.ax.axes.append("g");

        for(var i = 0; i < graph.nodes.length; i++){
            var node = graph.nodes[i];
            if (node.hasOwnProperty('x')) {
                node.x = this.ax.x(node.x);
            }
            if (node.hasOwnProperty('y')) {
                node.y = this.ax.y(node.y);
            }
        }

        this.force
            .nodes(graph.nodes)
            .links(graph.links)
            .linkStrength(link_strength)
            .friction(friction)
            .linkDistance(link_distance)
            .charge(charge)
            .gravity(gravity)
            .start();

        this.link = this.svg.selectAll(".link")
            .data(graph.links)
          .enter().append("line")
            .attr("class", "link")
            .attr("stroke", "black")
            .style("stroke-width", function (d) { return Math.sqrt(d.value); });

        this.node = this.svg.selectAll(".node")
            .data(graph.nodes)
          .enter().append("circle")
            .attr("class", "node")
            .attr("r", function(d) {return d.size === undefined ? DEFAULT_NODE_SIZE : d.size ;})
            .style("fill", function (d) { return d.color; });

        this.node.append("title")
            .text(function (d) { return d.name; });

        this.force.on("tick", this.tick.bind(this));

        this.setupDefaults()
        this.conditional_features(this.svg);

    };

    NetworkXD3ForceLayoutPlugin.prototype.tick = function() {

        this.link.attr("x1", function (d) { return this.ax.x(this.xScale.invert(d.source.x)); }.bind(this))
                 .attr("y1", function (d) { return this.ax.y(this.yScale.invert(d.source.y)); }.bind(this))
                 .attr("x2", function (d) { return this.ax.x(this.xScale.invert(d.target.x)); }.bind(this))
                 .attr("y2", function (d) { return this.ax.y(this.yScale.invert(d.target.y)); }.bind(this));

        this.node.attr("transform", function (d) {
            return "translate(" + this.ax.x(this.xScale.invert(d.x)) + "," + this.ax.y(this.yScale.invert(d.y)) + ")";
            }.bind(this)
        );

    }

    NetworkXD3ForceLayoutPlugin.prototype.conditional_features = function(svg) {

        var drag = d3.behavior.drag()
                .on("dragstart", dragstarted)
                .on("drag", dragged.bind(this))
                .on("dragend", dragended);

        function dragstarted(d) {
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).classed("fixed", d.fixed = true);
            d.fixed = true;
        }

        function dblclick(d) {
          self.force.resume();
          d3.select(this).classed("fixed", d.fixed = false);
        }

        function dragged(d) {
            var mouse = d3.mouse(svg.node());
            d.x = this.xScale(this.ax.x.invert(mouse[0]));
            d.y = this.yScale(this.ax.y.invert(mouse[1]));
            d.px = d.x;
            d.py = d.y;
            d.fixed = true;
            this.force.resume();
        }

        function dragended(d) {
            d.fixed = true;
            }

        var self = this;
        if (this.props.draggable === true) {
            this.node.on("dblclick", dblclick).call(drag)
        }

    }


    
                 mpld3.draw_figure("fig_el6303944499107368844826201", {"axes": [{"xlim": [0.0, 1.0], "yscale": "linear", "axesbg": "#FFFFFF", "texts": [], "zoomable": true, "images": [], "xdomain": [0.0, 1.0], "ylim": [0.0, 1.0], "paths": [], "sharey": [], "sharex": [], "axesbgalpha": null, "axes": [{"scale": "linear", "tickformat": null, "grid": {"gridOn": false}, "fontsize": 10.0, "position": "bottom", "nticks": 6, "tickvalues": null}, {"scale": "linear", "tickformat": null, "grid": {"gridOn": false}, "fontsize": 10.0, "position": "left", "nticks": 6, "tickvalues": null}], "lines": [], "markers": [], "id": "el630394450434960", "ydomain": [0.0, 1.0], "collections": [], "xscale": "linear", "bbox": [0.125, 0.125, 0.77500000000000002, 0.77500000000000002]}], "height": 288.0, "width": 432.0, "plugins": [{"type": "reset"}, {"enabled": false, "button": true, "type": "zoom"}, {"enabled": false, "button": true, "type": "boxzoom"}, {"draggable": true, "charge": -30, "link_distance": 20, "link_strength": 1, "ax_id": "el630394450434960", "graph": {"directed": false, "graph": {}, "nodes": [{"name": "Node1", "color": "red", "y": 0.25, "x": 0.25, "fixed": true, "id": 1}, {"y": 0.75, "x": 0.75, "fixed": true, "id": 2}, {"id": 3}], "links": [{"source": 0, "target": 1}, {"source": 0, "target": 2}, {"source": 1, "target": 2}], "multigraph": false}, "nominal_radius": 5, "type": "networkxd3forcelayout", "gravity": 1, "friction": 0.9}], "data": {}, "id": "el630394449910736"});
            })
         });
}

