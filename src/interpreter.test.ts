import { assertSnapshot } from "https://deno.land/std@0.143.0/testing/snapshot.ts";
import { Tree } from "./tree.ts";
import { interpreter } from "./interpreter.ts";

Deno.test("Variables", async (t) => {
  const tree = new Tree();
  const root = tree.parse({ type: "Program" });
  root.addChildren([{
    type: "VariableDeclaration",
    declarations: [
      {
        type: "VariableDeclarator",
        id: { type: "Identifier", name: "hello" },
        init: { type: "Literal", value: 12.45, raw: "12.45" },
      },
    ],
  }, {
    type: "VariableDeclaration",
    declarations: [
      {
        type: "VariableDeclarator",
        id: { type: "Identifier", name: "world" },
        init: { type: "Literal", value: null, raw: null },
      },
    ],
  }]);

  const result = interpreter(tree);
  await assertSnapshot(t, result);
});

Deno.test("Functions", async (t) => {
  const tree = new Tree();
  const root = tree.parse({ type: "Program" });
  root.addChildren([
    {
      type: "CallExpression",
      callee: { type: "Identifier", name: "foo" },
      arguments: [{ type: "Literal", value: true, raw: "true" }],
    },
    {
      type: "VariableDeclaration",
      declarations: [
        {
          type: "VariableDeclarator",
          id: { type: "Identifier", name: "foo" },
          init: {
            type: "CallExpression",
            callee: { type: "Identifier", name: "hello" },
            arguments: [
              { type: "Literal", value: 34, raw: "34" },
              { type: "Literal", value: null, raw: "world" },
            ],
          },
        },
      ],
    },
  ]);
  const result = interpreter(tree);
  await assertSnapshot(t, result);
});

// varible = null test
