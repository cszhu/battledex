window.addEventListener('load', function() {
  document.getElementById('submitButton').addEventListener('click', handleClick);
});

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getImageUrl(searchTerm, callback, errorCallback) {
  // Google image search - 100 searches per day.
  // https://developers.google.com/image-search/
  var searchUrl = 'https://ajax.googleapis.com/ajax/services/search/images' +
    '?v=1.0&q=' + encodeURIComponent(searchTerm) + '&as_filetype=png';

  $.ajax({
    url: searchUrl,
    type: 'GET',
    dataType: 'jsonp',
    success: function(x) {
      console.log('Success');
      console.log(x);

      var firstResult = x.responseData.results[0];
      if (firstResult === undefined) {
        return;
      }
      // Take the thumbnail instead of the full image to get an approximately
      // consistent image size.
      var imageUrl = firstResult.tbUrl;
      var width = parseInt(firstResult.tbWidth);
      var height = parseInt(firstResult.tbHeight);
      callback(imageUrl, width, height);
    },
    error: function(x) {
      console.log('Failed!');
      errorCallback('Network error.');
    },
  });
}

function setImage(searchTerm) {
  getImageUrl(searchTerm, function(imageUrl, width, height) {
    var imageResult = document.getElementById('image-result');
    // Explicitly set the width/height to minimize the number of reflows. For
    // a single image, this does not matter, but if you're going to embed
    // multiple external images in your page, then the absence of width/height
    // attributes causes the popup to resize multiple times.
    imageResult.width = width;
    imageResult.height = height;
    imageResult.src = imageUrl;
    imageResult.hidden = false;
  }, function(errorMessage) {
    console.log('Cannot display image.' + errorMessage);
  });
}

function setAbility(txt) {
  var abilityRgx = /\\nability1=(.+?(?=\|))/;
  var ability = txt.match(abilityRgx);
  ability = ability[1].toString();
  ability = ability.trim();
  document.getElementById('ability').innerHTML = '<b>Ability: ' +ability+'</b>';
  setAbilityText(ability);
}

function setAbilityText(ability) {
  var abilityURL = 'http://bulbapedia.bulbagarden.net/w/api.php?action=query&prop=revisions&rvprop=content&titles=' + ability + '_(Ability)';
  $.ajax({
    url: abilityURL,
    dataType: 'json',
    type: 'GET',
    headers: { 'Api-User-Agent': 'battledex/1.0 (zoo.christina@gmail.com)' },
    success: function(data) {
      console.log('Ability got?');
    },
    error: function(data) {
      console.log('Ability error?');
      console.log(data.responseText);
      var response = data.responseText;
      var rgx = /text6=(.+?(?=\.))/;
      var abilityText = response.match(rgx)[1].toString();
      abilityText = abilityText.replace(/\\u00e9/, 'e');
      abilityText = abilityText.replace(/Pok\\u00e9mon/, 'Pokemon');
      console.log(abilityText);
      if (abilityText === undefined) {
        return;
      } else {
        var abilityAnchor = document.getElementById('ability');
        var node = document.createElement('p');
        var add = document.createTextNode(abilityText);
        node.setAttribute('id', 'abilityText');
        node.appendChild(add);
        abilityAnchor.appendChild(node);
      }
      return;
    }
  });
}

