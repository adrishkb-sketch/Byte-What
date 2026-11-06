import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// We can build the seed directly
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Let's create seed.sql
console.log('Generating seed.sql...');

