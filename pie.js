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

	function setPath(svg, percent) {
		svg.innerHTML = '';
		// Percent background
		var circle = document.createElementNS(svgns, "circle");
	    circle.setAttributeNS(null, "fill", "transparent");
	    circle.setAttributeNS(null, "stroke", "rgba(0,0,0,0.05)");
	    circle.setAttributeNS(null, "stroke-width", 16);
	    circle.setAttributeNS(null, "cx", parseInt(svg.getAttribute('width')) / 2);
		circle.setAttributeNS(null, "cy", parseInt(svg.getAttribute('height')) / 2);
	    circle.setAttributeNS(null, "r", 50);
	    svg.appendChild(circle);

	    // Percent indicator
	    var path = document.createElementNS(svgns, "path");
	    path.setAttributeNS(null, "fill", "transparent");
	    path.setAttributeNS(null, "stroke-width", 16);
	    path.setAttributeNS(null, "d", generateArc(svg, 50, percent));
	    path.setAttributeNS(null, "stroke", "#fff");

	    svg.appendChild(path);

	    // Percent text
	    var text = document.createElementNS(svgns, "text");
	    text.setAttributeNS(null, "text-anchor", "middle");
	    text.setAttributeNS(null, "fill", "#fff");
	    text.setAttributeNS(null, "x", parseInt(svg.getAttribute('width')) / 2);
		text.setAttributeNS(null, "y", parseInt(svg.getAttribute('height')) / 2);
	    var textNode = document.createTextNode(percent + "%");
		text.appendChild(textNode);

	    svg.appendChild(text);
	}


    Pie = function(percent, description, id) {
    	this._id = id;
		this.setPercent(percent);
		this.setDescription(description);
    };

    Pie.prototype.setPercent = function(percent) {
    	this._percent = percent;
    }

    Pie.prototype.setDescription = function(description) {
    	this._description = description;
    }

    Pie.prototype.renderTo = function(container) {
    	var metric = document.createElement('div');
    	metric.className = "metric";
    	if (this._percent >= 95) {
    		metric.className += " alert";
    	} else if (this._percent >= 80) {
    		metric.className += " warn";
    	} else {
    		metric.className += " normal";
    	}


    	var svg = document.createElementNS(svgns, "svg");
		svg.setAttribute('width', "200px");
		svg.setAttribute('height', "200px");
		svg.setAttribute('id', this._id);
		setPath(svg, this._percent);

    	metric.appendChild(svg);

    	var p = document.createElement('p');
    	p.innerHTML = this._description;
    	metric.appendChild(p);

		container.appendChild(metric);
		metric.onclick = function() {
			console.log(parseInt(this.style.width));
			this.style.width = parseInt(this.style.width) === 410 ? "200px" : "410px";
		};
	};

}());