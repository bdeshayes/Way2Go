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
