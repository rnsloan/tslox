# Lox Interpreter

A Tree-Walking Interpreter for the Lox programming language in TypeScript [http://craftinginterpreters.com/appendix-i.html](http://craftinginterpreters.com/appendix-i.html)

## Run

Create `code.lox` at the root of the project. See the `code.sample.lox` file.

```
fun helloWorld() {
  var hello = "hello world!";
  print hello;
}

helloWorld();
```

run `deno task exec` for the project root.

## Development

Deno version `1.23.2` or later is required.

- run `deno task debug` to see output at each stage
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
