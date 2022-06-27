enum STRATEGY {
  DEPTH,
  BREADTH,
}

export interface INode<T> {
  parent: Node<T> | null;
  children: Node<T>[];
  data: T;
  isRoot: () => boolean;
  isLeaf: () => boolean;
  hasChildren: () => boolean;
  drop: () => void;
  addChild: (data: T) => Node<T>;
  addChildren: (data: T[]) => Node<T>[];
  addChildAtIndex: (data: T, index: number) => Node<T>;
  getPath: (node: Node<T>) => Node<T>[];
}

class Node<T> implements INode<T> {
  protected id: string;
  readonly parent: Node<T> | null;
  readonly children: Node<T>[];
  readonly data: T;

  constructor(data: T, parent?: Node<T>) {
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

  drop(): Node<T> | undefined {
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

  addChild(data: T): Node<T> {
    const node = new Node(data, this);
    this.children.push(node);
    return node;
  }

  addChildren(data: T[]) {
    data.forEach((d) => {
      this.addChild(d);
    });
    return this.children;
  }

  addChildAtIndex(data: T, index: number): Node<T> {
    const node = new Node(data, this);
    this.children.splice(index, 0, node);
    return node;
  }

  getPath() {
    interface AddParent {
      (n: Node<T>): AddParent;
    }

    const path = [];
    path.push(this);

    const addParent = (n: Node<T>): AddParent | undefined => {
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

export interface IRootNode<T> extends INode<T> {
  find: (
    predicate: (n: Node<T>) => boolean,
    strategy?: STRATEGY,
  ) => Node<T> | undefined;
  findAll: (predicate: (n: Node<T>) => boolean, strategy?: STRATEGY) => Node<T>[];
}

export class RootNode<T> extends Node<T> implements IRootNode<T> {
  constructor(data: T) {
    super(data);
    this.id = `root-${crypto.randomUUID()}`;
  }

  isRoot() {
    return true;
  }

  isLeaf() {
    return false;
  }

  find(predicate: (n: Node<T>) => boolean, strategy?: STRATEGY): Node<T> | undefined {
    let result: Node<T> | undefined;

    const findDfs = (node: Node<T>) => {
      if (predicate(node) && !result) {
        result = node;
        return;
      }

      for (let i = 0; i < node.children.length; i++) {
        findDfs(node.children[i]);
      }
    };
    const findBfs = (node: Node<T>) => {
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

  findAll(predicate: (n: Node<T>) => boolean, strategy?: STRATEGY): Node<T>[] {
    const result: Node<T>[] = [];
    const findAllDfs = (node: Node<T>) => {
      if (predicate(node)) {
        result.push(node);
      }

      node.children.forEach((n) => findAllDfs(n));
    };

    const findAllBfs = (node: Node<T>) => {
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

  traverse(func: (n: Node<T>) => void, strategy?: STRATEGY): void {
    const traverseDfs = (node: Node<T>) => {
      func(node);

      node.children.forEach((n) => traverseDfs(n));
    };

    const traverseBfs = (node: Node<T>) => {
      const queue = [node];

      while (queue.length) {
        const n = queue.shift();

        if (n) {
          func(n);
        }

        n?.children?.forEach((item) => queue.push(item));
      }
    };

    if (strategy === STRATEGY.BREADTH) {
      traverseBfs(this);
    } else {
      traverseDfs(this);
    }
  }
}

export class Tree<T> {
  static STRATEGY = STRATEGY;

  root: RootNode<T> | null;

  constructor() {
    this.root = null;
  }

  parse(data: T) {
    this.root = new RootNode(data);
    return this.root;
  }
}
