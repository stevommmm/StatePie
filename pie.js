(function () {
	var svgns = "http://www.w3.org/2000/svg";

	function generateArc(svg, radius, percent) {
		cx = parseInt(svg.getAttribute('width')) / 2;
		cy = parseInt(svg.getAttribute('height')) / 2;
		_percent = percent;
		if (percent >= 100) {
			_percent = 99;
		}
		var endDegrees = 360 / 100 * _percent;
	    var offsetRadians = 270; // -Math.PI/2 for 12 o'clock
	    var sweepFlag = 1; // 0 for counter clockwise
	    var startRadians = offsetRadians * Math.PI / 180;
	    var endRadians = offsetRadians + endDegrees * Math.PI / 180;
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
	    	arcData += "Z";
	    }
	    return (arcData);
	}

	function setPath(svg, stroke, percent) {
		svg.innerHTML = '';
		// Percent background
		var circle = document.createElementNS(svgns, "circle");
	    circle.setAttribute("fill", "transparent");
	    circle.setAttribute("stroke", "rgba(0,0,0,0.05)");
	    circle.setAttribute("stroke-width", 16);
	    circle.setAttribute("cx", parseInt(svg.getAttribute('width')) / 2);
		circle.setAttribute("cy", parseInt(svg.getAttribute('height')) / 2);
	    circle.setAttribute("r", 50);
	    svg.appendChild(circle);

	    // Percent indicator
	    var path = document.createElementNS(svgns, "path");
	    path.setAttribute("fill", "transparent");
	    path.setAttribute("stroke", stroke);
	    path.setAttribute("stroke-width", 16);
	    path.setAttribute("d", generateArc(svg, 50, percent));
	    svg.appendChild(path);
	}


    Pie = function(percent, description, width, height) {
    	this.width = width || "200px";
    	this.height = height || "200px";

        this.svg = document.createElementNS(svgns, "svg");
		this.svg.setAttribute('width', this.width);
		this.svg.setAttribute('height', this.height);

		this.setPercent(percent);
		this.setDescription(description);
    };

    Pie.prototype.setPercent = function(percent) {
    	setPath(this.svg, "white", percent);
    }

    Pie.prototype.setDescription = function(description) {
    	this.description = description;
    }

    Pie.prototype.renderTo = function(container) {
    	metric = document.createElement('div');
    	metric.className = "metric";

    	metric.appendChild(this.svg);

    	p = document.createElement('p');
    	p.innerHTML = this.description;
    	metric.appendChild(p);

		container.appendChild(metric);
		metric.onclick = function() {
			this.style.width = parseInt(this.style.width) == 420 ? this.width : "420px";
		};
	};

}());