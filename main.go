/**
Way2Go
============
This is a fully fledged webserver application written in golang with gorilla/mux routing and SQLite database.
It is part of my **Way2Go** repository where we compare the **same app ported from node.js to golang**

*/
/*
Package Way2Go is an example package with documentation

	04 Jan 2020 - implemented gorilla/mux to have same routes as the node.js implementation
	06 Jan 2020 - a lot of mucking around to implement edit form
	07 Jan 2020 - admin login for edits - session cookies via gorilla mux
	08 Jan 2020 - png gif support - jokes overlay
	09 Jan 2020 - JSON code
	10 Jan 2020 - AdGenerator
	11 Jan 2020 - shuffle
	12 Jan 2020 - todo check ads in tags - randon crass/pithy ratings
	14 Jan 2020 - merged Index and Tag into one
	functions by alphabetic order (only if starts with a capital letter)
	types ditto

	C:\Way2Go>godocdown >go.md to buid the doco

*/
package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"image/gif"
	"image/jpeg"
	"image/png"
	"io"
	"log"
	"math/rand"
	"net/http"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"text/template"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/securecookie"
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

type Post struct {
	Id     int
	Crass  int
	Pithy  int
	Title  string
	Body   string
	Tags   string
	Url    string
	Author string
	Bgc    string
	Tlu    string
	Image  bool
	Login  bool
	Advert string
}
type Head struct {
	NextJokeId int
	LoginTag   string
}
type Joke struct {
	Id      int
	Buttons string
	Text    string
}

func dbConn() (db *sql.DB) {
	db, err := sql.Open("sqlite3", "CorP.sqlite")
	if err != nil {
		log.Fatal(err)
	}
	return db
}

var tmpl = template.New("name")

// cookie handling

var cookieHandler = securecookie.New(
	securecookie.GenerateRandomKey(64),
	securecookie.GenerateRandomKey(32))

/**
**func GetCredentials(request http.Request) (username string, password string)**
GetCredentials returns login data from session cookie
*/
func GetCredentials(request *http.Request) (username string, password string) {
	if cookie, err := request.Cookie("session"); err == nil {
		cookieValue := make(map[string]string)
		if err = cookieHandler.Decode("session", cookie.Value, &cookieValue); err == nil {
			username := cookieValue["username"]
			password := cookieValue["password"]
			return username, password
		}
	}
	return username, password
}

func setSession(username string, password string, response http.ResponseWriter) {
	value := map[string]string{
		"username": username,
		"password": password,
	}
	if encoded, err := cookieHandler.Encode("session", value); err == nil {
		cookie := &http.Cookie{
			Name:  "session",
			Value: encoded,
			Path:  "/",
		}
		http.SetCookie(response, cookie)
	}
}

func clearSession(response http.ResponseWriter) {
	cookie := &http.Cookie{
		Name:   "session",
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	}
	http.SetCookie(response, cookie)
}

func appendIfMissing(slice []string, s string) []string {
	for _, ele := range slice {
		if ele == s {
			return slice
		}
	}
	return append(slice, s)
}

