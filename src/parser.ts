import { IToken, TokenType } from "./scanner.ts";
import { Tree } from "./tree.ts";
import { convertTreeToASTTree } from "./utils.ts";

type BinaryOperator = "+" | "-" | "*" | "/";
type LogicalOperator = "and" | "or";

export enum ASTNodeType {
  Program = "Program",
  ForStatement = "ForStatement",
  IfStatement = "IfStatement",
  PrintStatement = "PrintStatement",
  ReturnStatement = "ReturnStatement",
  WhileStatement = "WhileStatement",
  BlockStatement = "BlockStatement",
  Literal = "Literal",
  FunctionExpression = "FunctionExpression",
  MethodDefinition = "MethodDefinition",
  ClassBody = "ClassBody",
  ClassDeclaration = "ClassDeclaration",
  FunctionDeclaration = "FunctionDeclaration",
  VariableDeclaration = "VariableDeclaration",
  ExpressionStatement = "ExpressionStatement",
  VariableDeclarator = "VariableDeclarator",
  AssignmentExpression = "AssignmentExpression",
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
  sourceType: "module";
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
  callee: IIdentifier | IMemberExpression;
  arguments?: ASTNode[];
}

interface ILogicalExpression {
  type: ASTNodeType.LogicalExpression;
  operator: LogicalOperator;
  left: ASTNode;
  right: ASTNode;
}

interface IAssignmentExpression
  extends Omit<ILogicalExpression, "type" | "operator"> {
  type: ASTNodeType.AssignmentExpression;
  operator: "=";
}

interface IBinaryExpression
  extends Omit<ILogicalExpression, "type" | "operator"> {
  type: ASTNodeType.BinaryExpression;
  operator: BinaryOperator;
}
interface IMemberExpression {
  type: ASTNodeType.MemberExpression;
  object: IIdentifier | IMemberExpression;
  property: IIdentifier;
  computed: boolean;
  optional: boolean;
}
interface IDeclarator {
  type: ASTNodeType.VariableDeclarator;
  id: {
    type: ASTNodeType;
    name: string | number;
  };
  init: ASTNode;
}

interface IAssignmentExpression
  extends Omit<ILogicalExpression, "type" | "operator"> {
  type: ASTNodeType.AssignmentExpression;
  operator: "=";
}

interface IFunctionExpression
  extends Omit<IFunctionDeclaration, "type" | "id"> {
  type: ASTNodeType.FunctionExpression;
}

interface IClassDeclaration {
  type: ASTNodeType.ClassDeclaration;
  id: IIdentifier;
  superclass?: IIdentifier;
  body: IClassBody;
  sourceType: "module";
}
interface IClassBody {
  type: ASTNodeType.ClassBody;
  body: IMethodDefinition[];
}

interface IMethodDefinition {
  type: ASTNodeType.MethodDefinition;
  key: IIdentifier;
  value: IFunctionExpression;
  kind: "constructor" | "method";
  computed: boolean;
  static: boolean;
}

interface IFunctionDeclaration {
  type: ASTNodeType.FunctionDeclaration;
  id: IIdentifier;
  expression: false;
  generator: false;
  async: false;
  params: IIdentifier[];
  body: IBlock;
}
interface IVariableDeclaration {
  type: ASTNodeType.VariableDeclaration;
  declarations: IDeclarator[];
}

interface IExpressionStatement {
  type: ASTNodeType.ExpressionStatement;
  expression: IExpression;
}

interface IForStatement {
  type: ASTNodeType.ForStatement;
  init?: IDeclaratation | IExpression;
  test?: IExpression;
  update?: IExpression;
  body: IStatement;
  sourceType: "module";
}

interface IIfStatement {
  type: ASTNodeType.IfStatement;
  test: IExpression;
  consequent: IStatement;
  sourceType: "module";
}
interface IPrintStatement {
  type: ASTNodeType.PrintStatement;
  argument: IExpression;
}

