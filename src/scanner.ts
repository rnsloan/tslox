export enum TokenType {
  // one character tokens
  LEFT_PAREN = "LEFT_PAREN",
  RIGHT_PAREN = "RIGHT_PAREN",
  LEFT_BRACE = "LEFT_BRACE",
  RIGHT_BRACE = "RIGHT_BRACE",
  COMMA = "COMMA",
  DOT = "DOT",
  MINUS = "MINUS",
  PLUS = "PLUS",
  SEMICOLON = "SEMICOLON",
  SLASH = "SLASH",
  STAR = "STAR",

  // One or two character tokens
  BANG = "BANG",
  BANG_EQUAL = "BANG_EQUAL",
  EQUAL = "EQUAL",
  EQUAL_EQUAL = "EQUAL_EQUAL",
  GREATER = "GREATER",
  GREATER_EQUAL = "GREATER_EQUAL",
  LESS = "LESS",
  LESS_EQUAL = "LESS_EQUAL",

  // Literals
  IDENTIFIER = "IDENTIFIER",
  STRING = "STRING",
  NUMBER = "NUMBER",

  // Keywords
  AND = "AND",
  CLASS = "CLASS",
  ELSE = "ELSE",
  FALSE = "FALSE",
  FUN = "FUN",
  FOR = "FOR",
  IF = "IF",
  NIL = "NIL",
  OR = "OR",
  PRINT = "PRINT",
  RETURN = "RETURN",
  SUPER = "SUPER",
  THIS = "THIS",
  TRUE = "TRUE",
  VAR = "VAR",
  WHILE = "WHILE",

  EOF = "EOF",
}

const IDENTIFIERS: { [key: string]: TokenType } = {
  "and": TokenType.AND,
  "class": TokenType.CLASS,
  "else": TokenType.ELSE,
  "false": TokenType.FALSE,
  "fun": TokenType.FUN,
  "for": TokenType.FOR,
  "if": TokenType.IF,
  "nil": TokenType.NIL,
  "or": TokenType.OR,
  "print": TokenType.PRINT,
  "return": TokenType.RETURN,
  "super": TokenType.SUPER,
  "this": TokenType.THIS,
  "true": TokenType.TRUE,
  "var": TokenType.VAR,
  "while": TokenType.WHILE,
};

export interface IToken {
  type: TokenType;
  lexeme: string | number;
  literal: string | number | boolean | null;
  line: number;
  start: number;
  end: number;
}

interface AddToken extends Partial<IToken> {
  type: TokenType;
}

const isDigit = (c: string) => c?.match(/[0-9]/);
const isAlpha = (c: string) => c?.match(/_|[a-z]/i);
const isAlphaNumeric = (c: string) => isDigit(c) || isAlpha(c);

export function scanner(input: string): IToken[] {
  const output: IToken[] = [];
  const sep = input.split("");
  let position = 0;
  let line = 1;

  function addToken({
    type,
    lexeme = sep[position],
    literal = null,
    start = position,
    end = position,
  }: AddToken) {
    output.push({ type, line, lexeme, literal, start, end });
  }

  function match(character: string): boolean {
    if (sep[position + 1] === character) {
      position++;
      return true;
    }
    return false;
  }

  function peek(): string {
    return sep[position + 1];
  }

  function advance() {
    position++;
  }

  function string(quoteCharacter: string) {
    const start = position;

    advance();

    while (sep[position] !== quoteCharacter) {
      advance();
    }

    const end = position;

    addToken({
      type: TokenType.STRING,
      lexeme: input.slice(start + 1, end),
      start: start + 1,
      end: end - 1,
    });
  }

  function number() {
    const start = position;

    while (isDigit(peek()) || peek() === ".") {
      advance();
    }

    const end = position;

    addToken({
      type: TokenType.NUMBER,
      lexeme: input.slice(start, end + 1),
      literal: Number(input.slice(start, end + 1)),
      start,
      end,
    });
  }

  function identifier() {
    const start = position;

    advance();

    while (isAlphaNumeric(peek())) {
      advance();
    }

    const end = position;
    const value = input.slice(start, end + 1);
    let tokenType = TokenType.IDENTIFIER;
    let literal;

    if (IDENTIFIERS[value]) {
      tokenType = IDENTIFIERS[value];
    }

    if (tokenType === TokenType.TRUE) {
      literal = true;
    }

    if (tokenType === TokenType.FALSE) {
      literal = false;
    }

    addToken({
      type: tokenType,
      lexeme: value,
      literal,
      start: start,
      end: end,
    });
  }

  while (position < sep.length) {
    switch (sep[position]) {
      // one character tokens
      case "(":
        addToken({ type: TokenType.LEFT_PAREN });
        break;
      case ")":
        addToken({ type: TokenType.RIGHT_PAREN });
        break;
      case "{":
        addToken({ type: TokenType.LEFT_BRACE });
        break;
      case "}":
        addToken({ type: TokenType.RIGHT_BRACE });
        break;
      case ",":
        addToken({ type: TokenType.COMMA });
        break;
      case ".":
        addToken({ type: TokenType.DOT });
        break;
      case "-":
        addToken({ type: TokenType.MINUS });
        break;
      case "+":
        addToken({ type: TokenType.PLUS });
        break;
      case ";":
        addToken({ type: TokenType.SEMICOLON });
        break;
      case "*":
        addToken({ type: TokenType.STAR });
        break;
      // One or two character tokens
      case "!":
        match("=")
          ? addToken({
            type: TokenType.BANG_EQUAL,
            lexeme: `!=`,
            end: position + 1,
          })
          : addToken({ type: TokenType.BANG });
        break;
      case "=":
        match("=")
          ? addToken({
            type: TokenType.EQUAL_EQUAL,
            lexeme: `==`,
            end: position + 1,
          })
          : addToken({ type: TokenType.EQUAL });
        break;
      case "<":
        match("=")
          ? addToken({
            type: TokenType.LESS_EQUAL,
            lexeme: `<=`,
            end: position + 1,
          })
          : addToken({ type: TokenType.LESS });
        break;
      case ">":
        match("=")
          ? addToken({
            type: TokenType.GREATER_EQUAL,
            lexeme: `>=`,
            end: position + 1,
          })
          : addToken({ type: TokenType.GREATER });
        break;
      // Slash or comment
      case "/":
        if (match("/")) {
          while (peek() != "\n" && position < sep.length) {
            advance();
          }
          break;
        }
        addToken({ type: TokenType.SLASH });
        break;
      case '"':
        string('"');
        break;
      case "'":
        string("'");
        break;
      // ignored tokens
      case " ":
      case "\r":
      case "\t":
        break;
      case "\n":
        line++;
        break;
      default:
        if (isDigit(sep[position])) {
          number();
        } else if (isAlpha(sep[position])) {
          identifier();
        } else {
          throw new Error(
            `Unexpected character '${sep[position]}' {${line}:${position}}`,
          );
        }
    }

    position++;
  }

  addToken({
    type: TokenType.EOF,
    lexeme: "",
    literal: null,
    start: position + 1,
    end: position + 1,
  });
  return output;
}
