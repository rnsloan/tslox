# Lox Interpreter

A Tree-Walking Interpreter for the Lox programming language in TypeScript [http://craftinginterpreters.com/appendix-i.html](http://craftinginterpreters.com/appendix-i.html)

## Run

Create `code.lox` in the root of the project. See the `code.sample.lox` file.

```
var message = "Hello World!";
print message;
```

run `deno task exec` for the project root.

## Development

- run `deno task debug` to see an output at each stage
- Deno debugger guide: [https://deno.land/manual/getting_started/debugging_your_code](https://deno.land/manual/getting_started/debugging_your_code)

The Abstract Syntax Tree format adheres the to the [Acorn](https://github.com/acornjs/acorn) / [https://github.com/estree/estree](ESTree Specification) with one extenstion. A `PrintStatement` node:

```
interface PrintStatement {
  type: "PrintStatement";
  argument: Expression;
}
```

### Test

- `deno task test`
- `deno task update-snapshots`

### TODO

search for `TODO's` in `src/parser.ts`
