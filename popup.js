window.addEventListener('load', function() {
  //Listener for button click
  var submit = document.getElementById('submitButton');
  submit.addEventListener('click', handleClick);
  var inputTxt = document.getElementById('pkmnName');
  inputTxt.onkeyup = function (e) {
    if(e.keyCode == 13){
       handleClick();
    }
  };
});

/*
 * Main handler that calls the PokeAPI
 */
function handleClick() {
  // Must reset values for each search.
  reset();
  // Grab input from input field.
  var input = document.getElementById('pkmnName').value;
  var generateurl = "https://pokeapi.co/api/v2/" + "pokemon/" + input.toLowerCase();
  startSpin();

  $.ajax({
    type: "GET",
    url: generateurl,
    dataType: "json",
    async: true,
    success: function(data) {
      // Debugging purposes
      console.log(data.name);
      console.log(data.height);
      console.log(data.weight);
      console.log(data.sprites.front_default);
      console.log(data.abilities[0].ability.name);
      console.log(data.types);

      addSprite(data.sprites.front_default);
      addName(capitalizeFirstLetter(data.name))
      addHeight(data.height);
      addWeight(data.weight);
      addDescription(data.name);
      addAbilities(data.abilities[0].ability.name);
      addTypes (data.types);
    }
  });
}

function startSpin(){
  var sprite = 'img/spinner.gif';
  var source = document.getElementById('spinner');
  source.src = sprite;
}

function stopSpin(){
  var source = document.getElementById('spinner');
  source.src = '';
}

function addTypes(types) {
  appendOntoDoc('type1', capitalizeFirstLetter(types[0].type.name));

  // Some Pokemon don't have 2nd types. Check if it exists.
  // If it does, add it.
  if (types[1].type.name !== null) {
    appendOntoDoc('type2', capitalizeFirstLetter(types[1].type.name));
  }
}

function addAbilities(ability) {
  appendOntoDoc('description', "Abilities: " + capitalizeFirstLetter(ability).replace("-", " "));
}

/*
 * The Pokedex descriptions come from another API call
 */
function addDescription(name) {
  var generateurl = "https://pokeapi.co/api/v2/" + "pokemon-species/" + name;
  $.ajax({
    type: "GET",
    url: generateurl,
    dataType: "json",
    async: true,
    success: function(data) {
      var rawPokeDex = data.flavor_text_entries[1].flavor_text;
      rawPokeDex = rawPokeDex.split(".");
      entry = rawPokeDex[0] + ".";
      appendOntoDoc('description', entry);
    }
  });
}

function addHeight(height) {
  appendOntoDoc('height', height);
}

function addWeight(weight) {
  appendOntoDoc('weight', weight);
}

function addName(name) {
  appendOntoDoc('pokemonName', name);
}

function addSprite(url) {
  stopSpin();
  var sprite = url;
  var source = document.getElementById('sprite');
  source.src = sprite;
}

function reset() {
  document.getElementById('pokemonName').innerHTML = '';
  document.getElementById('sprite').src = '';
  document.getElementById('height').innerHTML = '';
  document.getElementById('weight').innerHTML = '';
  document.getElementById('description').innerHTML = '';
  document.getElementById('type1').innerHTML = '';
  document.getElementById('type2').innerHTML = '';
}

/*
 * @param elementID The ID of the element we want to append text to
 * @param text The text we want to append
 */
function appendOntoDoc(elementId, text) {
  var source = document.getElementById(elementId);
  var pNode = document.createElement("p");
  var textNode = document.createTextNode(text);
  pNode.appendChild(textNode);
  source.appendChild(pNode);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
