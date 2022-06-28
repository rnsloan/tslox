import { describe, it } from "https://deno.land/std@0.141.0/testing/bdd.ts";
import { assertObjectMatch } from "https://deno.land/std@0.141.0/testing/asserts.ts";
import { IProgram, parser } from "./parser.ts";
import { TokenType } from "./scanner.ts";
import { Tree } from "./tree.ts";

describe("Parser", () => {
  describe("Variables", () => {
    it("should parse identifiers", () => {
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

      assertObjectMatch(
        ast.root?.children[0].data as unknown as Tree<IProgram>,
        {
          type: "VariableDeclaration",
          declarations: [
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name: "hello" },
              init: { type: "Literal", value: 12.45, raw: "12.45" },
            },
          ],
        },
      );
      assertObjectMatch(
        ast.root?.children[1].data as unknown as Tree<IProgram>,
        {
          type: "VariableDeclaration",
          declarations: [
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name: "world" },
              init: { type: "Literal", value: null, raw: null },
            },
          ],
        },
      );
    });

    it("should parse unary expressions", () => {
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
          lexeme: "bar",
          literal: null,
          start: 29,
          end: 31,
        },
        {
          type: TokenType.EQUAL,
          line: 2,
          lexeme: "=",
          literal: null,
          start: 33,
          end: 33,
        },
        {
          type: TokenType.BANG,
          line: 2,
          lexeme: "!",
          literal: null,
          start: 35,
          end: 35,
        },
        {
          type: TokenType.BANG,
          line: 2,
          lexeme: "!",
          literal: null,
          start: 36,
          end: 36,
        },
        {
          type: TokenType.TRUE,
          line: 2,
          lexeme: "true",
          literal: true,
          start: 37,
          end: 40,
        },
        {
          type: TokenType.SEMICOLON,
          line: 2,
          lexeme: ";",
          literal: null,
          start: 41,
          end: 41,
        },
        {
          type: TokenType.EOF,
          line: 2,
          lexeme: "",
          literal: null,
          start: 43,
          end: 43,
        },
      ];
      const ast = parser(tokens);

      assertObjectMatch(
        ast.root?.children[0].data as unknown as Tree<IProgram>,
        {
          type: "VariableDeclaration",
          declarations: [
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name: "bar" },
              init: {
                type: "UnaryExpression",
                operator: "!",
                prefix: true,
                argument: {
                  type: "UnaryExpression",
                  operator: "!",
                  prefix: true,
                  argument: { type: "Literal", value: true, raw: "true" },
                },
              },
            },
          ],
        },
      );
    });

    it("should parse binary expressions", () => {
      const tokens = [
        {
          type: TokenType.VAR,
          line: 4,
          lexeme: "var",
          literal: null,
          start: 63,
          end: 65,
        },
        {
          type: TokenType.IDENTIFIER,
          line: 4,
          lexeme: "baz",
          literal: null,
          start: 67,
          end: 69,
        },
        {
          type: TokenType.EQUAL,
          line: 4,
          lexeme: "=",
          literal: null,
          start: 71,
          end: 71,
        },
        {
          type: TokenType.LEFT_PAREN,
          line: 4,
          lexeme: "(",
          literal: null,
          start: 73,
          end: 73,
        },
        {
          type: TokenType.NUMBER,
          line: 4,
          lexeme: "5",
          literal: 5,
          start: 74,
          end: 74,
        },
        {
          type: TokenType.STAR,
          line: 4,
          lexeme: "*",
          literal: null,
          start: 75,
          end: 75,
        },
        {
          type: TokenType.NUMBER,
          line: 4,
          lexeme: "10",
          literal: 10,
          start: 76,
          end: 77,
        },
        {
          type: TokenType.RIGHT_PAREN,
          line: 4,
          lexeme: ")",
          literal: null,
          start: 78,
          end: 78,
        },
        {
          type: TokenType.SLASH,
          line: 4,
          lexeme: "/",
          literal: null,
          start: 79,
          end: 79,
        },
        {
          type: TokenType.NUMBER,
          line: 4,
          lexeme: "2",
          literal: 2,
          start: 80,
          end: 80,
        },
        {
          type: TokenType.EOF,
          line: 4,
          lexeme: "",
          literal: null,
          start: 82,
          end: 82,
        },
      ];
      const ast = parser(tokens);

      assertObjectMatch(
        ast.root?.children[0].data as unknown as Tree<IProgram>,
        {
          type: "VariableDeclaration",
          declarations: [
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name: "baz" },
              init: {
                type: "BinaryExpression",
                operator: "/",
                left: {
                  type: "BinaryExpression",
                  operator: "*",
                  left: { type: "Literal", value: 5, raw: "5" },
                  right: { type: "Literal", value: 10, raw: "10" },
                },
                right: { type: "Literal", value: 2, raw: "2" },
              },
            },
          ],
        },
      );

      const tokens2 = [
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
          lexeme: "bar",
          literal: null,
          start: 29,
          end: 31,
        },
        {
          type: TokenType.EQUAL,
          line: 2,
          lexeme: "=",
          literal: null,
          start: 33,
          end: 33,
        },
        {
          type: TokenType.LEFT_PAREN,
          line: 2,
          lexeme: "(",
          literal: null,
          start: 35,
          end: 35,
        },
        {
          type: TokenType.NUMBER,
          line: 2,
          lexeme: "2",
          literal: 2,
          start: 36,
          end: 36,
        },
        {
          type: TokenType.PLUS,
          line: 2,
          lexeme: "+",
          literal: null,
          start: 37,
          end: 37,
        },
        {
          type: TokenType.NUMBER,
          line: 2,
          lexeme: "10",
          literal: 10,
          start: 38,
          end: 39,
        },
        {
          type: TokenType.RIGHT_PAREN,
          line: 2,
          lexeme: ")",
          literal: null,
          start: 40,
          end: 40,
        },
        {
          type: TokenType.SLASH,
          line: 2,
          lexeme: "/",
          literal: null,
          start: 41,
          end: 41,
        },
        {
          type: TokenType.NUMBER,
          line: 2,
          lexeme: "2",
          literal: 2,
          start: 42,
          end: 42,
        },
        {
          type: TokenType.EOF,
          line: 2,
          lexeme: "",
          literal: null,
          start: 44,
          end: 44,
        },
      ];
      const ast2 = parser(tokens2);

      assertObjectMatch(
        ast2.root?.children[0].data as unknown as Tree<IProgram>,
        {
          type: "VariableDeclaration",
          declarations: [
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name: "bar" },
              init: {
                type: "BinaryExpression",
                operator: "/",
                left: {
                  type: "BinaryExpression",
                  operator: "+",
                  left: { type: "Literal", value: 2, raw: "2" },
                  right: { type: "Literal", value: 10, raw: "10" },
                },
                right: { type: "Literal", value: 2, raw: "2" },
              },
            },
          ],
        },
      );
    });
  });
});
