import { scanner } from "./src/scanner.ts";
import { parser } from "./src/parser.ts";
import { interpreter } from "./src/interpreter.ts";

const main = async () => {
  const isDebugMode = Deno.args.includes("--debug");
  const code = await Deno.readTextFile("./code.lox");

  if (isDebugMode) {
    console.log(code);
    console.log("-------");
  }

  const tokens = scanner(code);

  if (isDebugMode) {
    console.table(tokens);
    console.log("-------");
  }

  const ast = parser(tokens);

  if (isDebugMode) {
    console.dir(ast.root, { depth: 50 });
    console.log("-------");
  }  
  
  const js = interpreter(ast);

  if (isDebugMode) {
    console.log(js);
  }

  /*
try {
  Function(js)();
} catch (_) {
  console.error("Error executing code");
}
  */
};

main();
