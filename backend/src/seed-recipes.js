// backend/src/seed-recipes.js
// Adds three background recipes with 0, 1 and 2 likes, so sorting by likes
// has something to show. Run from the backend folder:
//   npm run seed:recipes

import 'dotenv/config';
import mongoose from 'mongoose';
import { initDatabase } from './database/init.js';
import { User } from './models/user.js';
import { createUser } from './services/users.js';
import { createPost, likePost } from './services/post.js';

const RECIPES = [
  {
    title: 'Alfajores de maicena',
    ingredients: [
      '2 cups cornstarch',
      '1 cup flour',
      'Dulce de leche',
      'Shredded coconut',
    ],
    content:
      'Bake the cookies, sandwich them with dulce de leche, roll the edges in coconut.',
    likers: [],
  },
  {
    title: 'Empanadas salteñas',
    ingredients: [
      '12 empanada discs',
      '1 lb ground beef',
      '2 onions',
      '1 potato',
      'Cumin and paprika',
    ],
    content: 'Fill, fold and bake at 400°F for 20 minutes.',
    likers: ['seed_jorge'],
  },
  {
    title: 'Chimichurri',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/6/6e/Chimichurri_Sauce_Recipe_%2813294574784%29.jpg',
    ingredients: [
      '1 cup parsley',
      '4 garlic cloves',
      '1 tsp oregano',
      '1/2 cup olive oil',
      '3 tbsp red wine vinegar',
    ],
    content:
      'Chop everything finely, stir in the oil and vinegar, and rest 20 minutes.',
    likers: ['seed_jorge', 'seed_carla'],
  },
];

await initDatabase();

// Reuse the seed users if they already exist
async function seedUser(username) {
  return (
    (await User.findOne({ username })) ??
    (await createUser({ username, password: 'seed-pass-123' }))
  );
}

const author = await seedUser('seed_maria');
const fans = {
  seed_jorge: await seedUser('seed_jorge'),
  seed_carla: await seedUser('seed_carla'),
};

for (const { likers, ...recipe } of RECIPES) {
  const post = await createPost(author._id, recipe);
  for (const name of likers) await likePost(fans[name]._id, post._id);
  console.log(`Added "${recipe.title}" with ${likers.length} likes`);
}

await mongoose.disconnect();
