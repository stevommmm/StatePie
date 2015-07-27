var OPTIONS = {
	'sortPriority': false, 
	'expandAlert': false,
	'expandWarn': false,
	'expandNormal': false,
};

function toggleOption(opt) {
	if (opt in OPTIONS) {
		OPTIONS[opt] = !OPTIONS[opt];
	}
	// Set window hashes
	var _keys = Object.keys(OPTIONS).filter(function(key) {return OPTIONS[key] === true})
	var keys = _keys.map(function(obj){ return "#" + obj; });

	location.hash = keys.join("");
}

function generateOptionElement(opt, description) {
	var p = document.createElement("p");
	var checkbox = document.createElement('input');
	checkbox.type = "checkbox";
	checkbox.onclick = function() { toggleOption(opt); };
	checkbox.checked = OPTIONS[opt];

	p.appendChild(checkbox);
    var textNode = document.createTextNode(description);
    p.appendChild(textNode);
    return p;
}

(function() {
	var winopts = window.location.hash.split("#");
	for (var i = 0; i < winopts.length; i++) {
		if (winopts[i] in OPTIONS) {
			OPTIONS[winopts[i]] = !OPTIONS[winopts[i]];
		}
	}
}());


/* Ajax stuff */
function makeRequest(url, callback) {
	var httpRequest;
	if (window.XMLHttpRequest) { // Mozilla, Safari, ...
		httpRequest = new XMLHttpRequest();
	} else if (window.ActiveXObject) { // IE
		try {
			httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				// Do nothing
			}
		}
	}

	if (!httpRequest) {
		alert('Giving up :( Cannot create an XMLHTTP instance');
		return false;
	}
	httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				callback(httpRequest.responseText);
			} else {
				alert('There was a problem with the request.');
			}
		}
	};
	httpRequest.open('GET', url);
	httpRequest.send();
}

