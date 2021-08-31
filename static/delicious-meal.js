// Recipes API keys
const APP_ID = 'cf1c91b8';
const APP_KEY = '72b1eb8d8754c0ee0300fb417f6b030';
const BASE_API = 'https://api.edamam.com/api/recipes/v2';

// Ingredients API keys
const APP_ID_FOOD = '775fa9c8';
const APP_KEY_FOOD = '4f6e6cd03e0174dd06091cff9333fc4b';
const BASE_API_FOOD = 'https://api.edamam.com/api/food-database/v2/parser';

// Base Url
const BASE_URL = 'https://beautiful-meal.herokuapp.com' || 'http://localhost:5000';

/********* HOME FUNCTIONS *****************************************************/
/** processRecipeForm: get data from form and make AJAX call to our 
 * Edamam's recipe form. */
async function processRecipeForm (evt) {
	evt.preventDefault();

	const $ingredient = $('#search_box').val();

	const res = await axios.get(`${BASE_API}/?type=public&q=${$ingredient}`, {
		params: {
			app_id: APP_ID,
			app_key: APP_KEY,
		},
	});

	console.log(res);
	handleRecipeResponse(res);
}

/** handleRecipeResponse: deal with response from Edamam's recipe API. */
function handleRecipeResponse (res) {
	const $result = $('#search_result');
	const recipes = res.data.hits;

	$result.empty();
	for (let recipe of recipes) {
		$result.append(renderRecipe(recipe));
	}
}

