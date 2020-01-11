# Way2Go

This is the same blog webserver ported from **node.js** to **go** Both versions side-by-side sharing the same database **(SQLite)** and the same static files.

You can't bluntly rewrite code from one programming language to another because different languages use different libraries. (Mind you some people have tried to craft some parsers in the past to cope with differences in syntax but they failed for the above reason.)

Here we compare **node/express** with **go/gorilla mux** which provide the same RESTful url functionality.

From the onset **go** shines for prototyping and demos for it is **a compiled language**. This means you can copy to a USB stick a Windows executable of your work and pass it on to marketing for evaluation. They can play with it on their own PCs to their heart's content and leave you continue the development in peace. Another benefit is that you can rollout inhouse PC applications with a web interface **no libraries and painful installations** required - just copy the folder to the local PC. Anybody can now use a local webserver with its own database. Your code is used by whoever needs it and is safe from prying eyes.

