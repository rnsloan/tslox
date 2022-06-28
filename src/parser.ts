import { IToken, TokenType } from "./scanner.ts";
import { Tree } from "./tree.ts";
import { convertTreeToASTTree } from "./utils.ts";

type BinaryOperator = "+" | "-" | "*" | "/";
type LogicalOperator = "and" | "or";

export enum ASTNodeType {
  Program = "Program",
  Literal = "Literal",
  VariableDeclaration = "VariableDeclaration",
  ExpressionStatement = "ExpressionStatement",
  VariableDeclarator = "VariableDeclarator",
  UnaryExpression = "UnaryExpression",
  CallExpression = "CallExpression",
  MemberExpression = "MemberExpression",
  BinaryExpression = "BinaryExpression",
  LogicalExpression = "LogicalExpression",
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

interface ILogicalExpression {
  type: ASTNodeType.LogicalExpression;
  operator: LogicalOperator;
  left: ASTNode;
  right: ASTNode;
}
interface IBinaryExpression
  extends Omit<ILogicalExpression, "type" | "operator"> {
  type: ASTNodeType.BinaryExpression;
  operator: BinaryOperator;
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

interface IExpressionStatement {
  type: ASTNodeType.ExpressionStatement;
  expression: IExpression;
}

type IExpression =
  | ILogicalExpression
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
  | IExpressionStatement
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

  function evalLogical(
    func: () => IExpression | null,
    comparison: TokenType[],
  ): IExpression | null {
    const node = func();

    if (
      node &&
      match({
        token: code[position],
        comparison,
      })
    ) {
      const operator = code[position].lexeme as LogicalOperator;

      advance();

      const right = evalFactor();

      if (!right) {
        throw new Error(
          "Expected right expression of Binary Expression not found",
        );
      }

      const logicalExpression: ILogicalExpression = {
        type: ASTNodeType.LogicalExpression,
        operator,
        left: node,
        right,
      };

      return logicalExpression;
    }

    return node;
  }

  function evalBinary(
    func: () => IExpression | null,
    comparison: TokenType[],
  ): IExpression | null {
    const node = func();

    if (
      node &&
      match({
        token: code[position],
        comparison,
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
        left: node,
        right,
      };

      return binaryExpression;
    }

    return node;
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
    return evalLogical(evalLogicOr, [TokenType.AND]);
  }

  function evalLogicOr(): IExpression | null {
    return evalLogical(evalEquality, [TokenType.OR]);
  }

  function evalEquality(): IExpression | null {
    return evalBinary(evalComparison, [
      TokenType.BANG_EQUAL,
      TokenType.EQUAL_EQUAL,
    ]);
  }

  function evalComparison(): IExpression | null {
    return evalBinary(evalTerm, [
      TokenType.GREATER,
      TokenType.GREATER_EQUAL,
      TokenType.LESS,
      TokenType.LESS_EQUAL,
    ]);
  }

  function evalTerm(): IExpression | null {
    return evalBinary(evalFactor, [TokenType.PLUS, TokenType.MINUS]);
  }

  function evalFactor(): IExpression | null {
    return evalBinary(evalUnary, [TokenType.STAR, TokenType.SLASH]);
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
      const variableDeclaration: IVariableDeclaration = {
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

      variableDeclaration.declarations.push(declarator);

      return variableDeclaration;
    }

    /*
    const expressionStatement: IExpressionStatement = {
      type: ASTNodeType.ExpressionStatement,
      expression: evalStatement() as IExpression
    }
    */
   
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
