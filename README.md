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

### Test

- `deno task test`
- `deno task update-snapshots`
