// Simulates the preview platform: serves the Next app UNDER a path prefix.
// Anything under /mysite/* is proxied to the app with the prefix stripped.
const http = require("http");

const UPSTREAM = { host: "127.0.0.1", port: 3001 };
const PREFIX = "/mysite";

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    if (!url.pathname.startsWith(PREFIX)) {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("outside prefix (this is what absolute links would hit)");
      return;
    }
    const stripped = url.pathname.slice(PREFIX.length) || "/";
    const opts = {
      host: UPSTREAM.host,
      port: UPSTREAM.port,
      path: stripped + url.search,
      method: req.method,
      headers: { ...req.headers, host: `${UPSTREAM.host}:${UPSTREAM.port}` },
    };
    const up = http.request(opts, (r) => {
      res.writeHead(r.statusCode, r.headers);
      r.pipe(res);
    });
    up.on("error", () => {
      res.writeHead(502);
      res.end("upstream error");
    });
    req.pipe(up);
  })
  .listen(3002, "127.0.0.1", () => console.log("prefix proxy on :3002/mysite/"));
