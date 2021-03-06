import { Tree } from "./tree.ts";
import { ASTNode, ASTNodeType } from "./parser.ts";
import { convertTreeToASTTree } from "./utils.ts";

function generateCode(node: ASTNode): string {
  let code = "";

  switch (node.type) {
    case ASTNodeType.Program: {
      code = node.body.map((n) => generateCode(n)).join("\n");
      break;
    }
    case ASTNodeType.ClassDeclaration: {
      const superclass = node.superclass
        ? ` < ${generateCode(node.superclass)}`
        : "";
      code = `class ${generateCode(node.id)}${superclass} {
${node.body.body.map((item) => generateCode(item)).join("\n")}
}`;
      break;
    }
    case ASTNodeType.MethodDefinition: {
      const params = node.value.params.map((param) => generateCode(param));
      code = `${generateCode(node.key)}(${params}) ${
        generateCode(node.value.body)
      }`;
      break;
    }
    case ASTNodeType.FunctionDeclaration: {
      const params = node.params.map((param) => generateCode(param));
      code = `function ${generateCode(node.id)}(${params.join(", ")}) ${
        generateCode(node.body)
      };`;

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
    case ASTNodeType.ForStatement: {
      let init = node.init ? generateCode(node.init) : "";
      let test = node.test ? generateCode(node.test) : "";
      const update = node.update ? generateCode(node.update) : "";
      let statement = generateCode(node.body);

      if (!update && !test) {
        init = init.replace(";", "");
      }

      if (update) {
        test = `${test};`;
      }

      if (node.body.type !== ASTNodeType.BlockStatement) {
        statement = `${statement};`;
      }

      code = `for (${init}${test}${update}) ${statement}`;
      break;
    }
    case ASTNodeType.IfStatement: {
      code = `if (${generateCode(node.test)}) ${generateCode(node.consequent)}`;
      break;
    }
    case ASTNodeType.PrintStatement: {
      code = `console.log(${generateCode(node.argument)});`;
      break;
    }
    case ASTNodeType.ReturnStatement: {
      const argument = node.argument ? ` ${generateCode(node.argument)}` : "";
      code = `return${argument};`;
      break;
    }
    case ASTNodeType.WhileStatement: {
      code = `while (${generateCode(node.test)}) ${generateCode(node.body)}`;
      break;
    }
    case ASTNodeType.BlockStatement: {
      const declarations = node.body.map((declaration) =>
        generateCode(declaration)
      );
      code = `{
  ${declarations.join(";")}
}`;
      break;
    }
    case ASTNodeType.LogicalExpression: {
      const left = node.left.type === ASTNodeType.LogicalExpression
        ? `(${generateCode(node.left)})`
        : generateCode(node.left);
      const right = node.right.type === ASTNodeType.LogicalExpression
        ? `(${generateCode(node.right)})`
        : generateCode(node.right);
      const operator = node.operator === "or" ? "||" : "&&";

      code = `${left} ${operator} ${right}`;
      break;
    }
    case ASTNodeType.BinaryExpression:
    case ASTNodeType.AssignmentExpression: {
      const left = node.left.type === ASTNodeType.BinaryExpression
        ? `(${generateCode(node.left)})`
        : generateCode(node.left);
      const right = node.right.type === ASTNodeType.BinaryExpression
        ? `(${generateCode(node.right)})`
        : generateCode(node.right);

      code = `${left} ${node.operator} ${right}`;
      break;
    }
    case ASTNodeType.UnaryExpression: {
      code = node.operator;
      if (node.argument) {
        code += generateCode(node.argument);
      }
      break;
    }
    case ASTNodeType.CallExpression: {
      let args = "";
      if (node.arguments) {
        args = node.arguments.map((arg) => generateCode(arg)).join(",");
      }
      code = `${generateCode(node.callee)}(${args})`;
      break;
    }
    case ASTNodeType.MemberExpression: {
      code = `${generateCode(node.object)}.${generateCode(node.property)}`;
      break;
    }
    case ASTNodeType.Identifier: {
      code = node.name;
      break;
    }
    case ASTNodeType.Literal: {
      if (node.value || node.value === false || node.value === 0) {
        code = `${node.value}`;
      } else if (node.raw === null) {
        code = "null";
      } else {
        code = `"${node.raw}"`;
      }
      break;
    }
    default: {
      throw new Error(`Unrecognised AST type ${node.type}`);
    }
  }

  return code.replaceAll(/;{2,}/g, ";");
}

export function interpreter(ast: Tree<ASTNode>): string {
  const astTree = convertTreeToASTTree(ast);
  return generateCode(astTree);
}
