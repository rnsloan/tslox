import { scanner } from "./src/scanner.ts";
import { parser } from "./src/parser.ts";
import { interpreter } from "./src/interpreter.ts";

const main = async () => {
  if (!Deno.args[0]) {
    console.error("no file name specified e.g: ./tslox.silicon ./code.lox");
    return;
  }

  const code = await Deno.readTextFile(Deno.args[0]);
  const tokens = scanner(code);
  const ast = parser(tokens);
  const js = interpreter(ast);

  try {
    Function(js)();
  } catch (e) {
    console.error("Error executing code");
    console.error(e);
  }
};

main();
