import { Tree } from "./tree.ts";
import { ASTNode, ASTNodeType, IProgram } from "./parser.ts";

export function convertTreeToASTTree(tree: Tree<ASTNode>): IProgram {
  const astTree: IProgram = {
    type: ASTNodeType.Program,
    body: [],
    sourceType: "module"
  };

  tree.root?.children.map((child) => astTree.body.push(child.data));

  return astTree;
}
