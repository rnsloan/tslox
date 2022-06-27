import { IToken, TokenType } from "./scanner.ts";
import { Tree } from "./tree.ts";

export enum ASTNodeType {
  Program = "Program",
  Literal = "Literal",
  VariableDeclaration = "VariableDeclaration",
  VariableDeclarator = "VariableDeclarator",
  UnaryExpression = "UnaryExpression",
  CallExpression = "CallExpression",
  MemberExpression = "MemberExpression",
  Identifier = "Identifier",
}
export interface IProgram {
  type: ASTNodeType.Program;
  body: ASTNode[];
}
interface ILiteral {
  type: ASTNodeType.Literal;
  value: null | number | string | boolean;
  raw: null | number | string;
}
interface IIdentifier {
  type: ASTNodeType.Identifier;
  name: string;
}
interface IUnaryExpression {
  type: ASTNodeType.UnaryExpression;
  operator: string;
  prefix: boolean;
  argument: ASTNode;
}
interface ICallExpression {
  type: ASTNodeType.CallExpression;
  callee: IIdentifier;
  arguments?: ASTNode[];
}
interface IMemberExpression {
  type: ASTNodeType.MemberExpression;
  object: ILiteral;
  property: IIdentifier;
}
interface IDeclarator {
  type: ASTNodeType.VariableDeclarator;
  id: {
    type: ASTNodeType;
    name: string | number;
  };
  init: ASTNode;
}
interface IVariableDeclaration {
  type: ASTNodeType.VariableDeclaration;
  declarations: IDeclarator[];
}

export type ASTNode =
  | IProgram
  | IDeclarator
  | IVariableDeclaration
  | IUnaryExpression
  | ICallExpression
  | IMemberExpression
  | ILiteral
  | IIdentifier;

let code: IToken[];
let position = 0;

function match(token: IToken, comparison: TokenType | TokenType[]): boolean {
  return Array.isArray(comparison)
    ? comparison.includes(token.type)
    : token.type === comparison;
}

function advance(amount = 1): IToken {
  position = position + amount;
  return code[position];
}

function peek(amount = 1): IToken {
  return code[position + amount];
}

function evalStatement(): ASTNode | null {
  return evalExpresion();
}

function evalExpresion(): ASTNode | null {
  return evalAssignment();
}

function evalAssignment(): ASTNode | null {
  // TODO: Implement ( call "." )? IDENTIFIER "=" assignment
  //const primary = evalPrimary();
  return evalLogicOr();
}

// TODO complete implementations
function evalLogicOr(): ASTNode | null {
  return evalEquality();
}

function evalEquality(): ASTNode | null {
  return evalComparison();
}

function evalComparison(): ASTNode | null {
  return evalTerm();
}

function evalTerm(): ASTNode | null {
  return evalFactor();
}

function evalFactor(): ASTNode | null {
  // TODO implement factor
  // need to handle expression "(" expression ")"
  return evalUnary();
}

function evalUnary(): ASTNode | null {
  if (
    match(code[position], [
      TokenType.MINUS,
      TokenType.BANG,
    ])
  ) {
    const unaryToken = code[position];

    advance();

    const unary: IUnaryExpression = {
      type: ASTNodeType.UnaryExpression,
      operator: match(unaryToken, [
          TokenType.MINUS,
        ])
        ? "-"
        : "!",
      prefix: true,
      argument: evalUnary() as ASTNode,
    };

    return unary;
  }
  return evalCall();
}

function evalCall(): ILiteral | IIdentifier | ICallExpression | null {
  // TODO: primary "." IDENTIFIER
  const primary = evalPrimary();
  if (primary === null) {
    return null;
  }

  if (
    primary.type === ASTNodeType.Identifier &&
    match(code[position], TokenType.LEFT_PAREN)
  ) {
    const callExpression: ICallExpression = {
      type: ASTNodeType.CallExpression,
      callee: primary,
    };
    const args: ASTNode[] = [];

    while (code[position] && !match(code[position], TokenType.RIGHT_PAREN)) {
      if (match(code[position], [TokenType.LEFT_PAREN, TokenType.COMMA])) {
        advance();
        continue;
      }

      const primary = evalPrimary();

      if (primary) {
        args.push(primary);
      } else {
        advance();
      }
    }

    if (args.length) {
      callExpression.arguments = args;
    }

    // skip ")"
    advance();

    return callExpression;
  }

  return primary;
}

function evalPrimary(): ILiteral | IIdentifier | null {
  const token = code[position];

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

    if (match(token, TokenType.IDENTIFIER)) {
      return {
        type: ASTNodeType.Identifier,
        name: token.lexeme as string,
      };
    }

    return {
      type: ASTNodeType.Literal,
      value: token.literal as boolean | string | number,
      raw: `${token.lexeme}`,
    };
  }

  /*
  if (match(token, TokenType.LEFT_PAREN)) {
    const codeSegment: IToken[] = [];
    let i = position + 1;
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
  */
  return null;
}

export function parser(c: IToken[]) {
  code = c;
  position = 0;
  const tree = new Tree();
  const root = tree.parse({ type: "Program" });

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

  function walk(): ASTNode | null {
    let token = code[position];

    if (match(token, TokenType.SEMICOLON)) {
      advance();
      return null;
    }

    if (match(token, TokenType.VAR)) {
      const astNode: IVariableDeclaration = {
        type: ASTNodeType.VariableDeclaration,
        declarations: [],
      };

      token = advance();

      if (!match(token, TokenType.IDENTIFIER)) {
        throw new Error(
          `Identifier expected got ${token.type} {${token.line}:${token.start}}`,
        );
      }

      const declarator: IDeclarator = {
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

    return evalStatement();
  }

  // walk() function advances position value
  while (position < c.length - 1) {
    const astNode = walk();

    if (astNode) {
      root.addChild(astNode);
    }
  }

  return tree;
}
