import express from 'express';
import { PORT, mongoDBURL } from './config.js';
import mongoose from 'mongoose';
import { Recipe } from './models/Recipe.js';
import cors from 'cors';
import { User } from './models/User.js';

const app = express();
app.use(express.json());
app.use(cors());

// Endpoint for creating a user
app.post('/users', async (req, res) => {
    const { name, email } = req.body;

    try {
        const existingUser = await User.aggregate([
            { $match: { email } },
            { $limit: 1 }
        ]);

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        const newUser = new User({ name, email });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});

// Endpoint for fetching all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.aggregate([{ $match: {} }]);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint for fetching a single user by ID
app.get('/users/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(userId) } }, // Added 'new' keyword
            { $limit: 1 }
        ]);

        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Endpoint to update a user's details
app.put('/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { name, email } = req.body;

  try {
      const updatedUser = await User.findByIdAndUpdate(
          userId,
          { name, email },
          { new: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(updatedUser);
  } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
  }
});

// Endpoint to delete a user and all their recipes
app.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Delete the user
      await User.findByIdAndDelete(userId);

      // Delete all recipes created by the user
      await Recipe.deleteMany({ createdBy: user._id });

      res.status(204).send(); // Successfully deleted, no content to return
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});


// Endpoint for fetching all recipes
app.get('/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.aggregate([{ $match: {} }]);
        res.status(200).json(recipes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint for creating a recipe
app.post('/recipes', async (req, res) => {
  const { name, ingredients, instructions, createdBy } = req.body;

  try {
      // Find the user by ID to check if they exist
      const user = await User.findById(createdBy);

      if (!user) { // Check if user is null or undefined
          return res.status(400).json({ error: 'User does not exist' });
      }

      // Create the new recipe
      const newRecipe = new Recipe({
          name,
          ingredients: ingredients.split(','),
          instructions,
          createdBy: user._id // Pass user ID directly
      });

      await newRecipe.save();
      res.status(201).json(newRecipe);
  } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
  }
});


// Endpoint for updating a recipe
app.put('/recipes/:id', async (req, res) => {
    const { id } = req.params;
    const { name, ingredients, instructions, createdBy } = req.body;

    try {
        const updatedRecipe = await Recipe.findByIdAndUpdate(
            id,
            { name, ingredients: ingredients.split(','), instructions, createdBy },
            { new: true }
        );
        res.status(200).json(updatedRecipe);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint for deleting a recipe
app.delete('/recipes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await Recipe.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint for recipe report with optional filters
app.get('/recipes/report', async (req, res) => {
  const { createdBy, name, ingredients } = req.query;
  const filter = [];

  // Only add createdBy filter if it is specified and non-empty
  if (createdBy && createdBy.trim() !== "") {
      try {
          filter.push({ $match: { createdBy: new mongoose.Types.ObjectId(createdBy) } });
      } catch (error) {
          return res.status(400).json({ error: 'Invalid user ID format' });
      }
  }

  if (name) {
      filter.push({ $match: { name: { $regex: name, $options: 'i' } } });
  }

  if (ingredients) {
      filter.push({ $match: { ingredients: { $regex: ingredients, $options: 'i' } } });
  }

  try {
      // If no filters are applied, use an empty $match to get all recipes
      if (filter.length === 0) {
          filter.push({ $match: {} });
      }

      const recipes = await Recipe.aggregate(filter);
      const totalRecipes = recipes.length;
      res.status(200).json({ totalRecipes, recipes });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


mongoose
    .connect(mongoDBURL)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log(error);
    });