function setWeaknesses(txt) {
  var rgx = /===Type effectiveness===\\n{{TypeEffectiveness(.+?(?=\|\\n\\nnotes))/;
  var textNode = txt.match(rgx);
  console.log(textNode);

  if (textNode === null) { // why is not all regex the same
    var rgx2 = /===Type effectiveness===\\n{{TypeEffectiveness(.+?(?=\|\\nnotes))/;
    textNode = txt.match(rgx2);
  }
  if (textNode === null) {
    var rgx3 = /Effectiveness(.+?(?=}}))/;
    textNode = txt.match(rgx3);
  }

  if (textNode[0] === null) { return; }

  console.log('text node 0' + textNode[0]);
  console.log('text node 1' + textNode[1]);

  var strTxtNode = textNode[1].toString();

  var types = strTxtNode.split('|\\n');
  // console.log('split one: ' + types[0] + ' ' + types[1] + ' ' + types[2] + ' ' + types[3]);

  var notEffective = []; //does 0x dmg
  var barelyEffective = []; //does 0.25x dmg
  var halfEffective = []; // does 0.5x dmg
  var Effective = []; // does 1x dmg
  var superEffective = []; // does 2x dmg
  var extremelyEffective = []; //does 4x dmg

  var pkmnType = []; // logs type of the pokemon

  // console.log('TYPE 1 SPLIT');

  for (j = 0; j < types.length; j++) {
    console.log(types[j]);
    var pieces = types[j].toString(); // change to string
    pieces = pieces.split('='); // split at = sign

    // console.log(pieces);
    // console.log('pieces length is ' + pieces.length)
    if (pieces[0].length === 0) {
      console.log('nothing here');
    } else {
      var attackType = pieces[0]; // first half of =, can either be type1 or an attacktype
      attackType = attackType.replace(/\\n/, '');

      var dmgVal = pieces[1]; //extra whitespace
      dmgVal = dmgVal.trim();

      console.log('attacktype is ' + attackType);
      console.log('dmg val is ' + dmgVal);
      // console.log('index is ' + attackType.indexOf('type'));
      if (attackType.indexOf('type') > -1) {
        pkmnType.push(dmgVal); //the second half of the string contains the type
      } else if (dmgVal === 0) {
        notEffective.push(attackType);
      } else if (dmgVal == 25) {
        barelyEffective.push(attackType);
      } else if (dmgVal == 50) {
        halfEffective.push(attackType);
      } else if (dmgVal == 100) {
        Effective.push(attackType);
      } else if (dmgVal == 200) {
        superEffective.push(attackType);
      } else if (dmgVal == 400) {
        extremelyEffective.push(attackType);
      }
    }
  } // end of for loop

  linebreak = document.createElement('br');

  var node, boldNode, titleText, div, add;
  if (pkmnType.length !== 0) {
    node = document.createElement('p');
    boldNode = document.createElement('b');
    titleText = document.createTextNode('Pokemon Type: ');
    node.setAttribute('id', 'pkmnType');

    boldNode.appendChild(titleText);
    node.appendChild(boldNode);
    document.getElementById('text').appendChild(node);

    for (i = 0; i < pkmnType.length; i++) {
      console.log('adding ' + pkmnType[i]);
      div = document.getElementById('pkmnType');
      add = pkmnType[i];
      div.innerHTML = div.innerHTML + ' ' + capitalizeFirstLetter(add);
    }
    node.appendChild(linebreak);
    node.appendChild(linebreak);
  }

  if (notEffective.length !== 0) {
    node = document.createElement('p');
    boldNode = document.createElement('b');
    titleText = document.createTextNode('Immune [0x]: ');
    node.setAttribute('id', 'notEffective');

    boldNode.appendChild(titleText);
    node.appendChild(boldNode);
    document.getElementById('text').appendChild(node);

    for (i = 0; i < notEffective.length; i++) {
      console.log('adding ' + notEffective[i]);
      div = document.getElementById('notEffective');
      add = notEffective[i].toString();
      div.innerHTML = div.innerHTML + ' ' + capitalizeFirstLetter(add);
    }
    node.appendChild(linebreak);
    node.appendChild(linebreak);
  }

  if (barelyEffective.length !== 0) {
    node = document.createElement('p');
    boldNode = document.createElement('b');
    titleText = document.createTextNode('Very Resistant [0.25x]: ');
    node.setAttribute('id', 'barelyEffective');

    boldNode.appendChild(titleText);
    node.appendChild(boldNode);
    document.getElementById('text').appendChild(node);
    for (i = 0; i < barelyEffective.length; i++) {
      console.log('adding ' + barelyEffective[i]);
      div = document.getElementById('barelyEffective');
      add = barelyEffective[i].toString();
      div.innerHTML = div.innerHTML + ' ' + capitalizeFirstLetter(add);
    }
    node.appendChild(linebreak);
    node.appendChild(linebreak);
  }

  if (halfEffective.length !== 0) {
    node = document.createElement('p');
    boldNode = document.createElement('b');
    titleText = document.createTextNode('Resistant [0.5x]: ');
    node.setAttribute('id', 'halfEffective');

    boldNode.appendChild(titleText);
    node.appendChild(boldNode);
    document.getElementById('text').appendChild(node);
    for (i = 0; i < halfEffective.length; i++) {
      console.log('adding ' + halfEffective[i]);
      div = document.getElementById('halfEffective');
      add = halfEffective[i].toString();
      div.innerHTML = div.innerHTML + ' ' + capitalizeFirstLetter(add);
    }
    node.appendChild(linebreak);
    node.appendChild(linebreak);
  }

  if (Effective.length !== 0) {
    node = document.createElement('p');
    boldNode = document.createElement('b');
    titleText = document.createTextNode('Normal [1x]: ');
    node.setAttribute('id', 'Effective');

    boldNode.appendChild(titleText);
    node.appendChild(boldNode);
    document.getElementById('text').appendChild(node);
    for (i = 0; i < Effective.length; i++) {
      console.log('adding ' + Effective[i]);
      div = document.getElementById('Effective');
      add = Effective[i].toString();
      div.innerHTML = div.innerHTML + ' ' + capitalizeFirstLetter(add);
    }
    node.appendChild(linebreak);
    node.appendChild(linebreak);
  }

  if (superEffective.length !== 0) {
    node = document.createElement('p');
    boldNode = document.createElement('b');
    titleText = document.createTextNode('Super Effective [2x]: ');
    node.setAttribute('id', 'superEffective');

    boldNode.appendChild(titleText);
    node.appendChild(boldNode);
    document.getElementById('text').appendChild(node);
    for (i = 0; i < superEffective.length; i++) {
      console.log('adding ' + superEffective[i]);
      div = document.getElementById('superEffective');
      add = superEffective[i].toString();
      div.innerHTML = div.innerHTML + ' ' + capitalizeFirstLetter(add);
    }
    node.appendChild(linebreak);
    node.appendChild(linebreak);
  }

  if (extremelyEffective.length !== 0) {
    node = document.createElement('p');
    boldNode = document.createElement('b');
    titleText = document.createTextNode('Ultra Effective [4x]: ');
    node.setAttribute('id', 'extremelyEffective');

    boldNode.appendChild(titleText);
    node.appendChild(boldNode);
    document.getElementById('text').appendChild(node);
    for (i = 0; i < extremelyEffective.length; i++) {
      console.log('adding ' + extremelyEffective[i]);
      div = document.getElementById('extremelyEffective');
      add = extremelyEffective[i].toString();
      div.innerHTML = div.innerHTML + ' ' + capitalizeFirstLetter(add);
    }
    node.appendChild(linebreak);
    node.appendChild(linebreak);
  }
}

function reset() {
  document.getElementById('status').innerHTML = '';
  document.getElementById('image-result').src = '';
  document.getElementById('image-result').hidden = true;
  document.getElementById('ability').innerHTML = '';
  document.getElementById('text').innerHTML = '';
}

function handleClick() {
  reset();
  var value = document.getElementById('pkmnName').value;
  console.log(value);
  if (value === '') {
    console.log('empty');
    document.getElementById('text').innerHTML = 'Please enter a real pokemon';
  } else {
    document.getElementById('status').innerHTML = 'Looking up ' + value;
    value = value.toLowerCase();
    var pokeURL = 'http://bulbapedia.bulbagarden.net/w/api.php?action=query&prop=revisions&titles=' + value + '_(Pok%C3%A9mon)&rvprop=content&format=jsonfm';

    var xhr = new XMLHttpRequest();
    xhr.open('get', pokeURL, true);

    // Using XMLHttpRequest
    xhr.setRequestHeader('Api-User-Agent', 'pokeLookup/1.0 (zoo.christina@gmail.com)');

    // Using jQuery
    $.ajax({
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
        document.getElementById('status').innerHTML = '';

        var txt = data.responseText;
        console.log('response text');
        console.log(txt);

        //checking if the pokemon exists//
        var warningRgx = /"pages": {(\n.+?(?=\{))/;
        var warningNode = txt.match(warningRgx);
        if (warningNode[0].indexOf('-1') > 0) {
          console.log('DOES NOT EXIST');
          document.getElementById('text').innerHTML = 'Please enter a real Pokemon';
          return;
        }

        setImage(value);
        setAbility(txt);
        setWeaknesses(txt);
      }
    });
  }
}
