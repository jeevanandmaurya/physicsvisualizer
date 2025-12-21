
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY;

async function listModels() {
  if (!apiKey) {
    console.error('VITE_GEMINI_API_KEY not found');
    return;
  }

  const versions = ['v1', 'v1beta'];
  
  for (const version of versions) {
    console.log(`--- Checking version ${version} ---`);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`);
      const data = await response.json();
      if (data.models) {
        data.models.forEach(m => console.log(m.name));
      } else {
        console.log(`No models found in ${version}:`, data);
      }
    } catch (error) {
      console.error(`Error fetching ${version}:`, error);
    }
  }
}

listModels();
