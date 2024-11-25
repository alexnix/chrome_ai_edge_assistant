const parser = require('./dsl.cjs');

//const input = `chat left`;
const input = 'task "ce pula mea" high'

try {
  const result = parser.parse(input);
  console.log('Parsed Output:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error:', error.message);
}

