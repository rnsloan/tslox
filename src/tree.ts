// deno-lint-ignore no-explicit-any
type Data = any;

enum STRATEGY {
  DEPTH,
  BREADTH,
}

export interface INode {
  parent: Node | null;
  children: Node[];
  data: Data;
  isRoot: () => boolean;
  isLeaf: () => boolean;
  hasChildren: () => boolean;
  drop: () => void;
  addChild: (data: Data) => Node;
  addChildAtIndex: (data: Data, index: number) => Node;
  getPath: (node: Node) => Node[];
}

class Node implements INode {
  protected id: string;
  readonly parent: Node | null;
  readonly children: Node[];
  readonly data: Data;

  constructor(data: Data, parent?: Node) {
    this.id = crypto.randomUUID();
    this.parent = parent || null;
    this.data = data;
    this.children = [];
  }

  isRoot() {
    return false;
  }

  isLeaf() {
    return Boolean(!this.children.length);
  }

  hasChildren() {
    return Boolean(this.children.length);
  }

  drop(): Node | undefined {
    if (this.isRoot()) {
      console.warn("Cannot drop the Root Node");
      return;
    }

    const index = this.parent?.children.findIndex((n) => n.id === this.id);

    if (index) {
      const result = this.parent?.children.splice(index, 1);
      if (result?.length) {
        return result[0];
      }
    }

    console.error("Unable to drop Node");
  }

  addChild(data: Data) {
    const node = new Node(data, this);
    this.children.push(node);
    return node;
  }

  addChildAtIndex(data: Data, index: number) {
    const node = new Node(data, this);
    this.children.splice(index, 0, node);
    return node;
  }

  getPath() {
    interface AddParent {
      (n: Node): AddParent;
    }

    const path = [];
    path.push(this);

    const addParent = (n: Node): AddParent | undefined => {
      const { parent } = n;

      if (parent) {
        path.push(parent);
        return addParent(parent);
      }
    };

    addParent(this);
    return path.reverse();
  }
}

export interface IRootNode extends INode {
  find: (
    predicate: (n: Node) => boolean,
    strategy?: STRATEGY,
  ) => Node | undefined;
  findAll: (predicate: (n: Node) => boolean, strategy?: STRATEGY) => Node[];
}

export class RootNode extends Node implements IRootNode {
  constructor(data: Data) {
    super(data);
    this.id = `root-${crypto.randomUUID()}`;
  }

  isRoot() {
    return true;
  }

  isLeaf() {
    return false;
  }

  find(predicate: (n: Node) => boolean, strategy?: STRATEGY): Node | undefined {
    let result: Node | undefined;

    const findDfs = (node: Node) => {
      if (predicate(node) && !result) {
        result = node;
        return;
      }

      for (let i = 0; i < node.children.length; i++) {
        findDfs(node.children[i]);
      }
    };
    const findBfs = (node: Node) => {
      const queue = [node];

      while (queue.length && !result) {
        const n = queue.shift();

        if (n && predicate(n)) {
          result = n;
        }

        n?.children?.forEach((item) => queue.push(item));
      }
    };

    if (strategy === STRATEGY.BREADTH) {
      findBfs(this);
    } else {
      findDfs(this);
    }

    return result;
  }

  findAll(predicate: (n: Node) => boolean, strategy?: STRATEGY): Node[] {
    const result: Node[] = [];
    const findAllDfs = (node: Node) => {
      if (predicate(node)) {
        result.push(node);
      }

      node.children.forEach((n) => {
        findAllDfs(n);
      });
    };

    const findAllBfs = (node: Node) => {
      const queue = [node];

      while (queue.length) {
        const n = queue.shift();

        if (n && predicate(n)) {
          result.push(n);
        }

        n?.children?.forEach((item) => queue.push(item));
      }
    };

    if (strategy === STRATEGY.BREADTH) {
      findAllBfs(this);
    } else {
      findAllDfs(this);
    }

    return result;
  }
}

export default class Tree {
  static STRATEGY = STRATEGY;

  root: RootNode | null;

  constructor() {
    this.root = null;
  }

  parse(data: Data) {
    this.root = new RootNode(data);
    return this.root;
  }
}
