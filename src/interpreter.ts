import { Tree } from "./tree.ts";
import { ASTNode, ASTNodeType, IProgram } from "./parser.ts";

function convertTreeToASTTree(tree: Tree<ASTNode>): IProgram {
  const astTree: IProgram = {
    type: ASTNodeType.Program,
    body: [],
  };

  tree.root?.children.map((child) => astTree.body.push(child.data));

  return astTree;
}

function generateCode(node: ASTNode): string {
  let code = "";

  switch (node.type) {
    case ASTNodeType.Program: {
      code = node.body.map((n) => generateCode(n)).join("\n");
      break;
    }
    case ASTNodeType.VariableDeclaration: {
      code = `var ${node.declarations[0].id.name} = ${
        generateCode(node.declarations[0].init)
      };`;

      if (code.endsWith(";;")) {
        code = code.substring(0, code.length - 1);
      }
      break;
    }
    case ASTNodeType.Identifier: {
      code = node.name;
      break;
    }
    case ASTNodeType.Literal: {
      if (node.value || node.value === false) {
        code = `${node.value}`;
      } else if (node.raw === null) {
        code = "null";
      } else {
        code = `"${node.raw}"`;
      }
      break;
    }
    case ASTNodeType.CallExpression: {
      let args = "";
      if (node.arguments) {
        args = node.arguments.map((arg) => generateCode(arg)).join(",");
      }
      code = `${node.callee.name}(${args});`;
      break;
    }
    case ASTNodeType.UnaryExpression: {
      code = node.operator;
      if (node.argument) {
        code += generateCode(node.argument);
      }
      break;
    }
    default: {
      throw new Error(`Unrecognised AST type ${node.type}`);
    }
  }

  return code;
}

export function interpreter(ast: Tree<ASTNode>): string {
  const astTree = convertTreeToASTTree(ast);
  return generateCode(astTree);
}
