import { IToken, TokenType } from "./scanner.ts";
import { INode, Tree } from "./tree.ts";

export enum ASTNodeType {
  Program = "Program",
  Literal = "Literal",
  VariableDeclaration = "VariableDeclaration",
  VariableDeclarator = "VariableDeclarator",
  Identifier = "Identifier",
}

interface IASTNode {
  type: ASTNodeType;
  value?: number | string;
  raw?: string;
  init?: null | number | string;
}

/*
 * start with the lowest grammar rule (primary): http://craftinginterpreters.com/parsing-expressions.html
 * implement. then start to work in reverse implementing the other rules. Use the ast format
 * from https://astexplorer.net/
 * create the Interpreter stage evaluating the ast tree using the design here: https://github.com/jamiebuilds/the-super-tiny-compiler/blob/master/the-super-tiny-compiler.js
 *
*/

export function parser(code: IToken[]) {
  const tree = new Tree();
  const root = tree.parse({ type: "Program" });
  let node: null | INode;
  let count = 0;

  function addSibling(data: IASTNode) {
    if (node) {
      node.parent?.addChild(data);
    }
    root.addChild(data);
  }

  function addChild(data: IASTNode) {
    node = node ? node.addChild(data) : root.addChild(data);
  }

  function advance(amount = 1) {
    count = count + amount;
  }

  function peek() {
    return code[count + 1];
  }

  function walk(token: IToken) {
    if (token.type === TokenType.CLASS) {
      // TODO
    }

    if (token.type === TokenType.FUN) {
      // TODO
    }

    if (token.type === TokenType.VAR) {
      const astNode: {
        type: ASTNodeType;
        declarations: Record<PropertyKey, unknown>[];
      } = {
        type: ASTNodeType.VariableDeclaration,
        declarations: [],
      };

      advance();

      if (code[count].type !== TokenType.IDENTIFIER) {
        throw new Error(
          `Identifier expected got ${code[count].type} {${code[count].line}:${
            code[count].start
          }}`,
        );
      }

      const declarator: Record<PropertyKey, unknown> = {
        type: ASTNodeType.VariableDeclarator,
        id: {
          type: ASTNodeType.Identifier,
          name: code[count].lexeme,
        },
        init: null,
      };

      if (peek().type === TokenType.EQUAL) {
        advance(2);
        declarator.init = code[count].literal;
      }

      astNode.declarations.push(declarator);
      addSibling(astNode);

      while (code[count].type !== TokenType.SEMICOLON) {
        advance();
      }
    }

    if (token.type === TokenType.NUMBER) {
      addSibling({
        type: ASTNodeType.Literal,
        value: token.literal as number,
        raw: `${token.lexeme}`,
      });
      /*
      while (peek().type === TokenType.NUMBER || peek().lexeme === ".") {
        advance();
        console.log('HELLO')
        value = `${value}${code[count].lexeme}`
      }
      */
    }
  }

  while (count < code.length) {
    walk(code[count]);
    advance();
  }

  return tree;
}
