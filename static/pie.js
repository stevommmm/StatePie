(function () {
	var svgns = "http://www.w3.org/2000/svg";

	function generateArc(svg, radius, percent) {
		var cx = parseInt(svg.getAttribute('width')) / 2;
		var cy = parseInt(svg.getAttribute('height')) / 2;
		var _percent = percent;
		if (percent >= 100) {
			_percent = 99;
		}
		
	    var offsetRadians = 270; // -Math.PI/2 for 12 o'clock
	    var endDegrees = (360 / 100) * _percent;
	    var sweepFlag = 1; // 0 for counter clockwise
	    var startRadians = offsetRadians * Math.PI / 180;
	    var endRadians = (offsetRadians + endDegrees) * Math.PI / 180;
	    var largeArc = ((endRadians - startRadians) % (2 * Math.PI)) > Math.PI ? 1 : 0;
	    var startX = parseInt(cx + radius * Math.cos(startRadians));
	    var startY = parseInt(cy + radius * Math.sin(startRadians));
	    var endX = parseInt(cx + radius * Math.cos(endRadians));
	    var endY = parseInt(cy + radius * Math.sin(endRadians));
	    var space = " ";
	    var arcData = "";

	    arcData += "M" + space + startX + space + startY + space;
	    arcData += "A" + space + radius + space + radius + space + offsetRadians + space + largeArc + space + sweepFlag + space + endX + space + endY;
	    if (percent >= 100) {
	    	arcData += " Z";
	    }
	    return (arcData);
	}

	function setPath(svg, percent, radius) {
		radius = radius || 50
		svg.innerHTML = '';
		// Percent background
		var circle = document.createElementNS(svgns, "circle");
	    circle.setAttributeNS(null, "fill", "transparent");
	    circle.setAttributeNS(null, "stroke", "rgba(0,0,0,0.05)");
	    circle.setAttributeNS(null, "stroke-width", 8);
	    circle.setAttributeNS(null, "cx", parseInt(svg.getAttribute('width')) / 2);
		circle.setAttributeNS(null, "cy", parseInt(svg.getAttribute('height')) / 2);
	    circle.setAttributeNS(null, "r", radius);
	    svg.appendChild(circle);

	    // Percent indicator
	    var path = document.createElementNS(svgns, "path");
	    path.setAttributeNS(null, "fill", "transparent");
	    path.setAttributeNS(null, "stroke-width", 16);
	    path.setAttributeNS(null, "d", generateArc(svg, radius, percent));
	    path.setAttributeNS(null, "stroke", "#fff");

	    svg.appendChild(path);

	    // Percent text
	    var text = document.createElementNS(svgns, "text");
	    text.setAttributeNS(null, "text-anchor", "middle");
	    text.setAttributeNS(null, "font-size", "24px");
	    text.setAttributeNS(null, "fill", "#fff");
	    text.setAttributeNS(null, "x", parseInt(svg.getAttribute('width')) / 2);
		text.setAttributeNS(null, "y", parseInt(svg.getAttribute('height')) / 2 + 6);
	    var textNode = document.createTextNode(percent + "%");
		text.appendChild(textNode);

	    svg.appendChild(text);
	}


    Pie = function(percent, description, state, id) {
    	this._id = id;
		this.setPercent(percent);
		this.setDescription(description);
		this.setState(state);
    };

    Pie.prototype.setPercent = function(percent) {
    	this._percent = percent;
    }

    Pie.prototype.setDescription = function(description) {
    	this._description = description;
    }

    Pie.prototype.setState = function(state) {
    	this._state = state;
    }

    Pie.prototype.renderTo = function(container, options) {
    	var expandAlert = options['expandAlert'] || false;  // Auto expand alert 
    	var expandWarn = options['expandWarn'] || false;  // Auto expand warning
    	var expandNormal = options['expandNormal'] || false;  // Auto expand green

    	var metric = document.createElement('div');
    	metric.setAttribute('data-percent', this._percent);
    	metric.className = "metric " + this._state;
    	metric.setAttribute('id', this._id);
    	metric.setAttribute('title', this._id);
    	metric.setAttribute('data-state', this._state);
    	metric.style.background = 'hsla(' + (100 - this._percent) + ', 100%, 16%, 0.4)';


    	if (this._state == 'alert' && expandAlert) {
    		metric.style.width = "410px";
    	} else if (this._state == 'warn' && expandWarn) {
    		metric.style.width = "410px";
    	} else if (this._state == 'normal' && expandNormal) { 
    		metric.style.width = "410px";
    	}


    	var svg = document.createElementNS(svgns, "svg");
		svg.setAttribute('width', "200px");
		svg.setAttribute('height', "200px");
		setPath(svg, this._percent);

    	metric.appendChild(svg);

    	var p = document.createElement('p');
    	p.innerHTML = this._description;
    	metric.appendChild(p);

		container.appendChild(metric);
		metric.onclick = function() {
			this.style.width = parseInt(this.style.width) === 410 ? "200px" : "410px";
		};
	};

}());