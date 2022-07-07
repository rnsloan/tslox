import { assertSnapshot } from "https://deno.land/std@0.143.0/testing/snapshot.ts";
import { scanner } from "./scanner.ts";
import { ASTNode, parser } from "./parser.ts";
import { interpreter } from "./interpreter.ts";
import { Tree } from "./tree.ts";

function test(code: string) {
  const tokens = scanner(code);
  const ast = parser(tokens);
  return interpreter(ast as Tree<ASTNode>);
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

  const code4 = `
var foo = 5 * 10
var bar = 5*10/2;
var baz = 5*(10/2);
`;
  await assertSnapshot(t, test(code4));

  const code5 = `
var foo = 2+10/2
var bar = (2+10)/2
`;
  await assertSnapshot(t, test(code5));

  const code6 = `
10 != 6
'a' >= 'b'
6 < 4
foo != bar
`;
  await assertSnapshot(t, test(code6));

  const code7 = `
6 or null;
(6 and null) or bar;
  `;
  await assertSnapshot(t, test(code7));

  const code8 = `
var one = foo.bar;
var two = foo.bar.baz.troll;
  `;
  await assertSnapshot(t, test(code8));

  const code9 = `
var one = newPoint(2, 0).y; 
var two = foo.bar().baz;
var three = foo().bar().baz()
var four = foo.bar.baz()
    `;
  await assertSnapshot(t, test(code9));

  const code10 = `newPoint(x + 2, 0).y = 3;`;
  await assertSnapshot(t, test(code10));

  const code11 = `
{
  newPoint(x + 2, 0).y = 3;
  var tan = 7;
}
`;
  await assertSnapshot(t, test(code11));

  const code12 = `
while (foo < 4) {
  i+1
  foo + 1
}
`;
  await assertSnapshot(t, test(code12));

  const code13 = `while (i < 10) i+1`;
  await assertSnapshot(t, test(code13));

  const code14 = `return foo < bar;`;
  await assertSnapshot(t, test(code14));

  const code15 = `console.log("hello world")`;
  await assertSnapshot(t, test(code15));

  const code16 = `
if (less == true) {
  console.log('hello world');
}`;
  await assertSnapshot(t, test(code16));

  const code17 = `
for (var i = 10;i< 10;i = i+1) {
  console.log(i)
}

for (var i = 10;i< 10;) {
  console.log(i)
}

for (var i = 10;i< 10) {
  console.log(i)
}

for (var i = 10;;) {
  console.log(i)
}

for (var i = 10;) {
  console.log(i)
}

for (var i = 10) {
  console.log(i)
}

for (var i = 10;i< 10;i = i+1) console.log(i)
`;
  await assertSnapshot(t, test(code17));
});
