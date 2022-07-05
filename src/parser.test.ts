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

    it("should parse member expressions", () => {
      const tokens = [
        {
          type: TokenType.VAR,
          line: 6,
          lexeme: "var",
          literal: null,
          start: 111,
          end: 113,
        },
        {
          type: TokenType.IDENTIFIER,
          line: 6,
          lexeme: "tan",
          literal: null,
          start: 115,
          end: 117,
        },
        {
          type: TokenType.EQUAL,
          line: 6,
          lexeme: "=",
          literal: null,
          start: 119,
          end: 119,
        },
        {
          type: TokenType.IDENTIFIER,
          line: 6,
          lexeme: "foo",
          literal: null,
          start: 121,
          end: 123,
        },
        {
          type: TokenType.DOT,
          line: 6,
          lexeme: ".",
          literal: null,
          start: 124,
          end: 124,
        },
        {
          type: TokenType.IDENTIFIER,
          line: 6,
          lexeme: "bar",
          literal: null,
          start: 125,
          end: 127,
        },
        {
          type: TokenType.DOT,
          line: 6,
          lexeme: ".",
          literal: null,
          start: 128,
          end: 128,
        },
        {
          type: TokenType.IDENTIFIER,
          line: 6,
          lexeme: "baz",
          literal: null,
          start: 129,
          end: 131,
        },
        {
          type: TokenType.DOT,
          line: 6,
          lexeme: ".",
          literal: null,
          start: 132,
          end: 132,
        },
        {
          type: TokenType.IDENTIFIER,
          line: 6,
          lexeme: "troll",
          literal: null,
          start: 133,
          end: 137,
        },
        {
          type: TokenType.EOF,
          line: 9,
          lexeme: "",
          literal: null,
          start: 152,
          end: 152,
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
              id: { type: "Identifier", name: "tan" },
              init: {
                type: "MemberExpression",
                object: {
                  type: "MemberExpression",
                  object: {
                    type: "MemberExpression",
                    object: { type: "Identifier", name: "foo" },
                    property: { type: "Identifier", name: "bar" },
                  },
                  property: { type: "Identifier", name: "baz" },
                },
                property: { type: "Identifier", name: "troll" },
              },
            },
          ],
        },
      );
    });
  });

  describe("Expression Statements", () => {
    it("should parse logical expressions", () => {
      const tokens = [
        {
          type: TokenType.IDENTIFIER,
          line: 2,
          lexeme: "foo",
          literal: null,
          start: 25,
          end: 27,
        },
        {
          type: TokenType.OR,
          line: 2,
          lexeme: "or",
          literal: null,
          start: 29,
          end: 30,
        },
        {
          type: TokenType.IDENTIFIER,
          line: 2,
          lexeme: "bar",
          literal: null,
          start: 32,
          end: 34,
        },
        {
          type: TokenType.SEMICOLON,
          line: 2,
          lexeme: ";",
          literal: null,
          start: 35,
          end: 35,
        },
        {
          type: TokenType.EOF,
          line: 2,
          lexeme: "",
          literal: null,
          start: 37,
          end: 37,
        },
      ];
      const ast = parser(tokens);

      assertObjectMatch(
        ast.root?.children[0].data as unknown as Tree<IProgram>,
        {
          type: "LogicalExpression",
          operator: "or",
          left: { type: "Identifier", name: "foo" },
          right: { type: "Identifier", name: "bar" },
        },
      );
    });
  });

  describe("Blocks", () => {
    it("should parse blocks with multiple declarations", () => {
      const tokens = [
        {
          type: TokenType.LEFT_BRACE,
          line: 2,
          lexeme: "{",
          literal: null,
          start: 25,
          end: 25,
        },
        {
          type: TokenType.IDENTIFIER,
          line: 3,
          lexeme: "newPoint",
          literal: null,
          start: 27,
          end: 34,
        },
        {
          type: TokenType.LEFT_PAREN,
          line: 3,
          lexeme: "(",
          literal: null,
          start: 35,
          end: 35,
        },
        {
          type: TokenType.IDENTIFIER,
          line: 3,
          lexeme: "x",
          literal: null,
          start: 36,
          end: 36,
        },
        {
          type: TokenType.PLUS,
          line: 3,
          lexeme: "+",
          literal: null,
          start: 38,
          end: 38,
        },
        {
          type: TokenType.NUMBER,
          line: 3,
          lexeme: "2",
          literal: 2,
          start: 40,
          end: 40,
        },
        {
          type: TokenType.COMMA,
          line: 3,
          lexeme: ",",
          literal: null,
          start: 41,
          end: 41,
        },
        {
          type: TokenType.NUMBER,
          line: 3,
          lexeme: "0",
          literal: 0,
          start: 43,
          end: 43,
        },
        {
          type: TokenType.RIGHT_PAREN,
          line: 3,
          lexeme: ")",
          literal: null,
          start: 44,
          end: 44,
        },
        {
          type: TokenType.DOT,
          line: 3,
          lexeme: ".",
          literal: null,
          start: 45,
          end: 45,
        },
        {
          type: TokenType.IDENTIFIER,
          line: 3,
          lexeme: "y",
          literal: null,
          start: 46,
          end: 46,
        },
        {
          type: TokenType.EQUAL,
          line: 3,
          lexeme: "=",
          literal: null,
          start: 48,
          end: 48,
        },
        {
          type: TokenType.NUMBER,
          line: 3,
          lexeme: "3",
          literal: 3,
          start: 50,
          end: 50,
        },
        {
          type: TokenType.SEMICOLON,
          line: 3,
          lexeme: ";",
          literal: null,
          start: 51,
          end: 51,
        },
        {
          type: TokenType.VAR,
          line: 4,
          lexeme: "var",
          literal: null,
          start: 53,
          end: 55,
        },
        {
          type: TokenType.IDENTIFIER,
          line: 4,
          lexeme: "tan",
          literal: null,
          start: 57,
          end: 59,
        },
        {
          type: TokenType.EQUAL,
          line: 4,
          lexeme: "=",
          literal: null,
          start: 61,
          end: 61,
        },
        {
          type: TokenType.NUMBER,
          line: 4,
          lexeme: "7",
          literal: 7,
          start: 63,
          end: 63,
        },
        {
          type: TokenType.SEMICOLON,
          line: 4,
          lexeme: ";",
          literal: null,
          start: 64,
          end: 64,
        },
        {
          type: TokenType.RIGHT_BRACE,
          line: 5,
          lexeme: "}",
          literal: null,
          start: 66,
          end: 66,
        },
        {
          type: TokenType.EOF,
          line: 5,
          lexeme: "",
          literal: null,
          start: 68,
          end: 68,
        },
      ];
      const ast = parser(tokens);

      assertObjectMatch(
        ast.root?.children[0].data as unknown as Tree<IProgram>,
        {
          type: "BlockStatement",
          body: [
            {
              type: "AssignmentExpression",
              operator: "=",
              left: {
                type: "MemberExpression",
                object: {
                  type: "CallExpression",
                  callee: { type: "Identifier", name: "newPoint" },
                  arguments: [
                    { type: "Identifier", name: "x" },
                    { type: "Literal", value: 2, raw: "2" },
                    { type: "Literal", value: 0, raw: "0" },
                  ],
                },
                property: { type: "Identifier", name: "y" },
                computed: false,
                optional: false,
              },
              right: { type: "Literal", value: 3, raw: "3" },
            },
            {
              type: "VariableDeclaration",
              declarations: [
                {
                  type: "VariableDeclarator",
                  id: { type: "Identifier", name: "tan" },
                  init: { type: "Literal", value: 7, raw: "7" },
                },
              ],
            },
          ],
          sourceType: "module",
        },
      );
    });
  });
});
