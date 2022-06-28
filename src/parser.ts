import { IToken, TokenType } from "./scanner.ts";
import { Tree } from "./tree.ts";
import { convertTreeToASTTree } from "./utils.ts";

type BinaryOperator = "+" | "-" | "*" | "/";

export enum ASTNodeType {
  Program = "Program",
  Literal = "Literal",
  VariableDeclaration = "VariableDeclaration",
  VariableDeclarator = "VariableDeclarator",
  UnaryExpression = "UnaryExpression",
  CallExpression = "CallExpression",
  MemberExpression = "MemberExpression",
  BinaryExpression = "BinaryExpression",
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

interface IBinaryExpression {
  type: ASTNodeType.BinaryExpression;
  operator: BinaryOperator;
  left: ASTNode;
  right: ASTNode;
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

type IExpression =
  | IBinaryExpression
  | IUnaryExpression
  | ICallExpression
  | IMemberExpression
  | ILiteral
  | IIdentifier;

export type ASTNode =
  | IProgram
  | IDeclarator
  | IVariableDeclaration
  | IExpression;

function match(
  { token, comparison }: {
    token?: IToken;
    comparison: TokenType | TokenType[];
  },
): boolean {
  return token?.type
    ? Array.isArray(comparison)
      ? comparison.includes(token.type)
      : token.type === comparison
    : false;
}

export function parser(c: IToken[]): Tree<IProgram> {
  const code = c;
  const tree = new Tree();
  const root = tree.parse({ type: "Program" });
  let position = 0;

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

  function evalExpresion(): IExpression | null {
    return evalAssignment();
  }

  function evalAssignment(): IExpression | null {
    // TODO: Implement ( call "." )? IDENTIFIER "=" assignment
    //const primary = evalPrimary();
    return evalLogicOr();
  }

  // TODO complete implementations
  function evalLogicOr(): IExpression | null {
    return evalEquality();
  }

  function evalEquality(): IExpression | null {
    return evalComparison();
  }

  function evalComparison(): IExpression | null {
    return evalTerm();
  }

  function evalTerm(): IExpression | null {
    return evalFactor();
  }

  function evalFactor(): IExpression | null {
    const unary = evalUnary();

    if (
      unary &&
      match({
        token: code[position],
        comparison: [TokenType.STAR, TokenType.SLASH],
      })
    ) {
      const operator = code[position].lexeme as BinaryOperator;

      advance();

      const right = evalFactor();

      if (!right) {
        throw new Error(
          "Expected right expression of Binary Expression not found",
        );
      }

      const binaryExpression: IBinaryExpression = {
        type: ASTNodeType.BinaryExpression,
        operator,
        left: unary,
        right,
      };

      return binaryExpression;
    }

    return unary;
  }

  function evalUnary(): IExpression | null {
    if (
      match({
        token: code[position],
        comparison: [
          TokenType.MINUS,
          TokenType.BANG,
        ],
      })
    ) {
      const unaryToken = code[position];

      advance();

      const unary: IUnaryExpression = {
        type: ASTNodeType.UnaryExpression,
        operator: match({
            token: unaryToken,
            comparison: [
              TokenType.MINUS,
            ],
          })
          ? "-"
          : "!",
        prefix: true,
        argument: evalUnary() as ASTNode,
      };

      return unary;
    }
    return evalCall();
  }

  function evalCall(): IExpression | null {
    // TODO: primary "." IDENTIFIER
    const primary = evalPrimary();
    if (primary === null) {
      return null;
    }

    if (
      primary.type === ASTNodeType.Identifier &&
      match({ token: code[position], comparison: TokenType.LEFT_PAREN })
    ) {
      const callExpression: ICallExpression = {
        type: ASTNodeType.CallExpression,
        callee: primary,
      };
      const args: ASTNode[] = [];

      while (
        code[position] &&
        !match({ token: code[position], comparison: TokenType.RIGHT_PAREN })
      ) {
        if (
          match({
            token: code[position],
            comparison: [TokenType.LEFT_PAREN, TokenType.COMMA],
          })
        ) {
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

  function evalPrimary(): IExpression | null {
    const token = code[position];

    if (
      match({
        token,
        comparison: [
          TokenType.TRUE,
          TokenType.FALSE,
          TokenType.THIS,
          TokenType.NUMBER,
          TokenType.STRING,
          TokenType.IDENTIFIER,
          TokenType.SUPER,
          TokenType.NIL,
        ],
      })
    ) {
      advance();

      if (match({ token, comparison: TokenType.NIL })) {
        return {
          type: ASTNodeType.Literal,
          value: null,
          raw: null,
        };
      }

      if (match({ token, comparison: TokenType.IDENTIFIER })) {
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

    if (match({ token, comparison: TokenType.LEFT_PAREN })) {
      const codeSegment: IToken[] = [];
      let i = position + 1;
      let leftParensCount = 0;

      while (
        !match({ token: code[i], comparison: TokenType.RIGHT_PAREN }) &&
        leftParensCount === 0
      ) {
        if (match({ token: code[i], comparison: TokenType.EOF })) {
          throw new Error("Expected Right Parenthesis not found");
        }

        if (match({ token: code[i], comparison: TokenType.LEFT_PAREN })) {
          leftParensCount++;
        }

        if (match({ token: code[i], comparison: TokenType.RIGHT_PAREN })) {
          leftParensCount--;
        }

        codeSegment.push(code[i]);
        i++;
      }

      // skip codeSegment and closing RIGHT_PAREN
      position = i;
      advance();

      const tree = parser(codeSegment);
      const ast = convertTreeToASTTree(tree);

      return ast.body[0] as IExpression;
    }

    return null;
  }

  function walk(): ASTNode | null {
    let token = code[position];

    if (match({ token, comparison: TokenType.SEMICOLON })) {
      advance();
      return null;
    }

    if (match({ token, comparison: TokenType.VAR })) {
      const astNode: IVariableDeclaration = {
        type: ASTNodeType.VariableDeclaration,
        declarations: [],
      };

      token = advance();

      if (!match({ token, comparison: TokenType.IDENTIFIER })) {
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

      if (match({ token: peek(), comparison: TokenType.EQUAL })) {
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

  return tree as Tree<IProgram>;
}