/** renderRecipe: return html to render on homepage */
function renderRecipe (recipe) {
	let ingredients = recipe.recipe.ingredients;
	let image = recipe.recipe.image;
	const $username = $('#hidden_user').attr('name').toString();

	return `
        <div class="row">
            <div class="col-sm">
                <h3><b>${recipe.recipe.label}</b></h3>
                <a href=${recipe.recipe
			.url}><img src=${image} onError="this.onerror=null; this.className='default-image'; this.src='/static/images/no-image-found.png';"></a>
                <h4>Ingredients:</h4>
                <p><b>Calories: ${recipe.recipe.calories.toFixed(0)}</b></p>
                <ul class="list-group">
                    ${ingredients
				.map((ingredient) => {
					if (ingredient.text.includes($('#search_box').val())) {
						return `<li class="list-group-item list-group-item-primary">
                    ${ingredient.text}</li>`;
					} else {
						return `<li class="list-group-item">${ingredient.text}</li>`;
					}
				})
				.join('')}
                </ul>
                <div class="dropdown">
                    <button id="btn_add_daily" class="btn btn-success dropdown-toggle"
                    data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-bread-slice"></i>
                        Add Daily
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="btn_add_daily">
                        <li><a id="add_breakfast" class="dropdown-item" onclick="addingBreakfast(event, '${$username}');">Breakfast</a></li>
                        <li><a id="add_lunch" class="dropdown-item" onclick="addingLunch(event, '${$username}');">Lunch</a></li>
                        <li><a id="add_dinner" class="dropdown-item" onclick="addingDinner(event, '${$username}');">Dinner</a></li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

/** processIngredientsForm: get data from form and make AJAX call to our 
 * Edamam's ingredient form. */
async function processIngredientForm (evt) {
	evt.preventDefault();

	const $ingredient = $('#search_box_2').val();

	const res = await axios.get(`${BASE_API_FOOD}?app_id=${APP_ID_FOOD}&app_key=${APP_KEY_FOOD}&ingr=${$ingredient}&nutrition-type=cooking
        `);

	console.log(res);
	handleIngredientResponse(res);
}

/** handleIngredientResponse: deal with response from Edamam's ingredient API. */
function handleIngredientResponse (res) {
	const $result = $('#search_result');
	const ingredients = res.data.hints;

	$result.empty();
	for (let ingredient of ingredients) {
		$result.append(renderIngredient(ingredient));
	}
}

/** renderIngredient: return html to render on homepage */
function renderIngredient (food) {
	let nutrients = food.food.nutrients;
	let image = food.food.image;
	const $username = $('#hidden_user').attr('name').toString();
	const plans = $('#hidden_plans').text().split(',');

	const htmlPlans = addPlans(plans, $username);

	return `
        <div class="row">
            <div class="col-sm">
                <h3><b>${food.food.label}</b></h3>
                <img src=${image} onError="this.onerror=null; this.className='default-image'; this.src='/static/images/no-image-found.png';"></a>
                <h4>Category: ${food.food.category}</h4>
                <ul class="list-group">
                    <li id="kcal" class="list-group-item">ENERGY (KCAL) : <b>${nutrients.ENERC_KCAL.toFixed(0)}</b></li>
                    <li id="pro" class="list-group-item">PROTEIN : <b>${nutrients.PROCNT.toFixed(0)}</b></li>
                    <li id="fat" class="list-group-item">FAT : <b>${nutrients.FAT.toFixed(0)}</b></li>
                    <li id="car" class="list-group-item">CARBOHYDRATES : <b>${nutrients.CHOCDF.toFixed(0)}</b></li>
                    <li id="fib" class="list-group-item">DIETARY FIBER : <b>${nutrients.FIBTG.toFixed(0)}</b></li>
                </ul>
                <div class="dropdown">
                    <button id="btn_add_daily" class="btn btn-success dropdown-toggle"
                    data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-bread-slice"></i>
                        Add to Recipe
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="btn_add_recipe">
                        ${htmlPlans}
                        <li><a id="new_recipe" class="dropdown-item" href="/users/add_recipe">New Recipe</a></li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

/********* ADDING DAILY/MONTHLY MEALS FUNCTIONS **********************************************/
/** addingBreakfast: sends POST request to server with JSON values (name, calories, username) */
async function addingBreakfast (evt, username) {
	evt.preventDefault();

	const $column = $(evt.target).parents('div').last().prevObject;
	const $name = $column.children('h3').text();
	const $calories = $column.children('p').text().replace(/\D/g, '');

	axios.defaults.withCredentials = true;

	await axios({
		method: 'post',
		url: `${BASE_URL}/users/add_breakfast`,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
		data: {
			name: $name,
			username: username,
			calories: $calories,
		},
		withCredentials: true,
		credentials: 'same-origin',
	});
}
/** addingLunch: sends POST request to server with JSON values (name, calories, username) */
async function addingLunch (evt, username) {
	evt.preventDefault();

	const $column = $(evt.target).parents('div').last().prevObject;
	const $name = $column.children('h3').text();
	const $calories = $column.children('p').text().replace(/\D/g, '');

	axios.defaults.withCredentials = true;

	await axios({
		method: 'post',
		url: `${BASE_URL}/users/add_lunch`,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
		data: {
			name: $name,
			username: username,
			calories: $calories,
		},
	});
}

/** addingDinner: sends POST request to server with JSON values (name, calories, username) */
async function addingDinner (evt, username) {
	evt.preventDefault();

	const $column = $(evt.target).parents('div').last().prevObject;
	const $name = $column.children('h3').text();
	const $calories = $column.children('p').text().replace(/\D/g, '');

	axios.defaults.withCredentials = true;

	await axios({
		method: 'post',
		url: `${BASE_URL}/users/add_dinner`,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
		data: {
			name: $name,
			username: username,
			calories: $calories,
		},
	});
}
/** addPlans: returns a html list rendering for all the plans available for the user */
function addPlans (plans, username) {
	let result = '';
	plans.splice(-1);

	for (plan of plans) {
		result += `<li><a id="new_recipe" class="dropdown-item" 
        onclick="addingIngredient(event,'${username}');">${plan}</a></li>`;
	}

	return result;
}

/********* ADDING INGREDIENTS/RECIPE FUNCTIONS **********************************************/
/** addingIngredient: sends POST request to server with 
 * JSON values(recipe_name, name, energy, protein, fat, carbohydrates, fiber)  */
async function addingIngredient (evt, username) {
	evt.preventDefault();

	const $column = $(evt.target).parents('div').last().prevObject;
	const $recipe_name = $(evt.target).text();
	const $name = $column.children('h3').text();
	const $energy = $column.children('ul').children('#kcal').text().replace(/\D/g, '');
	const $protein = $column.children('ul').children('#pro').text().replace(/\D/g, '');
	const $fat = $column.children('ul').children('#fat').text().replace(/\D/g, '');
	const $carbohydrates = $column.children('ul').children('#car').text().replace(/\D/g, '');
	const $fiber = $column.children('ul').children('#fib').text().replace(/\D/g, '');

	await axios({
		method: 'post',
		url: `${BASE_URL}/users/add_ingredient`,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
		data: {
			recipe_name: $recipe_name,
			name: $name,
			username: username,
			energy: $energy,
			protein: $protein,
			fat: $fat,
			carbohydrates: $carbohydrates,
			fiber: $fiber,
		},
	}).then((res) => {
		console.log(res);
	});
}

/** addingRecipeToBreakfast: sends POST request to server with JSON values (name, calories, username) */
async function addingRecipeToBreakfast (evt, username) {
	evt.preventDefault();

	const $column = $(evt.target).parents('div').last().prevObject;
	const $name = $column.children('p').text();
	const $calories = $column.children('ul').children('#kcal').text().replace(/\D/g, '');

	await axios({
		method: 'post',
		url: `${BASE_URL}/users/add_breakfast`,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
		data: {
			name: $name,
			username: username,
			calories: $calories,
		},
	});
}

/** addingRecipeToLunch: sends POST request to server with JSON values (name, calories, username) */
async function addingRecipeToLunch (evt, username) {
	evt.preventDefault();

	const $column = $(evt.target).parents('div').last().prevObject;
	const $name = $column.children('p').text();
	const $calories = $column.children('ul').children('#kcal').text().replace(/\D/g, '');

	await axios({
		method: 'post',
		url: `${BaseUrl}/users/add_lunch`,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
		data: {
			name: $name,
			username: username,
			calories: $calories,
		},
	});
}

/** addingRecipeToDinner: sends POST request to server with JSON values (name, calories, username) */
async function addingRecipeToDinner (evt, username) {
	evt.preventDefault();

	const $column = $(evt.target).parents('div').last().prevObject;
	const $name = $column.children('p').text();
	const $calories = $column.children('ul').children('#kcal').text().replace(/\D/g, '');

	await axios({
		method: 'post',
		url: `${BaseUrl}/users/add_dinner`,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
		data: {
			name: $name,
			username: username,
			calories: $calories,
		},
	});
}
/********* JQUERY SELECTIONS AND PROCESSING**********************************************/
$('#search_recipe_form').on('submit', processRecipeForm);
$('#search_ingredient_form').on('submit', processIngredientForm);
