# Bold Editor

If using webpack-dev-server via `npm run start`, import the following in index.html:

```
<script type="text/javascript" src="redactor.min.js"></script>
<script type="text/javascript" src="app.min.js"></script> 
```
(Dev server only actively builds app.min.js).

Otherwise, in production environments, import 

```
<script type="text/javascript" src="dist.min.js"></script>
```

which is built via `grunt`.

The CSS is also built with grunt, so the webpack dev server will not be able to reload it. You must run `npm run build` anytime you change the CSS.

Todo:
- Ordered lists, unordered lists, and tables seem to ignore any font preference you apply to it.