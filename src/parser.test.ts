import { describe, it } from "https://deno.land/std@0.141.0/testing/bdd.ts";
import { assertObjectMatch } from "https://deno.land/std@0.141.0/testing/asserts.ts";
import { parser } from "./parser.ts";
import { TokenType } from "./scanner.ts";

describe("Parser", () => {
  it("should parse variables", () => {
    const tokens = [
      {
        type: TokenType.VAR,
        line: 2,
        lexeme: "var",
        literal: null,
        start: 25,
        end: 27,
      },
      {
        type: TokenType.IDENTIFIER,
        line: 2,
        lexeme: "hello",
        literal: null,
        start: 29,
        end: 33,
      },
      {
        type: TokenType.EQUAL,
        line: 2,
        lexeme: "=",
        literal: null,
        start: 35,
        end: 35,
      },
      {
        type: TokenType.NUMBER,
        line: 2,
        lexeme: "12.45",
        literal: 12.45,
        start: 37,
        end: 41,
      },
      {
        type: TokenType.SEMICOLON,
        line: 2,
        lexeme: ";",
        literal: null,
        start: 42,
        end: 42,
      },
      {
        type: TokenType.VAR,
        line: 3,
        lexeme: "var",
        literal: null,
        start: 44,
        end: 46,
      },
      {
        type: TokenType.IDENTIFIER,
        line: 3,
        lexeme: "world",
        literal: null,
        start: 48,
        end: 52,
      },
      {
        type: TokenType.SEMICOLON,
        line: 3,
        lexeme: ";",
        literal: null,
        start: 53,
        end: 53,
      },
      {
        type: TokenType.EOF,
        line: 3,
        lexeme: "",
        literal: null,
        start: 55,
        end: 55,
      },
    ];
    const ast = parser(tokens);

    assertObjectMatch(ast.root?.children[0].data, {
      type: "VariableDeclaration",
      declarations: [
        {
          type: "VariableDeclarator",
          id: { type: "Identifier", name: "hello" },
          init: { type: "Literal", value: 12.45, raw: "12.45" },
        },
      ],
    });
    assertObjectMatch(ast.root?.children[1].data, {
      type: "VariableDeclaration",
      declarations: [
        {
          type: "VariableDeclarator",
          id: { type: "Identifier", name: "world" },
          init: { type: "Literal", value: null, raw: null },
        },
      ],
    });
  });
});
