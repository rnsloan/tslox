import { assertSnapshot } from "https://deno.land/std@0.143.0/testing/snapshot.ts";
import { scanner } from "./scanner.ts";
import { parser } from "./parser.ts";
import { interpreter } from "./interpreter.ts";

function test(code: string) {
  const tokens = scanner(code);
  const ast = parser(tokens);
  return interpreter(ast);
}

Deno.test("Integration", async (t) => {
  const code = `
var foo = bar;
var baz = 'hello world';
var alpha = 5454.454;
var beta = null;
var gamma = nil;
`;
  await assertSnapshot(t, test(code));

  const code2 = `
foo(true);
bar();
var foo = hello(34,"world");
`;
  await assertSnapshot(t, test(code2));

  const code3 = `
var foo = -5;
var bar = !false
var baz = !!true
`;
  await assertSnapshot(t, test(code3));
});
