# Onchain JS

This is a proof-of-concept of storing a JavaScript library on StarkNet. You can see the [result here](https://onchain-js.vercel.app/). It's a rendering of the StarkNet logo in a `<canvas>` tag using [p5.js](https://p5js.org/). The interesting thing about it is that both the rendering library and the JS [code used to draw the logo](./snlogo.js) are both stored on chain as smart contracts.

## How

There's two parts of the system. First, transforming the JS code into Cairo and making it available on chain. Second, calling a StarkNet function and decoding the result into executable JS code. Let's have a look at how it works.

### JS to Cairo

Putting JS code on chain is a bit convoluted but still pretty easy to follow. The code is ready and base64 encoded into a string. This string is prepended with `data:text/javascript;base64,` [data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs) scheme, then gzipped and base64 encoded again. This output string is split into chunks of 31 characters and encoded as [Cairo short strings](https://www.cairo-lang.org/docs/how_cairo_works/consts.html?short-string-literals#short-string-literals). Finally, this array of short strings is "wrapped" in a StarkNet function.

The [`js_to_cairo.py`](./js_to_cairo.py) script takes care of automating this pipeline:

```sh
./js_to_cairo.py --code-file snlogo.js --func-name get_snlogojs --output-file snlogojs.cairo
```

To see the before and after, check the [`snlogo.js`](./snlogo.js) JS code and the resulting [`snlogojs.cairo`](./snlogojs.cairo) Cairo code.

### Cairo to JS

Turning Cairo short strings into executable JS is just the process above in reverse. After calling the function returning an array of short strings, use `decodeShortString` from starknet.js on each element, combine them into a single string, decompress (e.g. using [fflate](https://github.com/101arrowz/fflate)) and put the end result in a `<script>` tag. See [page.tsx](./app/app/page.tsx) for details.

## Where

The p5.js lib has been deployed to [`0x4cd1b9b78b42d9f4b30abab92e8616ca34596f10ae5131f6cd3d913767c71e5`]( `https://testnet.starkscan.co/contract/0x04cd1b9b78b42d9f4b30abab92e8616ca34596f10ae5131f6cd3d913767c71e5`). You can call `get_p5js` on it.

The code to draw the StarkNet logo in p5 has been deployed to [`0x4c8c96e96ccf04a0fcadad1bc259e52bd5c220c0cbbc9cc9c17109d4e5dd312`](https://testnet.starkscan.co/contract/0x4c8c96e96ccf04a0fcadad1bc259e52bd5c220c0cbbc9cc9c17109d4e5dd312). Use `get_snlogojs` to fetch the code.