interface IReturnStatement {
  type: ASTNodeType.ReturnStatement;
  argument?: IExpression;
}
interface IWhileStatement {
  type: ASTNodeType.WhileStatement;
  test: IExpression;
  body: IStatement;
}

interface IBlock {
  type: ASTNodeType.BlockStatement;
  body: IDeclaratation[];
  sourceType: "module";
}
type IExpression =
  | IAssignmentExpression
  | ILogicalExpression
  | IBinaryExpression
  | IUnaryExpression
  | ICallExpression
  | IMemberExpression
  | ILiteral
  | IIdentifier;

type IStatement =
  | IExpression
  | IForStatement
  | IIfStatement
  | IPrintStatement
  | IReturnStatement
  | IWhileStatement
  | IBlock;

type IDeclaratation =
  | IClassDeclaration
  | IFunctionDeclaration
  | IMethodDefinition
  | IVariableDeclaration
  | IStatement;
export type ASTNode =
  | IDeclaratation
  | IProgram
  | IDeclarator
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
  const root = tree.parse({ type: ASTNodeType.Program, sourceType: "module" });
  let position = 0;

  function advance(amount = 1): IToken {
    position = position + amount;
    return code[position];
  }

  function peek(amount = 1): IToken {
    return code[position + amount];
  }

  function consume(
    { startToken, endToken }: { startToken: TokenType; endToken: TokenType },
  ): ASTNode[] {
    const codeSegment: IToken[] = [];
    let i = position + 1;
    let startTokenCount = 0;

    while (
      !match({ token: code[i], comparison: endToken }) &&
      startTokenCount === 0
    ) {
      if (match({ token: code[i], comparison: TokenType.EOF })) {
        throw new Error(`Expected character '${endToken}' not found`);
      }

      if (match({ token: code[i], comparison: startToken })) {
        startTokenCount++;
      }

      if (match({ token: code[i], comparison: endToken })) {
        startTokenCount--;
      }

      codeSegment.push(code[i]);
      i++;
    }

    // skip codeSegment and closing endToken
    position = i;
    advance();

    const tree = parser(codeSegment);
    const ast = convertTreeToASTTree(tree);

    return ast.body;
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

  function evalStatement(): IStatement | null {
    switch (code[position].type) {
      case TokenType.FOR: {
        return evalFor();
      }
      case TokenType.IF: {
        return evalIf();
      }
      case TokenType.PRINT: {
        return evalPrint();
      }
      case TokenType.RETURN: {
        return evalReturn();
      }
      case TokenType.WHILE: {
        return evalWhile();
      }
      case TokenType.LEFT_BRACE: {
        return evalBlock();
      }
      default: {
        return evalExpresion();
      }
    }
  }

  function evalFor(): IForStatement {
    advance(2);

    let init, test, update;

    if (match({ token: code[position], comparison: TokenType.SEMICOLON })) {
      init = null;
      advance();
    } else if (match({ token: code[position], comparison: TokenType.VAR })) {
      init = evalVariable();
    } else {
      init = evalExpresion();
    }

    if (!match({ token: code[position], comparison: TokenType.RIGHT_PAREN })) {
      advance();

      if (match({ token: code[position], comparison: TokenType.SEMICOLON })) {
        test = null;
        advance();
      } else {
        test = evalExpresion();
      }

      if (match({ token: code[position], comparison: TokenType.SEMICOLON })) {
        advance();
      }

      if (match({ token: code[position], comparison: TokenType.RIGHT_PAREN })) {
        update = null;
      } else {
        update = evalExpresion();
      }
    } else {
      test = null;
      update = null;
    }

    advance();

    const statement = evalStatement();

    if (!statement) {
      const token = code[position];
      throw new Error(
        `Expected statement for for statement ${token.type} {${token.line}:${token.start}}`,
      );
    }

    return {
      type: ASTNodeType.ForStatement,
      ...(init && { init }),
      ...(test && { test }),
      ...(update && { update }),
      body: statement,
      sourceType: "module",
    };
  }

  function evalIf(): IIfStatement {
    advance();
    const test = consume({
      startToken: TokenType.LEFT_PAREN,
      endToken: TokenType.RIGHT_PAREN,
    })[0] as IExpression;
    const consequent = evalStatement();

    if (!test || !consequent) {
      const token = code[position];
      throw new Error(
        `Expected statement for if statement ${token.type} {${token.line}:${token.start}}`,
      );
    }

    return {
      type: ASTNodeType.IfStatement,
      test,
      consequent,
      sourceType: "module",
    };
  }

  function evalPrint(): IPrintStatement | null {
    advance();
    const argument = evalExpresion();

    if (!argument) {
      return null;
    }

    return {
      type: ASTNodeType.PrintStatement,
      argument,
    };
  }

  function evalReturn(): IReturnStatement {
    advance();
    let argument;

    if (!match({ token: code[position], comparison: TokenType.SEMICOLON })) {
      argument = evalExpresion();

      if (!argument) {
        const token = code[position];
        throw new Error(
          `Expected expression for return statement ${token.type} {${token.line}:${token.start}}`,
        );
      }
    }

    const foo: IReturnStatement = {
      type: ASTNodeType.ReturnStatement,
      ...(argument && { argument }),
    };

    return foo;
  }

  function evalWhile(): IWhileStatement {
    advance();

    const expression = consume({
      startToken: TokenType.LEFT_PAREN,
      endToken: TokenType.RIGHT_PAREN,
    })[0] as IExpression;

    const statement = evalStatement();

    if (!statement) {
      throw new Error(`expected statement for 'While' statement`);
    }

    return {
      type: ASTNodeType.WhileStatement,
      test: expression,
      body: statement,
    };
  }

  function evalBlock(): IBlock {
    const block = consume({
      startToken: TokenType.LEFT_BRACE,
      endToken: TokenType.RIGHT_BRACE,
    }) as IDeclaratation[];

    return {
      type: ASTNodeType.BlockStatement,
      body: block,
      sourceType: "module",
    };
  }

  function evalExpresion(): IExpression | null {
    return evalAssignment();
  }

  function evalAssignment(): IExpression | null {
    const response = evalLogical(evalLogicOr, [TokenType.AND]);

    if (
      response && match({ token: code[position], comparison: TokenType.EQUAL })
    ) {
      advance();
      const right = evalAssignment();

      if (!right) {
        throw new Error("expected right hand side of AssignmentExpression");
      }

      const foo: IAssignmentExpression = {
        type: ASTNodeType.AssignmentExpression,
        operator: "=",
        left: response,
        right,
      };
      return foo;
    }
    return response;
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

    const response = evalCall();

    if (
      (response &&
        [ASTNodeType.Identifier, ASTNodeType.CallExpression].includes(
          response.type,
        )) &&
      match({ token: code[position], comparison: TokenType.DOT })
    ) {
      const expressions: IExpression[] = [response];

      while (
        match({
          token: code[position],
          comparison: [TokenType.DOT, TokenType.IDENTIFIER],
        })
      ) {
        if (
          match({ token: code[position], comparison: TokenType.IDENTIFIER })
        ) {
          expressions.push(evalCall() as IExpression);
        } else {
          advance();
        }
      }

      return expressions.reduce(
        (accumulator, value): IMemberExpression | ICallExpression => {
          if (value.type === ASTNodeType.CallExpression) {
            return {
              ...value,
              callee: {
                type: ASTNodeType.MemberExpression,
                object: accumulator as IIdentifier | IMemberExpression,
                property: value.callee as IIdentifier,
                computed: false,
                optional: false,
              },
            };
          }
          return {
            type: ASTNodeType.MemberExpression,
            object: accumulator as IIdentifier | IMemberExpression,
            property: value as IIdentifier,
            computed: false,
            optional: false,
          };
        },
      );
    }

    return response;
  }

  function evalCall(): IExpression | null {
    const response = evalPrimary();

    if (response === null) {
      return null;
    }

    if (
      response.type === ASTNodeType.Identifier &&
      match({ token: code[position], comparison: TokenType.LEFT_PAREN })
    ) {
      const callExpression: ICallExpression = {
        type: ASTNodeType.CallExpression,
        callee: response,
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

    return response;
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

      if (
        match({ token, comparison: [TokenType.IDENTIFIER, TokenType.THIS] })
      ) {
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
      const expression = consume({
        startToken: TokenType.LEFT_PAREN,
        endToken: TokenType.RIGHT_PAREN,
      });
      return expression[0] as IExpression;
    }

    return null;
  }

  function evalClass(): IClassDeclaration | null {
    advance();

    const classId = evalPrimary();
    const functions: IFunctionDeclaration[] = [];
    let superclass;

    if (classId?.type !== ASTNodeType.Identifier) {
      const token = code[position];
      throw new Error(
        `Identifier expected got ${token.type} {${token.line}:${token.start}}`,
      );
    }

    if (match({ token: code[position], comparison: TokenType.LESS })) {
      advance();

      const primary = evalPrimary();
      if (primary?.type === ASTNodeType.Identifier) {
        superclass = primary;
      }
    }

    // skip '{'
    advance();

    while (
      !match({ token: code[position], comparison: TokenType.RIGHT_BRACE })
    ) {
      functions.push(evalFunction());
    }

    // skip '}'
    advance();

    const body: IMethodDefinition[] = functions.map((func) => {
      const { id, ...funcExpression } = func;

      return {
        type: ASTNodeType.MethodDefinition,
        key: id,
        kind: id.name === "constructor" ? "constructor" : "method",
        computed: false,
        static: false,
        value: {
          ...funcExpression,
          type: ASTNodeType.FunctionExpression,
        },
      };
    });

    return {
      type: ASTNodeType.ClassDeclaration,
      id: classId,
      ...(superclass && { superclass }),
      body: {
        type: ASTNodeType.ClassBody,
        body,
      },
      sourceType: "module",
    };
  }

  function evalFunction(): IFunctionDeclaration {
    if (match({ token: code[position], comparison: TokenType.FUN })) {
      advance();
    }

    const id = evalPrimary();
    const params: IIdentifier[] = [];

    if (id?.type !== ASTNodeType.Identifier) {
      const token = code[position];
      throw new Error(
        `Identifier expected got ${token.type} {${token.line}:${token.start}}`,
      );
    }

    while (
      !match({ token: code[position], comparison: TokenType.RIGHT_PAREN })
    ) {
      if (match({ token: code[position], comparison: TokenType.IDENTIFIER })) {
        params.push(evalPrimary() as IIdentifier);
      } else {
        advance();
      }
    }

    advance();

    const body = evalBlock();

    if (body.type !== ASTNodeType.BlockStatement) {
      const token = code[position];
      throw new Error(
        `Block expected for function got ${token.type} {${token.line}:${token.start}}`,
      );
    }

    return {
      type: ASTNodeType.FunctionDeclaration,
      id,
      expression: false,
      generator: false,
      async: false,
      params,
      body,
    };
  }

  function evalVariable(): IVariableDeclaration {
    let token = code[position];
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

  function walk(): ASTNode | null {
    const token = code[position];

    if (match({ token, comparison: TokenType.SEMICOLON })) {
      advance();
      return null;
    }

    if (match({ token, comparison: TokenType.CLASS })) {
      return evalClass();
    }

    if (match({ token, comparison: TokenType.FUN })) {
      return evalFunction();
    }

    if (match({ token, comparison: TokenType.VAR })) {
      return evalVariable();
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
