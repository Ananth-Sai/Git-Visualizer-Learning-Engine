// Command Lexer: splits input string while respecting single and double quotes
export function tokenizeCommand(input: string): string[] {
  const tokens: string[] = [];
  let currentToken = '';
  let insideSingleQuote = false;
  let insideDoubleQuote = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === "'" && !insideDoubleQuote) {
      insideSingleQuote = !insideSingleQuote;
    } else if (char === '"' && !insideSingleQuote) {
      insideDoubleQuote = !insideDoubleQuote;
    } else if (char === ' ' && !insideSingleQuote && !insideDoubleQuote) {
      if (currentToken.length > 0) {
        tokens.push(currentToken);
        currentToken = '';
      }
    } else {
      currentToken += char;
    }
  }

  if (currentToken.length > 0) {
    tokens.push(currentToken);
  }

  return tokens;
}
