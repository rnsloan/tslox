import { assertObjectMatch } from "https://deno.land/std@0.141.0/testing/asserts.ts";
import { scanner, TokenType } from "./scanner.ts";

Deno.test("Two character tokens", () => {
  let output = scanner("=");
  assertObjectMatch(output[0], { lexeme: `=`, type: TokenType.EQUAL });

  output = scanner("!=");
  assertObjectMatch(output[0], { lexeme: `!=`, type: TokenType.BANG_EQUAL });

  output = scanner("==");
  assertObjectMatch(output[0], { lexeme: `==`, type: TokenType.EQUAL_EQUAL });

  output = scanner("<");
  assertObjectMatch(output[0], { lexeme: `<`, type: TokenType.LESS });

  output = scanner("<=");
  assertObjectMatch(output[0], { lexeme: `<=`, type: TokenType.LESS_EQUAL });

  output = scanner(">");
  assertObjectMatch(output[0], { lexeme: `>`, type: TokenType.GREATER });

  output = scanner(">=");
  assertObjectMatch(output[0], { lexeme: `>=`, type: TokenType.GREATER_EQUAL });
});

Deno.test("Comments", () => {
  let output = scanner("/");
  assertObjectMatch(output[0], { lexeme: `/`, type: TokenType.SLASH });

  output = scanner(
    `// this is a comment
=`,
  );

  assertObjectMatch(output[0], { lexeme: "=", type: TokenType.EQUAL });
});

Deno.test("Strings", () => {
  let output = scanner(`"Hello World"`);
  assertObjectMatch(output[0], {
    lexeme: "Hello World",
    type: TokenType.STRING,
    start: 1,
    end: 11,
  });

  output = scanner(`'Hello World'`);
  assertObjectMatch(output[0], {
    lexeme: "Hello World",
    type: TokenType.STRING,
    start: 1,
    end: 11,
  });
});

Deno.test("Numbers", () => {
  let output = scanner(`934738`);
  assertObjectMatch(output[0], {
    lexeme: "934738",
    literal: 934738,
    type: TokenType.NUMBER,
    start: 0,
    end: 5,
  });

  output = scanner(`34.4567`);
  assertObjectMatch(output[0], {
    lexeme: "34.4567",
    literal: 34.4567,
    type: TokenType.NUMBER,
    start: 0,
    end: 6,
  });

  output = scanner('4 + 5');
  assertObjectMatch(output[0], {
    lexeme: "4",
    literal: 4,
    type: TokenType.NUMBER,
    start: 0,
    end: 0,
  });
});

Deno.test("keywords", () => {
  const output = scanner(`print "hello world"`);
  assertObjectMatch(output[0], {
    lexeme: "print",
    type: TokenType.PRINT,
    start: 0,
    end: 4,
  });
});

Deno.test("identifers", () => {
  const output = scanner(`var foo = "hello world"`);
  assertObjectMatch(output[1], {
    lexeme: "foo",
    type: TokenType.IDENTIFIER,
    start: 4,
    end: 6,
  });
});

Deno.test("lines", () => {
  const output = scanner(
    `print "hello";
  print "world"`,
  );

  assertObjectMatch(output[0], {
    type: TokenType.PRINT,
    line: 1,
  });
  assertObjectMatch(output[3], {
    type: TokenType.PRINT,
    line: 2,
  });
});

Deno.test("end of file", () => {
  const output = scanner(`var foo = "hello world"`);
  assertObjectMatch(output[output.length - 1], {
    type: TokenType.EOF,
    literal: null,
  });
});
