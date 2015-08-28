window.addEventListener("load", initialize);

function initialize() {
	document.getElementById("submitButton").addEventListener("click",handleClick);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function handleClick() {
	var value = document.getElementById('pkmnName').value;
	console.log(value);
	if (value.length == '') {
		console.log('empty');
		document.getElementById('text').innerHTML = "Please enter a real pokemon";
	}
	else {
		document.getElementById('text').innerHTML = "Looking up " + value;
		value = value.toLowerCase();
		var pokeURL = 'http://bulbapedia.bulbagarden.net/w/api.php?action=query&prop=revisions&titles='+value+'_(Pok%C3%A9mon)&rvprop=content&format=jsonfm';

		var xhr = new XMLHttpRequest();
		xhr.open('get', pokeURL, true);

		// Using XMLHttpRequest
		xhr.setRequestHeader( 'Api-User-Agent', 'pokeLookup/1.0 (zoo.christina@gmail.com)' );

		// Using jQuery
		$.ajax( {
		    url: pokeURL,
		    // data: queryData,
		    dataType: 'json',
		    type: 'GET',
		    headers: { 'Api-User-Agent': 'pokeLookup/1.0 (zoo.christina@gmail.com)' },
		    success: function(data) {
		    	console.log('yay');
		    },
		    error: function(data) {
		    	// console.log(data);
		    	var txt = data.responseText;
		    	console.log('response text');
		    	console.log(txt);

		    	//checking if the pokemon exists//
		    	var warningRgx = /"pages": {(\n.+?(?=\{))/;
		    	var warningNode = txt.match(warningRgx);
		    	if (warningNode[0].indexOf("-1") > 0) {
		    		console.log('DOES NOT EXIST');
		    		document.getElementById('text').innerHTML = 'Please enter a real Pokemon';
		    		return;
		    	}

		    	var rgx = /===Type effectiveness===\\n{{TypeEffectiveness(.+?(?=\|\\n\\nnotes))/;
		    	var textNode = txt.match(rgx);
		    	console.log(textNode);

		    	if (textNode == null) { // why is not all regex the same
		    		var rgx2= /===Type effectiveness===\\n{{TypeEffectiveness(.+?(?=\|\\nnotes))/;
		    		textNode = txt.match(rgx2);
		    	}

		    	// console.log(textNode[0]);
		    	// console.log(textNode[1]);

		    	var strTxtNode = textNode[1].toString();

		    	var types = strTxtNode.split("|\\n");
		    	// console.log('split one: ' + types[0] + ' ' + types[1] + ' ' + types[2] + ' ' + types[3]);

		    	var notEffective = new Array(); //does 0x dmg
		    	var barelyEffective = new Array(); //does 0.25x dmg
		    	var halfEffective = new Array(); // does 0.5x dmg
		    	var Effective = new Array(); // does 1x dmg
		    	var superEffective = new Array(); // does 2x dmg
		    	var extremelyEffective = new Array(); //does 4x dmg

		    	var pkmnType = new Array(); // logs type of the pokemon

		    	// console.log('TYPE 1 SPLIT');

		    	for (j=0; j<types.length; j++) {
		    		console.log(types[j]);
		    		var pieces = types[j].toString(); // change to string
		    		pieces = pieces.split("="); // split at = sign

		    		// console.log(pieces);
		    		// console.log('pieces length is ' + pieces.length)
		    		if (pieces[0].length == 0) {
		    			console.log('nothing here');
		    		}
		    		else {
		    			var attackType = pieces[0]; // first half of =, can either be type1 or an attacktype
		    			var dmgVal = pieces[1]; //extra whitespace
		    			dmgVal = dmgVal.trim();
		    			console.log('attacktype is ' + attackType);
		    			console.log('dmg val is ' + dmgVal);
		    			// console.log('index is ' + attackType.indexOf("type"));
		    			if (attackType.indexOf("type") > -1) {
		    				pkmnType.push(dmgVal); //the second half of the string contains the type
		    			}
		    			else if (dmgVal == 0) { notEffective.push(attackType); }
		    			else if (dmgVal == 25) { barelyEffective.push(attackType); }
		    			else if (dmgVal == 50) { halfEffective.push(attackType); }
		    			else if (dmgVal == 100) { Effective.push(attackType); }
		    			else if (dmgVal == 200) { superEffective.push(attackType); }
		    			else if (dmgVal == 400) { extremelyEffective.push(attackType); }
		    		}

		    	}// end of for loop		    	


		    	linebreak = document.createElement('br');

		    	if (pkmnType.length != 0) {
		    		var node = document.createElement("p");
		    		var boldNode = document.createElement("b");
		    		var titleText = document.createTextNode("Pokemon Type: ");
		    		node.setAttribute('id', 'pkmnType');

		    		boldNode.appendChild(titleText);
		    		node.appendChild(boldNode);
		    		document.getElementById("text").appendChild(node);  

		    		for (i=0; i<pkmnType.length; i++){
		    			console.log('adding ' + pkmnType[i]);
		    			var div = document.getElementById('pkmnType');
		    			var add = pkmnType[i];
		    			div.innerHTML = div.innerHTML + ' ' + capitalizeFirstLetter(add);
		    		}
		    		node.appendChild(linebreak);
		    		node.appendChild(linebreak);
		    	}

		    	if (notEffective.length != 0) {
		    		var node = document.createElement("p");
		    		var boldNode = document.createElement("b");
		    		var titleText = document.createTextNode("Immune [0x]: ");
		    		node.setAttribute('id', 'notEffective');

		    		boldNode.appendChild(titleText);
		    		node.appendChild(boldNode);
		    		document.getElementById("text").appendChild(node);  

		    		for (i=0; i<notEffective.length; i++){
		    			console.log('adding ' + notEffective[i]);
		    			var div = document.getElementById('notEffective');
		    			var add = notEffective[i].toString();
		    			div.innerHTML = div.innerHTML + ' ' + capitalizeFirstLetter(add);
		    		}
		    		node.appendChild(linebreak);
		    		node.appendChild(linebreak);
		    	}

		    	if (barelyEffective.length != 0) {
		    		var node = document.createElement("p");
		    		var boldNode = document.createElement("b");
		    		var titleText = document.createTextNode("Very Resistant [0.25x]: ");
		    		node.setAttribute('id', 'barelyEffective');

		    		boldNode.appendChild(titleText);
		    		node.appendChild(boldNode);
		    		document.getElementById("text").appendChild(node);  
		    		for (i=0; i<barelyEffective.length; i++){
		    			console.log('adding ' + barelyEffective[i]);
		    			var div = document.getElementById('barelyEffective');
		    			var add = barelyEffective[i].toString();
		    			div.innerHTML = div.innerHTML + ' ' + capitalizeFirstLetter(add);
		    		}
		    		node.appendChild(linebreak);
		    		node.appendChild(linebreak);
		    	}

		    	if (halfEffective.length != 0) {
		    		var node = document.createElement("p");
		    		var boldNode = document.createElement("b");
		    		var titleText = document.createTextNode("Resistant [0.5x]: ");
		    		node.setAttribute('id', 'halfEffective');

		    		boldNode.appendChild(titleText);
		    		node.appendChild(boldNode);
		    		document.getElementById("text").appendChild(node);  
		    		for (i=0; i<halfEffective.length; i++){
		    			console.log('adding ' + halfEffective[i]);
		    			var div = document.getElementById('halfEffective');
		    			var add = halfEffective[i].toString();
		    			div.innerHTML = div.innerHTML + ' ' + capitalizeFirstLetter(add);
		    		}
		    		node.appendChild(linebreak);
		    		node.appendChild(linebreak);
		    	}

		    	if (Effective.length != 0) {
		    		var node = document.createElement("p");
		    		var boldNode = document.createElement("b");
		    		var titleText = document.createTextNode("Normal [1x]: ");
		    		node.setAttribute('id', 'Effective');

		    		boldNode.appendChild(titleText);
		    		node.appendChild(boldNode);
		    		document.getElementById("text").appendChild(node);   
		    		for (i=0; i<Effective.length; i++){
		    			console.log('adding ' + Effective[i]);
		    			var div = document.getElementById('Effective');
		    			var add = Effective[i].toString();
		    			div.innerHTML = div.innerHTML + ' ' + capitalizeFirstLetter(add);
		    		}
		    		node.appendChild(linebreak);
		    		node.appendChild(linebreak);
		    	}

		    	if (superEffective.length != 0) {
		    		var node = document.createElement("p");
		    		var boldNode = document.createElement("b");
		    		var titleText = document.createTextNode("Super Effective [2x]: ");
		    		node.setAttribute('id', 'superEffective');

		    		boldNode.appendChild(titleText);
		    		node.appendChild(boldNode);
		    		document.getElementById("text").appendChild(node);  
		    		for (i=0; i<superEffective.length; i++){
		    			console.log('adding ' + superEffective[i]);
		    			var div = document.getElementById('superEffective');
		    			var add = superEffective[i].toString();
		    			div.innerHTML = div.innerHTML + ' ' + capitalizeFirstLetter(add);
		    		}
		    		node.appendChild(linebreak);
		    		node.appendChild(linebreak);
		    	}

		    	if (extremelyEffective.length != 0) {
		    		var node = document.createElement("p");
		    		var boldNode = document.createElement("b");
		    		var titleText = document.createTextNode("Ultra Effective [4x]: ");
		    		node.setAttribute('id', 'extremelyEffective');

		    		boldNode.appendChild(titleText);
		    		node.appendChild(boldNode);
		    		document.getElementById("text").appendChild(node);  
		    		for (i=0; i<extremelyEffective.length; i++){
		    			console.log('adding ' + extremelyEffective[i]);
		    			var div = document.getElementById('extremelyEffective');
		    			var add = extremelyEffective[i].toString();
		    			div.innerHTML = div.innerHTML + ' ' + capitalizeFirstLetter(add);
		    		}
		    		node.appendChild(linebreak);
		    		node.appendChild(linebreak);
		    	}
		    }
		} );

	}
}