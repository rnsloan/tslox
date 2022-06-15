import { IToken, TokenType } from "./scanner.ts";
import { INode, Tree } from "./tree.ts";

// regex reference * = zero or more, ? = zero or one

export enum ASTNodeType {
  Program = "Program",
  Literal = "Literal",
  VariableDeclaration = "VariableDeclaration",
  VariableDeclarator = "VariableDeclarator",
  Identifier = "Identifier",
}

interface IASTNode {
  type: ASTNodeType;
  value?: null | number | string | boolean;
  raw?: null | number | string;
  init?: null | number | string;
}

let code: IToken[];
let count = 0;

function match(token: IToken, comparison: TokenType | TokenType[]): boolean {
  return Array.isArray(comparison)
    ? comparison.includes(token.type)
    : token.type === comparison;
}

function advance(amount = 1): IToken {
  count = count + amount;
  return code[count];
}

function peek(amount = 1): IToken {
  return code[count + amount];
}

function evalExpresion(): IASTNode | null {
  return evalAssignment();
}

function evalAssignment(): IASTNode | null {
  return evalPrimary();
}

function evalPrimary(): IASTNode | null {
  const token = code[count];

  if (
    match(token, [
      TokenType.TRUE,
      TokenType.FALSE,
      TokenType.THIS,
      TokenType.NUMBER,
      TokenType.STRING,
      TokenType.IDENTIFIER,
      TokenType.SUPER,
      TokenType.NIL,
    ])
  ) {
    advance();

    if (match(token, TokenType.NIL)) {
      return {
        type: ASTNodeType.Literal,
        value: null,
        raw: null,
      };
    }

    return {
      type: ASTNodeType.Literal,
      value: token.literal as boolean | string | number,
      raw: `${token.lexeme}`,
    };
  }

  if (match(token, TokenType.LEFT_PAREN)) {
    const codeSegment: IToken[] = [];
    let i = count + 1;
    let leftParensCount = 0;

    while (!match(code[i], TokenType.RIGHT_PAREN) && leftParensCount === 0) {
      if (match(code[i], TokenType.EOF)) {
        throw new Error("Expected Right Parenthesis not found");
      }

      if (match(code[i], TokenType.LEFT_PAREN)) {
        leftParensCount++;
      }

      if (match(code[i], TokenType.RIGHT_PAREN)) {
        leftParensCount--;
      }

      codeSegment.push(code[i]);
      i++;
    }

    // TODO - fix checkExpresion() to work with code segment
    if (evalExpresion()) {
      advance(i);

      return {
        type: ASTNodeType.Literal,
        value: token.literal as boolean | string | number,
        raw: `${token.lexeme}`,
      };
    }
  }

  return null;
}

export function parser(c: IToken[]) {
  code = c;
  const tree = new Tree();
  const root = tree.parse({ type: "Program" });
  let node: null | INode;

  /*
  function addSibling(data: IASTNode) {
    if (node) {
      node.parent?.addChild(data);
    }
    root.addChild(data);
  }

  function addChild(data: IASTNode) {
    node = node ? node.addChild(data) : root.addChild(data);
  }
  */

  function walk(): Record<PropertyKey, unknown> | void {
    let token = code[count];

    if (match(token, TokenType.VAR)) {
      const astNode: {
        type: ASTNodeType;
        declarations: Record<PropertyKey, unknown>[];
      } = {
        type: ASTNodeType.VariableDeclaration,
        declarations: [],
      };

      token = advance();

      if (!match(token, TokenType.IDENTIFIER)) {
        throw new Error(
          `Identifier expected got ${token.type} {${token.line}:${token.start}}`,
        );
      }

      const declarator: Record<PropertyKey, unknown> = {
        type: ASTNodeType.VariableDeclarator,
        id: {
          type: ASTNodeType.Identifier,
          name: token.lexeme,
        },
        init: {
          type: ASTNodeType.Literal,
          value: null,
          raw: null,
        },
      };

      if (match(peek(), TokenType.EQUAL)) {
        token = advance(2);
        const val = evalExpresion();
        if (val) {
          declarator.init = val;
        } else {
          throw new Error(
            `Unable to parse variable value {${token.line}:${token.start}}`,
          );
        }
      }

      astNode.declarations.push(declarator);

      return astNode;
    }
  }

  while (count < c.length) {
    const astNode = walk();

    if (astNode) {
      root.addChild(astNode);
    }

    advance();
  }

  return tree;
}
