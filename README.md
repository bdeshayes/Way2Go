# Way2Go

This is the same blog webserver ported from **node.js** to **go** Both versions side-by-side sharing the same database **(SQLite)** and the same static files.

Give it a spin...
-----------------
Click on the green button above "Clone or download" and unpack Way2Go-master.zip on your Windows PC. Now run Way2Go.exe, enable the windows firewall dialog to run a local webserver on your machine and type this url in your browser http://localhost:8080 Voila!  
(If you want to go into the admin part and edit the posts the login is daffy/mos587)
 
You can't bluntly rewrite code from one programming language to another because different languages use different libraries. (Mind you some people have tried to craft some parsers in the past to cope with differences in syntax but they failed for the above reason.)

Here we compare **node/express** with **go/gorilla mux** which provide the same RESTful url functionality.

From the onset **go** shines for prototyping and demos for it is **a compiled language**. This means you can copy to a USB stick a Windows executable of your work and pass it on to marketing for evaluation. They can play with it on their own PCs to their heart's content and leave you continue the development in peace. Another benefit is that you can rollout inhouse PC applications with a web interface **no libraries and painful installations** required - just copy the folder to the local PC. Anybody can now use a local webserver with its own database. Your code is used by whoever needs it and is safe from prying eyes.
That definitively beats the humongous node_modules folder that you have to bear for each node project...

Go is a typed language - so if you come from PHP you will have to differentiate between strings and integers. You can't create http responses on the fly with heredoc strings and intersperse variables in the mix. Instead you are told to use templates. Templates can only take one argument but thankfully you can call several templates one after the other each with its own data.

Go has its own idiosyncrasies - try to build some **JSON** data for instance - it is quite ugly but so straightforward in node/javascript (!)

[node documentation](node.md)

[go documentation](go.md)

