/**
DOCO
====
**First and foremost - the documentation.** Never mind if the program works - as long as it is documented - that's what matters!

I needed a utility to pick up comments from node.js and go source files like this very comment.

JSDoc would not touch go files, doesn't output to markdown and expects special tags.
Same complaints with autoreadme and godocdown. You can only figure out their syntax by trial and error.

In the end, you are never better served than by rolling out your own. Keep it simple stupid (KISS principle) this utility doesn't care about markdown syntax. It justs passes it thru -as is-. Which means if you need a star in the comment for a golang pointer you have to escape it with a backslash.

To keep in the spirit of my **Way2Go** repository where we compare the **same app ported from node.js to golang**
this utility also exists in node.js under doco.js

*/
package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
)
/**
**func substr(input string, start int, length int) string**
Go doesn't have substr so we make our own...
*/
func substr(input string, start int, length int) string {
	asRunes := []rune(input)

	if start >= len(asRunes) {
		return ""
	}

	if start+length > len(asRunes) {
		length = len(asRunes) - start
	}

	return string(asRunes[start : start+length])
}

func main() {

	infile := ""
	outfile := ""
	if len(os.Args[1:]) == 1 {
		infile = os.Args[1]
		outfile = infile + ".md"
	} else if len(os.Args[1:]) == 2 {
		infile = os.Args[1]
		outfile = os.Args[2]
	} else {
		fmt.Println("Usage: " + filepath.Base(os.Args[0]) + " infile [outfile]")
		os.Exit(0)
	}

	b, err := ioutil.ReadFile(infile)
	if err != nil {
		fmt.Print(err)
	}

	str := string(b) // convert content to a 'string'

	output := ""
	comment := false

	for k := 0; k <= len(str); k++ {
		if substr(str, k, 3) == "/**" {
			//fmt.Println("open comment")
			comment = true
			k = k + 3
		} else if substr(str, k, 2) == "*/" {
			//fmt.Println("close comment")
			comment = false
		}

		if comment == true {
			output = output + substr(str, k, 1)
		}

	}

	err = ioutil.WriteFile(outfile, []byte(output), 0644)
	if err != nil {
		log.Fatal(err)
	}

}
