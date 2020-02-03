DOCO
====
**First and foremost - the documentation.** Never mind if the program works - as long as it is documented - that's what matters!

I needed a utility to pick up comments from node.js and go source files like this very comment.

JSDoc would not touch go files, doesn't output to markdown and expects special tags.
Same complaints with autoreadme and godocdown. You can only figure out their syntax by trial and error.

In the end, you are never better served than by rolling out your own. Keep it simple stupid (KISS principle) this utility doesn't care about markdown syntax. It justs passes it thru -as is-. Which means if you need a star in the comment for a golang pointer you have to escape it with a backslash.

To keep in the spirit of my **Way2Go** repository where we compare the **same app ported from node.js to golang**
this utility also exists in node.js under doco.js


**func substr(input string, start int, length int) string**  
Go doesn't have substr so we make our own...

doco.exe (go version compiled for windows) is under https://github.com/bdeshayes/Way2Go/releases assets
