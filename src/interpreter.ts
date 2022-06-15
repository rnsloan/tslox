import { INode, Tree } from "./tree.ts";
import { ASTNodeType } from "./parser.ts";

function codeGenerate(node: INode): string {
  let code = "";
  const { data } = node;

  if (!data || !data.type) {
    console.error(node);
    throw new Error("ASTNode missing data or data.type property");
  }

  const { type } = data;

  switch (type) {
    case ASTNodeType.Program: {
      code = node.children.map((n) => codeGenerate(n)).join("\n");
      break;
    }
    case ASTNodeType.VariableDeclaration: {
      code = `var ${data.declarations[0].id.name} = ${
        data.declarations[0].init.value
      };`;
      break;
    }
    default: {
      throw new Error(`Unrecognised AST type ${type}`);
    }
  }

  return code;
}

export function interpreter(ast: Tree): string {
  return codeGenerate(ast.root as INode);
}