/**
**func BuildTags(html bool) string**
Generates html buttons for each unique tag across the whole blog
*/
func BuildTags(html bool) string {
	db := dbConn()
	selDB, err := db.Query("SELECT tags FROM Posts")
	if err != nil {
		panic(err.Error())
	}

	var tags []string
	var retval = ""
	if html {
		retval = `<div id="footer">`
	}
	for selDB.Next() {
		var mytags string
		err = selDB.Scan(&mytags)
		if err != nil {
			panic(err.Error())
		}
		var splits = strings.Split(mytags, ",")

		for _, value := range splits {
			tags = appendIfMissing(tags, value)
		}
	}
	sort.Strings(tags)
	if html {
		retval = retval + `<a href="/">all</a> &nbsp; `
	}
	for _, value := range tags {
		if html {
			retval = retval + `<a class="taglink" href="/tag/` + value + `">` + value + `</a> &nbsp; `
		} else {
			retval = retval + value + ","
		}
	}

	defer db.Close()
	if html {
		retval = retval + "</div>"
	} else {
		retval = strings.TrimSuffix(retval, ",")
	}

	return retval
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

/**
**func CheckCredentials(r http.Request) bool**
CheckCredentials validates user login
*/
func CheckCredentials(r *http.Request) bool {
	username, password := GetCredentials(r)
	hash := "$2a$04$ouWVYXaVo0N/vnB0BH9uUeNSho6qxNh25wixQ8cw5K3Wp3WUDZ5A6"
	if (username == "daffy") && CheckPasswordHash(password, hash) {
		return true
	} else {
		return false
	}
}

func GetNextJokeId() int {
	var id int
	db := dbConn()
	selDB, err := db.Query(`SELECT id FROM jokes order by id desc LIMIT 1`)
	for selDB.Next() {
		err = selDB.Scan(&id)
		if err != nil {
			panic(err.Error())
		}
	}
	defer db.Close()
	return id
}

func GetAdvert(id int) string {
	db := dbConn()
	var msg string

	selDB, err := db.Query("SELECT msg FROM oneliners WHERE id=?", id)
	for selDB.Next() {
		err = selDB.Scan(&msg)
		if err != nil {
			panic(err.Error())
		}
	}
	defer db.Close()
	return `<div onclick="fakead('/api/line/` + strconv.Itoa(id) + `')" style="cursor: pointer; border-style: dashed; font-family: arial; font-size: 120%; text-align: center;">` + msg + `</div><br />`
}

var UsedAds = map[int]bool{}

type Advert struct {
	id    int
	msg   string
	part2 string
}

/**
**func AdGenerator(theAarray []Advert) int**
inserts random adverts before each post
*/
func AdGenerator(theAarray []Advert) int {
	id := 1

	for {
		if len(UsedAds) == 0 {
			// force gospel video to be first - guide to the end times up front
			id = 1 // id = 5;
			//log.Println("forcing 1")
		} else if len(UsedAds) == 1 { // force gospel video to be first - guide to the end times up front
			id = 5
			//log.Println("forcing 5")
		} else {
			id = rand.Intn(len(theAarray)) //Math.floor((Math.random() * AdAarray.length));
			//fmt.Printf("picking random %v\n", id)
		}

		if len(theAarray) == len(UsedAds) { // all used up - start again
			for k := range UsedAds {
				delete(UsedAds, k)
			}
			//fmt.Printf("%v All used up - reset %v\n", id, UsedAds)
		} else if !UsedAds[id] {
			break
		} // for loop
	}
	//while (UsedAds.includes(id)); // that id is not in there - get it
	UsedAds[id] = true
	//UsedAds.push(id);
	//fmt.Printf("%v AdGenerator2 %v\n", id, UsedAds)
	//return `<div onclick="fakead('/api/line/${AdAarray[id].id}')" style="cursor: pointer; border-style: dashed; font-family: arial; font-size: 120%; text-align: center;">${msg}</div><br />`;
	return id
}

/**
**func Index(w http.ResponseWriter, r \*http.Request)**
Index - the main blog builder: posts interspersed with adverts
does both the whole homepage or posts limited to a given tag
*/
func Index(w http.ResponseWriter, r *http.Request) {
	db := dbConn()
	rand.Seed(time.Now().UTC().UnixNano())

	theAdvert := Advert{}
	myAdverts := []Advert{}

	selDB, err := db.Query("SELECT * FROM oneliners")
	if err != nil {
		panic(err.Error())
	}

	for selDB.Next() {
		var id int
		var msg, part2 string
		err = selDB.Scan(&id, &msg, &part2)
		if err != nil {
			panic(err.Error())
		}
		theAdvert.id = id
		theAdvert.msg = msg
		theAdvert.part2 = part2
		myAdverts = append(myAdverts, theAdvert)
	}

	var query string
	vars := mux.Vars(r)
	if len(vars) == 0 {
		query = "SELECT * FROM Posts ORDER BY id DESC"
	} else {
		query = "SELECT * FROM Posts where tags like '%" + vars["tag"] + "%' ORDER BY id DESC"
	}

	post := Post{}
	res := []Post{}

	selDB, err = db.Query(query)
	if err != nil {
		panic(err.Error())
	}

	var i = 0
	for selDB.Next() {
		var id, crass, pithy int
		var title, body, tags, url, author string
		err = selDB.Scan(&id, &title, &body, &tags, &url, &crass, &pithy, &author)
		if err != nil {
			panic(err.Error())
		}
		post.Id = id
		post.Title = title
		post.Body = strings.Replace(body, "\n", "<br />", -1)

		// need to handle <!--more-->
		//mybody = mybody.replace(/<!--more-->.*$/s, `<br /><a href="/api/view/${post.id}">view more</a>`);
		re := regexp.MustCompile(`<!--more-->.*$`)
		post.Body = re.ReplaceAllString(post.Body, `<br /><a href="/api/view/`+strconv.Itoa(id)+`">view more</a>`)

		var splits = strings.Split(tags, ",")
		post.Tags = ""
		for _, value := range splits {
			post.Tags = post.Tags + `<a class="taglink" href="/tag/` + value + `">` + value + "</a> &nbsp;"
		}
		post.Url = url
		post.Crass = crass
		post.Pithy = pithy
		post.Author = author

		if _, err := os.Stat("./images/" + strconv.Itoa(id) + ".jpg"); !os.IsNotExist(err) {
			post.Image = true
		} else {
			post.Image = false
		}
		post.Login = CheckCredentials(r)

		res = append(res, post)
		i = i + 1
	}
	head := Head{}
	head.NextJokeId = GetNextJokeId()

	head.LoginTag = `<a href="/login">LOGIN</a>`
	if post.Login {
		head.LoginTag = `<a href="/logout">LOGOUT</a>&nbsp; &nbsp; <a href="/api/edit/0"> NEW POST</a>`
	}

	if !CheckCredentials(r) {
		rand.Seed(time.Now().UnixNano())
		rand.Shuffle(len(res), func(i, j int) { res[i], res[j] = res[j], res[i] })

		for k := range UsedAds {
			delete(UsedAds, k)
		}
		for i = 0; i < len(res); i++ {
			if (i % 2) == 0 {
				res[i].Bgc = "#eeeecc"
			} else {
				res[i].Bgc = "#cceeee"
			}
			if (i % 3) == 0 {
				choosen := myAdverts[AdGenerator(myAdverts)]
				res[i].Advert = `<div onclick="fakead('/api/line/` + strconv.Itoa(choosen.id) + `')" style="cursor: pointer; border-style: dashed; font-family: arial; font-size: 120%; text-align: center;">` + choosen.msg + `</div><br />`
			} else {
				res[i].Advert = ""
			}
		}
	} else {
		for i = 0; i < len(res); i++ {
			if (i % 2) == 0 {
				res[i].Bgc = "#eeeecc"
			} else {
				res[i].Bgc = "#cceeee"
			}
		}
	}
	tmpl.ExecuteTemplate(w, "Header", head)
	tmpl.ExecuteTemplate(w, "Index", res)
	tmpl.ExecuteTemplate(w, "Footer", BuildTags(true))
	defer db.Close()
}

/**
**func Sort(w http.ResponseWriter, r \*http.Request)**
Index - the main blog builder: posts interspersed with adverts
does posts sorted by crass or pithy scores
*/
func Sort(w http.ResponseWriter, r *http.Request) {
	db := dbConn()
	rand.Seed(time.Now().UTC().UnixNano())

	theAdvert := Advert{}
	myAdverts := []Advert{}

	selDB, err := db.Query("SELECT * FROM oneliners")
	if err != nil {
		panic(err.Error())
	}

	for selDB.Next() {
		var id int
		var msg, part2 string
		err = selDB.Scan(&id, &msg, &part2)
		if err != nil {
			panic(err.Error())
		}
		theAdvert.id = id
		theAdvert.msg = msg
		theAdvert.part2 = part2
		myAdverts = append(myAdverts, theAdvert)
	}

	var query string
	vars := mux.Vars(r)
	if len(vars) == 0 {
		query = "SELECT * FROM Posts ORDER BY id DESC"
	} else {
		query = "SELECT * FROM Posts ORDER BY " + vars["score"] + " DESC"
	}

	post := Post{}
	res := []Post{}

	selDB, err = db.Query(query)
	if err != nil {
		panic(err.Error())
	}

	var i = 0
	for selDB.Next() {
		var id, crass, pithy int
		var title, body, tags, url, author string
		err = selDB.Scan(&id, &title, &body, &tags, &url, &crass, &pithy, &author)
		if err != nil {
			panic(err.Error())
		}
		post.Id = id
		post.Title = title
		post.Body = strings.Replace(body, "\n", "<br />", -1)

		// need to handle <!--more-->
		//mybody = mybody.replace(/<!--more-->.*$/s, `<br /><a href="/api/view/${post.id}">view more</a>`);
		re := regexp.MustCompile(`<!--more-->.*$`)
		post.Body = re.ReplaceAllString(post.Body, `<br /><a href="/api/view/`+strconv.Itoa(id)+`">view more</a>`)

		var splits = strings.Split(tags, ",")
		post.Tags = ""
		for _, value := range splits {
			post.Tags = post.Tags + `<a class="taglink" href="/tag/` + value + `">` + value + "</a> &nbsp;"
		}
		post.Url = url
		post.Crass = crass
		post.Pithy = pithy
		post.Author = author

		if _, err := os.Stat("./images/" + strconv.Itoa(id) + ".jpg"); !os.IsNotExist(err) {
			post.Image = true
		} else {
			post.Image = false
		}
		post.Login = CheckCredentials(r)

		res = append(res, post)
		i = i + 1
	}
	head := Head{}
	head.NextJokeId = GetNextJokeId()

	head.LoginTag = `<a href="/login">LOGIN</a>`
	if post.Login {
		head.LoginTag = `<a href="/logout">LOGOUT</a>&nbsp; &nbsp; <a href="/api/edit/0"> NEW POST</a>`
	}

	/*if !CheckCredentials(r) {
		rand.Seed(time.Now().UnixNano())
		rand.Shuffle(len(res), func(i, j int) { res[i], res[j] = res[j], res[i] })

		for k := range UsedAds {
			delete(UsedAds, k)
		}
		for i = 0; i < len(res); i++ {
			if (i % 2) == 0 {
				res[i].Bgc = "#eeeecc"
			} else {
				res[i].Bgc = "#cceeee"
			}
			if (i % 3) == 0 {
				choosen := myAdverts[AdGenerator(myAdverts)]
				res[i].Advert = `<div onclick="fakead('/api/line/` + strconv.Itoa(choosen.id) + `')" style="cursor: pointer; border-style: dashed; font-family: arial; font-size: 120%; text-align: center;">` + choosen.msg + `</div><br />`
			} else {
				res[i].Advert = ""
			}
		}
	} else {*/
	for i = 0; i < len(res); i++ {
		if (i % 2) == 0 {
			res[i].Bgc = "#eeeecc"
		} else {
			res[i].Bgc = "#cceeee"
		}
		//}
	}
	tmpl.ExecuteTemplate(w, "Header", head)
	tmpl.ExecuteTemplate(w, "Index", res)
	tmpl.ExecuteTemplate(w, "Footer", BuildTags(true))
	defer db.Close()
}

/**
**func Show(w http.ResponseWriter, r \*http.Request)**
Show displays a single post
*/
func Show(w http.ResponseWriter, r *http.Request) {
	db := dbConn()
	//nId := r.URL.Query().Get("id")
	vars := mux.Vars(r)
	nId := vars["id"]

	selDB, err := db.Query("SELECT * FROM Posts WHERE id=?", nId)
	if err != nil {
		panic(err.Error())
	}
	post := Post{}
	for selDB.Next() {
		var id, crass, pithy int
		var title, body, tags, url, author string
		err = selDB.Scan(&id, &title, &body, &tags, &url, &crass, &pithy, &author)
		if err != nil {
			panic(err.Error())
		}
		post.Id = id
		post.Title = title
		post.Body = strings.Replace(body, "\n", "<br />", -1)
		var splits = strings.Split(tags, ",")
		post.Tags = ""
		for _, value := range splits {
			post.Tags = post.Tags + `<a class="taglink" href="/tag/` + value + `">` + value + "</a> &nbsp;"
		}
		post.Url = url
		post.Crass = crass
		post.Pithy = pithy
		post.Author = author
		post.Bgc = "#eeeecc"
		if _, err := os.Stat("./images/" + strconv.Itoa(id) + ".jpg"); !os.IsNotExist(err) {
			post.Image = true
		} else {
			post.Image = false
		}
	}
	post.Login = CheckCredentials(r)
	head := Head{}
	head.NextJokeId = GetNextJokeId()

	head.LoginTag = `<a href="/login">LOGIN</a>`
	if post.Login {
		head.LoginTag = `<a href="/logout">LOGOUT</a>&nbsp; &nbsp; <a href="/api/edit/0"> NEW POST</a>`
	}

	tmpl.ExecuteTemplate(w, "Header", head)
	tmpl.ExecuteTemplate(w, "Show", post)
	tmpl.ExecuteTemplate(w, "Footer", BuildTags(true))
	defer db.Close()
}

/**
**func Edit(w http.ResponseWriter, r \*http.Request)**
Edit - the dialog form to create/modify/delete a post
*/
func Edit(w http.ResponseWriter, r *http.Request) {
	db := dbConn()
	vars := mux.Vars(r)
	nId := vars["id"]
	selDB, err := db.Query("SELECT * FROM Posts WHERE id=?", nId)
	if err != nil {
		panic(err.Error())
	}
	post := Post{}
	for selDB.Next() {
		var id, crass, pithy int
		var title, body, tags, url, author string
		err = selDB.Scan(&id, &title, &body, &tags, &url, &crass, &pithy, &author)
		if err != nil {
			panic(err.Error())
		}
		post.Id = id
		post.Title = title
		post.Body = body
		post.Tags = tags
		post.Url = url
		post.Crass = crass
		post.Pithy = pithy
		post.Author = author
		post.Bgc = "#eeeecc"

		if _, err := os.Stat("./images/" + strconv.Itoa(id) + ".jpg"); !os.IsNotExist(err) {
			post.Image = true
		}
	}
	var splits = strings.Split(BuildTags(false), ",")
	post.Tlu = `<SELECT onchange="copyTag();" NAME="myTags">`
	for _, value := range splits {
		post.Tlu = post.Tlu + `<OPTION VALUE="` + value + `">` + value
	}
	post.Tlu = post.Tlu + `</SELECT>`
	tmpl.ExecuteTemplate(w, "Edit", post)
	tmpl.ExecuteTemplate(w, "Footer", BuildTags(true))
	defer db.Close()
}

/**
**func Posting(w http.ResponseWriter, r \*http.Request)**
Posting - processes the form data to create/modify/delete a post
*/
func Posting(w http.ResponseWriter, r *http.Request) {
	db := dbConn()
	if r.Method == "POST" {
		id := r.FormValue("id")
		title := r.FormValue("title")
		url := r.FormValue("url")
		body := r.FormValue("body")
		crass := r.FormValue("crass")
		pithy := r.FormValue("pithy")
		tags := r.FormValue("tags")

		log.Println("button " + r.FormValue("button"))

		if r.FormValue("button") == "delete" {
			delForm, err := db.Prepare("DELETE FROM Posts WHERE id=?")
			if err != nil {
				panic(err.Error())
			}
			delForm.Exec(id)
			log.Println("DELETE id " + id)

			_ = os.Remove("./images/" + id + ".jpg")
		} else {
			if id == "0" {
				insForm, err := db.Prepare("INSERT INTO Posts (title, url, body, crass, pithy, tags) VALUES(?,?,?,?,?,?)")
				if err != nil {
					panic(err.Error())
				}
				insForm.Exec(title, url, body, crass, pithy, tags)
				log.Println("INSERT: title: " + title)
				//
				selDB, err := db.Query(`select last_insert_rowid()`)
				if err != nil {
					panic(err.Error())
				}
				for selDB.Next() {
					err = selDB.Scan(&id)
				}
				log.Println("last_insert_rowid " + id)
			} else {
				insForm, err := db.Prepare("UPDATE Posts SET title=?, url=?, body=?, crass=?, pithy=?, tags=? WHERE id=?")
				if err != nil {
					panic(err.Error())
				}
				insForm.Exec(title, url, body, crass, pithy, tags, id)
				log.Println("UPDATE: id " + id + " title: " + title)
			}

			// handle image

			r.ParseMultipartForm(32 << 20)
			file, handler, err := r.FormFile("foo")
			if err == nil { // there is a file
				defer file.Close()
				//log.Println(handler.Header)

				f, err := os.OpenFile("./images/"+id+".jpg", os.O_WRONLY|os.O_CREATE, 0666)
				if err != nil {
					fmt.Println(err)
					return
				}
				defer f.Close()
				var opt jpeg.Options
				opt.Quality = 80
				switch handler.Header["Content-Type"][0] {
				case "image/jpeg":
					log.Println("jpg")
					io.Copy(f, file)
				case "image/png":
					log.Println("png")
					imgSrc, _ := png.Decode(file)
					jpeg.Encode(f, imgSrc, &opt)
				case "image/gif":
					log.Println("gif")
					imgSrc, _ := gif.Decode(file)
					jpeg.Encode(f, imgSrc, &opt)
				default:
					log.Println("other image format")
				}

			} else {
				log.Println("no file upload")
				fmt.Println(err)
			}
		} // insert or update
	} // post method
	defer db.Close()
	http.Redirect(w, r, "/", 301)
}

/**
**func Crass(w http.ResponseWriter, r \*http.Request)**
Crass increments the crass score of the blog post
*/
func Crass(w http.ResponseWriter, r *http.Request) {
	db := dbConn()
	vars := mux.Vars(r)
	nId := vars["id"]
	insForm, err := db.Prepare("update posts set crass = crass+1 WHERE id=?")
	if err != nil {
		panic(err.Error())
	}
	insForm.Exec(nId)

	defer db.Close()
	http.Redirect(w, r, "/#"+nId, 301)
}

/**
**func Pithy(w http.ResponseWriter, r \*http.Request)**
Pithy increments the pithy score of the blog post
*/
func Pithy(w http.ResponseWriter, r *http.Request) {
	db := dbConn()
	vars := mux.Vars(r)
	nId := vars["id"]
	insForm, err := db.Prepare("update posts set pithy = pithy+1 WHERE id=?")
	if err != nil {
		panic(err.Error())
	}
	insForm.Exec(nId)

	defer db.Close()
	http.Redirect(w, r, "/#"+nId, 301)
}

/**
**func NextJoke(w http.ResponseWriter, r \*http.Request)**
NextJoke generates the data for the html message overlay
*/
func NextJoke(w http.ResponseWriter, r *http.Request) {
	db := dbConn()
	vars := mux.Vars(r)
	nId := vars["id"]
	selDB, err := db.Query("SELECT id, text FROM jokes WHERE id=?", nId)
	if err != nil {
		panic(err.Error())
	}
	joke := Joke{}

	for selDB.Next() {
		var id, previousId int
		var text string
		err = selDB.Scan(&id, &text)
		joke.Text = text

		previousId = id - 1
		if previousId > 0 {
			joke.Buttons = `<td width=50% align="center"><a class="taglink" href="/">ENOUGH</a>
			</td><td align="center">
			<a class="taglink" href="/api/nextjoke/` + strconv.Itoa(previousId) + `">MORE</a></td>`
		} else {
			joke.Buttons = `<td align="center"><a class="taglink" href="/"> NO MORE </a></td>`
		}
	}
	defer db.Close()
	log.Println("NextJoke")
	log.Println(joke)
	tmpl.ExecuteTemplate(w, "Joke", joke)
}

/**
**func JsonLine(w http.ResponseWriter, r \*http.Request)**
JsonLine serves the data needed when the user clicks on an advert
*/
func JsonLine(w http.ResponseWriter, r *http.Request) {
	db := dbConn()
	nId := mux.Vars(r)["id"]
	selDB, err := db.Query("SELECT id, part2 FROM oneliners WHERE id=?", nId)
	if err != nil {
		panic(err.Error())
	}
	type jsonLine struct {
		Id   string `json:"id"`
		Text string `json:"text"`
	}
	myline := jsonLine{}
	for selDB.Next() {
		var id, text string
		err = selDB.Scan(&id, &text)
		myline.Id = id

		if strings.HasSuffix(text, "html") || strings.HasSuffix(text, "mp4") || strings.HasSuffix(text, "pdf") || strings.HasSuffix(text, "jpg") || strings.HasPrefix(text, "https") {
			myline.Text = text
		} else {
			myline.Text = "<h2>" + text + "</h2>"
		}
	}
	defer db.Close()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(myline)
}

/**
**func DeleteImage(w http.ResponseWriter, r \*http.Request)**
You may delete an image while keeping the post itself
*/
func DeleteImage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var err = os.Remove("./images/" + id + ".jpg")
	if err != nil {
		fmt.Println(err)
	} else {
		log.Println("/images/" + id + ".jpg deleted")
	}
	http.Redirect(w, r, "/api/view/"+id, 301)
}

