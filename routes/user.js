const express = require('express');
const router = express.Router();
const data = require('../data')
const ObjectId = require('mongodb').ObjectId;
const userData = data.users;
const recipesData = data.recipes;
const xss = require('xss');

router.get('/private', async (req, res) => {
    if (req.session.user) {
        let islogin = true;
        let username = req.session.user;
        let title = "Private";
        let userInfo = await userData.getUserByUsername(username);
        let firstName = userInfo.firstname;
        let lastName = userInfo.lastname;
        let email = userInfo.email;
        let favoriteRecipesId = userInfo.favoriteRecipes;
        let favoriteRecipesName = []
        for (let i = 0; i < favoriteRecipesId.length; i++) {
            let favoriteRecipesIdInfo = await recipesData.getRecipeById(favoriteRecipesId[i]);
            favoriteRecipesName[i] = {
                name: favoriteRecipesIdInfo.name,
                id: favoriteRecipesId[i]
            }
        }
        res.render('private', {
            userName: username,
            firstName: firstName,
            lastName: lastName,
            email: email,
            favoriteRecipesName: favoriteRecipesName,
            title: title,
            islogin: islogin
        });
    } else {
        let title = "Login";
        res.render('login', { title: title });
        return;
    }
});
router.post('/private', async (req, res) => {
    // console.log("sdasdasdasd");
    // console.log(req.body);
    let username = req.session.user;
    let userInfo = await userData.getUserByUsername(username);
    let firstName = xss(req.body.firstname);
    let lastName = xss(req.body.lastname);
    let email = xss(req.body.email);
    let userId = userInfo._id.toString();
    let deleteFavoritesRecipesId = req.body.favoriteRecipesNameDeleteID;
    let updateInfo = {
        firstname: firstName,
        lastname: lastName,
        email: email
    }
    
    let updateResult = await userData.updateUser(userId, updateInfo);
    for (let i = 0; i < deleteFavoritesRecipesId.length; i++) {
        let deleteFavoritesRecipes = await userData.deleteToFavorite(userId, deleteFavoritesRecipesId[i]);
        console.log(deleteFavoritesRecipes)
    }
    try {
        let userInfoUpdate = await userData.getUserByUsername(username);
        let favoriteRecipesId = userInfoUpdate.favoriteRecipes;
        let favoriteRecipesName = []
        for (let i = 0; i < favoriteRecipesId.length; i++) {
            let favoriteRecipesIdInfo = await recipesData.getRecipeById(favoriteRecipesId[i]);
            favoriteRecipesName[i] = {
                name: favoriteRecipesIdInfo.name,
                id: favoriteRecipesId[i]
            }
        }
        let islogin = true;
        let title = "Private";
        res.render('private', {
            userName: username,
            firstName: firstName,
            lastName: lastName,
            email: email,
            favoriteRecipesName: favoriteRecipesName,
            title: title,
            islogin: islogin
        });
    } catch (e) {
        res.status(500);
        res.render('private', { error: e })
        return;
    }
})

router.get('/addNewRecipe', async (req, res) => {
    if (req.session.user) {
        let title = "addNewRecipe";
        let islogin = true;
        res.render('addNewRecipe', { title: title, islogin: islogin });
        return;
    } else {
        let title = "Login";
        res.render('login', { title: title });
        return;
    }
})

router.post('/addNewRecipe', async (req, res) => {
    let name = xss(req.body.name);
    let preparationTime = parseInt(xss(req.body.preparationTime));
    let cookTime = parseInt(xss(req.body.cookTime));
    let recipeType = xss(req.body.recipeType);
    let season = xss(req.body.season);

    let ingredients = req.body.ingredients;
    let foodGroup = req.body.foodGroup;
    let nutritionDetails = req.body.nutritionDetails;
    let recipeSteps = req.body.recipeSteps;
    // let information = {
    //     ingredients:ingredients,
    //     foodGroup:foodGroup,
    //     nutritionDetails:nutritionDetails,
    //     recipeSteps: recipeSteps    
    // }
    try {
        let createRecipe = await recipesData.createRecipe(name, ingredients, preparationTime, cookTime, recipeType, foodGroup, season, nutritionDetails, recipeSteps)
        let islogin = true;
        let title = "Private";
        //console.log(createRecipe)
        res.render('private', {
            title: title,
            islogin: islogin
        });
    } catch (e) {
        res.status(500);
        //let error = "Internal Server Error";
        console.log(e)
        res.render('addNewRecipe', { error: e })
        return;
    }

})



module.exports = router;