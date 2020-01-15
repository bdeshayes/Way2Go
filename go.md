
Way2Go
============
This is a fully fledged webserver application written in golang with gorilla/mux routing and SQLite database.  
It is part of my **Way2Go** repository where we compare the **same app ported from node.js to golang**


**func GetCredentials(request http.Request) (username string, password string)**  
GetCredentials returns login data from session cookie

**func BuildTags(html bool) string**  
Generates html buttons for each unique tag across the whole blog

**func CheckCredentials(r http.Request) bool**  
CheckCredentials validates user login

**func AdGenerator(theAarray []Advert) int**  
inserts random adverts before each post

**func Index(w http.ResponseWriter, r \*http.Request)**  
Index - the main blog builder: posts interspersed with adverts  
does both the whole homepage or posts limited to a given tag

**func Show(w http.ResponseWriter, r \*http.Request)**  
Show displays a single post

**func Edit(w http.ResponseWriter, r \*http.Request)**  
Edit - the dialog form to create/modify/delete a post

**func Posting(w http.ResponseWriter, r \*http.Request)**  
Posting - processes the form data to create/modify/delete a post

**func Crass(w http.ResponseWriter, r \*http.Request)**  
Crass increments the crass score of the blog post

**func Pithy(w http.ResponseWriter, r \*http.Request)**  
Pithy increments the pithy score of the blog post

**func NextJoke(w http.ResponseWriter, r \*http.Request)**  
NextJoke generates the data for the html message overlay

**func JsonLine(w http.ResponseWriter, r \*http.Request)**  
JsonLine serves the data needed when the user clicks on an advert

**func DeleteImage(w http.ResponseWriter, r \*http.Request)**  
You may delete an image while keeping the post itself

**func Login(w http.ResponseWriter, r \*http.Request)**  
Login displays the login form dialog

**func UserLogsIn(w http.ResponseWriter, r \*http.Request)**  
UserLogsIn creates a session **more work here** if user credentials fail

**func main()**  
main is the entry point which holds dispatches for all the url routes