/**
**func Login(w http.ResponseWriter, r \*http.Request)**
Login displays the login form dialog
*/
func Login(w http.ResponseWriter, r *http.Request) {
	tmpl.ExecuteTemplate(w, "Login", "welcome")
}

/**
**func UserLogsIn(w http.ResponseWriter, r \*http.Request)**
UserLogsIn creates a session **more work here** if user credentials fail
*/
func UserLogsIn(w http.ResponseWriter, r *http.Request) {
	username := r.FormValue("username")
	password := r.FormValue("password")
	setSession(username, password, w)
	log.Println("logging in " + username + " / " + password)
	http.Redirect(w, r, "/", 302)
}

func UserLogsOut(w http.ResponseWriter, r *http.Request) {
	clearSession(w)
	log.Println("logging out")
	http.Redirect(w, r, "/", 302)
}

// Exists reports whether the named file or directory exists.
func Exists(name string) bool {
	if _, err := os.Stat(name); err != nil {
		if os.IsNotExist(err) {
			fmt.Println(name + " is missing")
			return false
		}
	}
	return true
}

/**
**func main()**
main is the entry point which holds dispatches for all the url routes
*/
func main() {
	// check our assets exists
	if Exists("./CorP.sqlite") && Exists("./images") && Exists("./form") {
		tmpl = template.Must(template.ParseGlob("form/*"))
		var port = ":8080"
		fmt.Println("Server listening on http://localhost" + port)
		router := mux.NewRouter().StrictSlash(true)
		router.PathPrefix("/images/").Handler(http.StripPrefix("/images/", http.FileServer(http.Dir("images/"))))
		router.HandleFunc("/", Index).Methods("GET")
		router.HandleFunc("/api/view/{id}", Show).Methods("GET")
		router.HandleFunc("/tag/{tag}", Index).Methods("GET")
		router.HandleFunc("/api/edit/{id}", Edit).Methods("GET")
		router.HandleFunc("/api/crass/{id}", Crass).Methods("GET")
		router.HandleFunc("/api/pithy/{id}", Pithy).Methods("GET")
		router.HandleFunc("/api/sort/{score}", Sort).Methods("GET")
		router.HandleFunc("/api/nextjoke/{id}", NextJoke).Methods("GET")
		router.HandleFunc("/api/line/{id}", JsonLine).Methods("GET")
		router.HandleFunc("/api/edit", Posting).Methods("POST")
		router.HandleFunc("/api/delimg/{id}", DeleteImage).Methods("GET")
		router.HandleFunc("/logout", UserLogsOut).Methods("GET")
		router.HandleFunc("/login", Login).Methods("GET")
		router.HandleFunc("/login", UserLogsIn).Methods("POST")

		http.Handle("/", router)
		log.Fatal(http.ListenAndServe(port, router))
	}
}
