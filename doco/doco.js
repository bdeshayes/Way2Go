/**
DOCO
====
**First and foremost - the documentation.** Never mind if the program works - as long as it is documented - that's what matters!

I needed a utility to pick up comments from node.js and go source files like this very comment.

JSDoc would not touch go files, doesn't output to markdown and expects special tags.
Same complaints with autoreadme and godocdown. You can only figure out their syntax by trial and error.

In the end, you are never better served than by rolling out your own. Keep it simple stupid (KISS principle) this utility doesn't care about markdown syntax. It justs passes it thru -as is-. Which means if you need a star in the comment for a golang pointer you have to escape it with a backslash.

To keep in the spirit of my **Way2Go** repository where we compare the **same app ported from node.js to golang**
this utility also exists in golang under doco/main.go

*/
var fs = require('fs-extra');

var outfile = infile = '';

switch (process.argv.length)
{
case 3: infile = process.argv[2];
	outfile = infile + ".md";
	break;
	
case 4: infile = process.argv[2];
	outfile = process.argv[3];
	break;
	
default: console.log("Usage: node doco.js infile [outfile]\n");
}

var buffer = fs.readFileSync(infile);

var sample = buffer.toString();
	
output = '';
var comment = false;
var counter = sample.length;

for (var k = 0; k < sample.length; k++) 
	{
	if (sample.substr(k, 3) == "/**")
		{
		//console.log("open comment");
		comment = true;
		k += 3;
		}
		
	else if (sample.substr(k, 2) == "*/")
		{
		//console.log("close comment");
		comment = false;
		}
		
	if (comment == true)
		output = output + sample.substr(k, 1);
	}

fs.writeFileSync(outfile, output, "utf8");
