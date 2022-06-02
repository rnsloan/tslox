import { scanner } from "./src/scanner.ts";

const code = await Deno.readTextFile("./code.lox");
const result = scanner(code);

console.table(result);
