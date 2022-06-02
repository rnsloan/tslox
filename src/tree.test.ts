import {
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.141.0/testing/bdd.ts";
import {
  assert,
  assertEquals,
  assertObjectMatch,
} from "https://deno.land/std@0.141.0/testing/asserts.ts";
import Tree, { INode, IRootNode } from "./tree.ts";

type Rec = Record<PropertyKey, unknown>;

describe("Tree", () => {
  const testData = {
    a: { name: "john" },
    b: "Anisha",
    c: 13,
  };
  let tree: Tree;

  describe("Root Node", () => {
    beforeEach(() => {
      tree = new Tree();
    });

    it("should return the root node", () => {
      const root = tree.parse(testData.a);

      assertObjectMatch(root.data as Rec, testData.a);
    });

    it("should confirm it is the root node", () => {
      const root = tree.parse(testData.a);

      assertEquals(root.isRoot(), true);
      assertEquals(root.isLeaf(), false);
    });

    it("should not allow dropping the root node", () => {
      const root = tree.parse(testData.a);
      const result = root.drop();

      assertEquals(result, undefined);
      assert(tree.root !== null);
    });

    it("should find the node that matches a predicate", () => {
      const root = tree.parse(8);
      const firstChild = root.addChild(5);

      root.addChild(25);
      firstChild.addChild(2000);

      const resultDfs = root.find((node) => node.data > 10);

      assert(resultDfs!.data === 2000);

      const resultBfs = root.find(
        (node) => node.data > 10,
        Tree.STRATEGY.BREADTH,
      );

      assert(resultBfs!.data === 25);
    });

    it("should find all nodes that match a predicate", () => {
      const root = tree.parse({ age: 8 });
      const firstChild = root.addChild({ age: 100 });

      root.addChild({ age: 25 });
      firstChild.addChild({ age: 2000 });

      const resultDfs = root.findAll((node) => node.data.age > 10);

      assert(resultDfs[0].data.age === 100);
      assert(resultDfs[1].data.age === 2000);
      assert(resultDfs[2].data.age === 25);

      const resultBfs = root.findAll(
        (node) => node.data.age > 10,
        Tree.STRATEGY.BREADTH,
      );

      assert(resultBfs[0].data.age === 100);
      assert(resultBfs[1].data.age === 25);
      assert(resultBfs[2].data.age === 2000);
    });
  });

  describe("Node", () => {
    let root: IRootNode;
    let child: INode;

    beforeEach(() => {
      tree = new Tree();
      root = tree.parse(testData.a);
      child = root.addChild(testData.b);
      child.addChild(testData.c);
    });

    it("should have children", () => {
      assertEquals(child.hasChildren(), true);
    });

    it("should insert children at index", () => {
      const data = "scott";
      root.addChildAtIndex(data, 0);

      assertEquals(root.children[0].data, data);
    });

    it("should be a leaf", () => {
      assertEquals(child.isLeaf(), false);

      const leaf = child.addChild("hello world");

      assertEquals(leaf.isLeaf(), true);
    });

    it("should be able to drop nodes", () => {
      const data = "hello world";
      const startChildrenNumber = child.children.length;
      const leaf = child.addChild("hello world");

      assertEquals(child.children.length, startChildrenNumber + 1);

      const result = leaf.drop();

      assertEquals(result?.data, data);
      assertEquals(child.children.length, startChildrenNumber);
    });

    it("should print a nodes tree path", () => {
      const data = "hello world";
      const node = child.addChild(data);
      const path = node.getPath();

      assertEquals(path.length, 3);
      assertEquals(path[0].data, testData.a);
      assertEquals(path[2].data, data);
    });
  });
});
