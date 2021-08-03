// Recipes API keys
const APP_ID = 'cf1c91b8';
const APP_KEY = 'c72b1eb8d8754c0ee0300fb417f6b030';
const BASE_API = 'https://api.edamam.com/api/recipes/v2';

// Ingredients API keys
const APP_ID_FOOD = '775fa9c8';
const APP_KEY_FOOD = '4f6e6cd03e0174dd06091cff9333fc4b';
const BASE_API_FOOD = 'https://api.edamam.com/api/food-database/v2/parser';

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
                        <li><a id="add_breakfast" class="dropdown-item" href="/users/add_breakfast" onclick="addingBreakfast(event);">Breakfast</a></li>
                        <li><a id="add_lunch" class="dropdown-item" href="#">Lunch</a></li>
                        <li><a id="add_dinner" class="dropdown-item" href="#">Dinner</a></li>
                    </ul>
                    <button id="btn_add_month" class="btn btn-primary dropdown-toggle"
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="far fa-calendar-alt"></i>
                        Add Month
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="btn_add_month">
                        <li><a class="dropdown-item" href="#">This Month</a></li>
                        <li><a class="dropdown-item" href="#">Next Month</a></li>
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

	return `
        <div class="row">
            <div class="col-sm">
                <h3><b>${food.food.label}</b></h3>
                <img src=${image} onError="this.onerror=null; this.className='default-image'; this.src='/static/images/no-image-found.png';"></a>
                <h4>Category: ${food.food.category}</h4>
                <ul class="list-group">
                    <li class="list-group-item">ENERC_KCAL : <b>${nutrients.ENERC_KCAL.toFixed(0)}</b></li>
                    <li class="list-group-item">PROCNT : <b>${nutrients.PROCNT.toFixed(0)}</b></li>
                    <li class="list-group-item">FAT : <b>${nutrients.FAT.toFixed(0)}</b></li>
                    <li class="list-group-item">CHOCDF : <b>${nutrients.CHOCDF.toFixed(0)}</b></li>
                    <li class="list-group-item">FIBTG : <b>${nutrients.FIBTG.toFixed(0)}</b></li>
                </ul>
                <div class="dropdown">
                    <button id="btn_add_daily" class="btn btn-success dropdown-toggle"
                    data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-bread-slice"></i>
                        Add to Recipe
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="btn_add_recipe">
                        <ul class="dropdown-menu" aria-labelledby="btn_add_recipe">
                            <li><a class="dropdown-item" href="#">Quantity</a></li>
                        </ul>
                    </ul>
                    <button id="btn_add_month" class="btn btn-primary dropdown-toggle"
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="far fa-calendar-alt"></i>
                        Add Month
                    </button>
                </div>
            </div>
        </div>
    `;
}

/********* ADDING DAILY/MONTHLY MEALS FUNCTIONS **********************************************/
async function addingBreakfast (evt) {
	const $column = $(evt.target).parents('div').last().prevObject;
	const $name = $column.children('h3').text();
	const $calories = $column.children('p').text().replace(/\D/g, '');

	const res = await axios({
		method: 'post',
		url: 'http://localhost:5000/users/add_breakfast',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
		data: {
			name: $name,
			calories: $calories,
		},
	});
	console.log(res);
}

/********* JQUERY SELECTIONS AND PROCESSING**********************************************/
$('#search_recipe_form').on('submit', processRecipeForm);
$('#search_ingredient_form').on('submit', processIngredientForm);

$('#add_breakfast').closest('button').on('click', addingBreakfast);
