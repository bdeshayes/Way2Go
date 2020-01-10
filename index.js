//##################################################
//#                                                #
//# CrassOrPithy                                   #
//#                                                #
//##################################################

/*
23 Oct 2019 - all local media - heroku blocks it - in fact should keep no more than 100 posts

10 Nov 2019 - support for png, bmp, tiff, gif via jimp
22 Nov 2019 - shuffle only 50 articles
28 Nov 2019 - change click / tap text according to media
might be an issue with nodemon and login/logout
*/

const fs = require('fs');
var Jimp = require('jimp');
var postcount = 0;
const title = 'crass or pithy?';
let myENV = process.env.NODE_ENV; // process.argv[2]; // process.env.NODE_ENV=production

var myStyle =
`
/*
universal selector 
class selector     . (to target a group of elements
id selector        # (to target a unique html element)
*/

#overlay {
    position: fixed;
    display: none;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.75);
    z-index: 2;
    cursor: pointer;
}

#message{
    position: absolute;
    top: 50%;
    left: 50%;
   transform: translate(-50%,-50%);
    -ms-transform: translate(-50%,-50%);
 	line-height: 120%;
	
	font-family: arial;
    color: white;
	/*font-size: 3vw;
	width: 70vw;
    height: 70vh;
    margin: 15vh auto;*/
}

#Schlumpf {
    font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 100%;
}
#Schlumpf div {
    margin: auto;
    width: 50%;
    text-align: center;
    border: 3px solid green;
    padding: 10px;
}
#tablehead {
    margin: auto;
    width: 50%;
    text-align: center;
}
#Schlumpf table {
    margin: auto;
    width: auto;
    padding: 10px;
} 
#Schlumpf td, #Schlumpf th {
    border: 1px solid #ddd;
    padding: 8px;
}

#Schlumpf tr:nth-child(even){background-color: #f2f2f2;}

#Schlumpf tr:hover {background-color: #dddddd;}

#Schlumpf th {
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: left;
    background-color: #4CAF50;
    color: white;
}

#content a, .menu a:link, .menu a:active, .menu a:visited 
{
text-decoration: none;
}
#content a:hover 
{
background-color: black;
color: white;
}
.nav 
{
text-align: center;
margin: 10px 10px;
padding-top: 8px;
padding-bottom: 10px;
padding-left: 8px;
background: none;
}

.nav li 
{
list-style-type: none;
display: inline;
padding: 10px 30px;
background-color: #e67e22;
margin-left: -11px;
font-size: 120%;
}

.nav li:first-child
{
margin-left: 0;
border-top-left-radius: 10px !important;
border-bottom-left-radius: 10px !important;
}

.nav li:last-child
{
margin-right: 0px;
border-top-right-radius: 10px !important;
border-bottom-right-radius: 10px !important;
}

.nav a, .menu a:link, .menu a:active, .menu a:visited 
{
text-decoration: none;
color: white;
border-bottom: 0;
padding: 10px 10px;
}

.nav a:hover 
{
text-decoration: none;
background: #9b59b6;
padding: 10px 10px;
}

ul.nav li a.current 
{
text-decoration: none;
background: #e74c3c;
padding: 10px 10px;
}

@media only screen and (orientation:landscape) 
{
.mouse:before
{
    content: 'click';
}

.postimage
{
margin: 15px;
float: right;
width: 200px;
}

.logo
{
width: 200px;
}
#message
{
font-size: 130%;
}

}

@media only screen and (orientation:portrait) 
{
.mouse:before
{
    content: 'tap';
}
	
.postimage
{
margin: 15px;
width: 100%;
}

.logo
{
width: 75%;
}

#message, #footer, .crass, .pithy, p, h2
{
font-size: 120%;
}

}

#footer
{
padding-top: 12px;
padding-bottom: 12px;
text-align: center;
background-color: cyan;
color: white;
font-family: arial;
font-weight: bold;
}

#footer a, .taglink
{
font-family: arial;
  background-color: #4a90e2;
  color: white;
  line-height: 1.5;
  text-decoration: none;
  padding: 2px 6px 2px 6px;
  border-radius: 2px;
}

.numberCircle {
  display:inline-block;
  line-height:0px;

  border-radius:50%;
  border:2px solid;

  font-size:32px;
}

.numberCircle span {
  display:inline-block;

  padding-top:50%;
  padding-bottom:50%;

  margin-left:8px;
  margin-right:8px;
}
.heading
{
/*width: 400px;*/
font-family: arial;
border: 10px solid black;
 box-sizing: border-box;
}
.crass {
font-family: arial;
  background-color: #4a90e2;
  color: white;
  text-decoration: none;
  padding: 2px 46px 2px 6px;
  position: relative;
  display: inline-block;
  border-radius: 2px;
}
.pithy {
font-family: arial;
  background-color: #f5a623;
  color: white;
  text-decoration: none;
  padding: 2px 46px 2px 6px;
  position: relative;
  display: inline-block;
  border-radius: 2px;
}

.notification:hover {
  background: red;
}

.crass .badge {
  position: absolute;
  top: -10px;
  right: -10px;
  padding: 5px 10px;
  border-radius: 50%;
  background: #4a4a4a;
  color: white;
}
.pithy .badge {
  position: absolute;
  top: -10px;
  right: -10px;
  padding: 5px 10px;
  border-radius: 50%;
  background: #4a4a4a;
  color: white;
}

.crass .badge span {
  display:inline-block;

  padding-top:50%;
  padding-bottom:50%;

  margin-left:8px;
  margin-right:8px;
}
.pithy .badge span {
  display:inline-block;

  padding-top:50%;
  padding-bottom:50%;

  margin-left:8px;
  margin-right:8px;
}

`;

//##################################################
//#                                                #
//# DoHeader                                       #
//#                                                #
//##################################################

function DoHeader(myTitle, jokesarray, req)
{
var logintag = '';
var nextjokeId = 1;

if (myENV !== "production")
	{
	if (req.cookies.username !== undefined) // logging out
		logintag = '<a href="/api/login">LOGOUT</a>';
	else
		logintag = '<a href="/api/login">LOGIN</a>';
	}
else
	logintag = '<span class="mouse"></span> on Daffy for super jokes';
	
if (jokesarray != null)
	nextjokeId = jokesarray.length;

return `
<center>
<div id="tablehead"><a title="click on Daffy for some stupendeous jokes" href="/api/nextjoke/${nextjokeId}"><img class="logo" style="width: 25vw" src="/images/daffy.jpg" /></a></div>
<small>${logintag}</small>
<h1>
${myTitle}
</h1>
</center>
`;
}

//##################################################
//#                                                #
//# DoFooter                                       #
//#                                                #
//##################################################

async function DoFooter()
{
try
	{
	const db = await dbPromise;
	const [posts] = await Promise.all([
	  db.all(`SELECT tags FROM posts`),
	]);

	var mytags = [];
	posts.forEach((post) => 
		{
		if ((post.tags !== undefined) && (post.tags !== ''))
			{
			var posttags = post.tags.split(",");
			posttags.forEach((thistag) => 
				{
				mytags.push(thistag);
				});
			}
		});

let unique = [...new Set(mytags)];
unique.sort();

var retval = `<div id="footer">`;

retval += `<a href="/">all</a> &nbsp; `;
unique.forEach((tag) => 			
	{
	retval += `<a href="/tag/${tag}">${tag}</a> &nbsp; `;
	});
		
	} 
catch (err) 
	{
	console.log(err);
	}

return retval + '</div>';
}

//##################################################
//#                                                #
//# RenderPage                                     #
//#                                                #
//##################################################

async function RenderPage(content, jokesarray, req)
{
var footer='';

// *** if the length of jokesarray is one then force the overlay with that one joke
// also the more button should scroll backwards thru the jokes array rather than being random

footer = await DoFooter();

var mytitle = 
`
<!--<div style="display: table; width: auto; padding: 5px 5px; border: 10px solid black;">
<div style="text-align: center; font: 900 1.8vw/2vw arial, sans-serif;">THE</div>
<div style="font: 900 2.5vw/3vw arial, sans-serif;">DAILY DUMB</div>
</div>-->

<h1 style="font-family: arial">
<a title="sort by dumbest" class="crass" href="/api/sort/crass">&#x1f641; crass</a>
<!-- <span class="numberCircle"><span>30</span></span>--> or 
<a title="sort by smartest" class="pithy" href="/api/sort/pithy">&#x1f642; pithy</a>?
</h1>`;

if (req.cookies.username !== undefined)
	{
	mytitle += `<a href="/api/add">Add new post</a><br /><br />`;
	mytitle += `${postcount} posts<br />`;
	}

//
var byline =
`<p style="text-align: center; border-radius: 25px; background: wheat; padding: 20px;">
<i>We have gathered here a sample of the most insane news articles we could find.<br />
You are invited to vote your appreciation by clicking either the crass or pithy buttons.</i>
</p>
`;
	
const header = DoHeader(mytitle, jokesarray, req);
	
var html =
`
<!DOCTYPE html>
<html>
<head>
<title>${title}</title>
<link rel="icon" href="/images/favicon.ico">
<!-- now we can put cryptic html comments in the server page. -->

<!-- Artificial intelligence is no match for natural stupidity. -->

<style>
${myStyle}
</style>

</head>

<body>
<div id="overlay" onclick="off();">
<div id="message">hello
</div> 
</div>

<script>
function copyTag ()
{
var x=document.myform.myTags.selectedIndex;
var y=document.myform.myTags.options;
 console.log("Index: " + y[x].index + " is " + y[x].text); 

if (document.myform.tags.value == '')
	document.myform.tags.value = y[x].text;
else
	document.myform.tags.value = document.myform.tags.value + ',' + y[x].text;
}

function off() 
{
document.getElementById("overlay").style.display = "none";
}

function fakead(url)
{	
fetch(url)
  .then(function(response) {
    return response.json();
  })
  .then(function(msg) 
  {
	if (msg.text.match(/html$/) || msg.text.match(/mp4$/) || msg.text.match(/pdf$/) || msg.text.match(/jpg$/) || msg.text.match(/^http/))
		window.location.href = msg.text;
	else
		{
		if (msg.text.match(/<table>/))
			document.getElementById("overlay").onclick = null; 

		if (msg.text.match(/<h2>/))
		document.getElementById("message").style.lineHeight = "200%";
		
		document.getElementById("message").innerHTML = msg.text; 
		document.getElementById("overlay").style.display = "block";
		}
  });
}
</script>

${header}
${byline}
<br />
${footer}
${content}
${footer}
</body>
</html>
`;
return html;
}

//##################################################
//#                                                #
//# AdGenerator                                    #
//#                                                #
//##################################################
var products = ['crasso-pétoire', 'dongo-flippo', 'fancy-gadget', 'glaring-implement', 'schwonk-blat'];

function AdGenerator (index)
{
var topics =
[
{'subject': 'wife is moody unsatisfied or bored', 'action': 'her amused'},
{'subject': 'woman is unattractive, dopey or whinging', 'action': 'her enchanted'},
{'subject': 'husband is sloppy rude or detached', 'action': 'him occupied'},
{'subject': 'man is disinterested, looking away or never home', 'action': 'him captivated'},
{'subject': 'boss is demanding, unforgiving or yelling', 'action': 'him busy'},
{'subject': 'dog is barking, digging or growling', 'action': 'it wagging its tail'},
{'subject': 'cat is chasing birds, scratching furniture, or meowing', 'action': 'it purring'},
{'subject': 'pet is unconcious, asleep or hiding', 'action': 'it singing'}
];
var times = ['hours', 'days', 'weeks', 'months', 'moments on end', 'a long time'];

var id1 = Math.floor((Math.random() * topics.length));
var id2 = Math.floor((Math.random() * products.length));
var id3 = Math.floor((Math.random() * times.length));

return `<div onclick="fakead('/api/text/${id2}')" style="cursor: pointer; border-style: dashed; font-family: arial; font-size: 2vw; text-align: center;">If your ${topics[id1].subject}<br />the <span style="color: red; background-color: yellow; border: 2px solid red;">${products[id2]}</span> will keep ${topics[id1].action} for ${times[id3]}.<br />Click here for details</div><br />`;

/*const [recordCount] = await Promise.all([
  db.get('SELECT COUNT(*) AS n FROM oneliners'),
]);
console.log(recordCount);
var m = Math.floor(Math.random() * Math.floor(recordCount.n-1));
			
const [record] = await Promise.all([
  db.get(`SELECT * FROM oneliners LIMIT 1 OFFSET ${m}`),
]);

return `<div onclick="fakead(${record.id})" style="cursor: pointer; border-style: dashed; font-family: arial; font-size: 2vw; text-align: center;">${record.msg}</div>`;
*/
}

//##################################################
//#                                                #
//# AdGenerator2                                   #
//#                                                #
//##################################################

var usedAds = [];

function AdGenerator2 (adsarray)
{
var msg = '', id = 1; // array is zero based while sql table starts at id = 1
do
{
if (usedAds.length == 0) // force gospel video to be first - guide to the end times up front
	{
	id = 1; // id = 5;
	//console.log ('AdGenerator2 forcing id='+id+' '+adsarray[id].msg);
	}
else if (usedAds.length == 1) // force gospel video to be first - guide to the end times up front
	{
	id = 5;
	//console.log ('AdGenerator2 forcing id='+id+' '+adsarray[id].msg);
	}
else
	id = Math.floor((Math.random() * adsarray.length));
//console.log ('AdGenerator2 checking id='+id);
//console.log(usedAds);
//console.log(adsarray);
//console.log ('check returns '+usedAds.includes(id));
if (adsarray.length == usedAds.length) // all used up - start again
	usedAds = [];
}
while (usedAds.includes(id)); // that id is not in there - get it
usedAds.push(id);	

if ((!adsarray[id].msg.match(/</)) && (!adsarray[id].msg.match(/>/)))
	msg = adsarray[id].msg.replace(/\n/g, "<br />");
else
	msg = adsarray[id].msg;

msg = msg.replace(/click/gi, '<span class="mouse"></span>');

return `<div onclick="fakead('/api/line/${adsarray[id].id}')" style="cursor: pointer; border-style: dashed; font-family: arial; font-size: 120%; text-align: center;">${msg}</div><br />`;
}

//##################################################
//#                                                #
//# shuffle                                        #
//#                                                #
//##################################################

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

//##################################################
//#                                                #
//# RenderPosts                                    #
//#                                                #
//##################################################

function RenderPosts (postarray, adsarray, req)
{
html = '<br />';
var i = 0;
var bgc = '';
usedAds = []; // reset it
var BreakException = {};

if (req.cookies.username === undefined)
	shuffle (postarray);

try
	{
	postarray.forEach((post) => 
		{
		if ((i == 50) && (req.cookies.username === undefined)) throw BreakException;
		
		if ((i % 3) == 0)
			html += AdGenerator2(adsarray);

		if ((i % 2) == 0)
			bgc = "#eeeecc";
		else
			bgc = "#cceeee";
		
		html += `<a id="${post.id}"></a>`;
		html += `<div style="background-color: ${bgc}; overflow: auto; border-radius: 25px; padding: 20px;"><h2 style="font-family: arial; ">`;
		//html += `<span class="crass" ><a title="vote it as crass" href="/api/crass/${post.id}" class="dumb"><span>&#x1f641; crass</span><span class="badge">${post.crass}</span></a>`;
		html += `<a href="/api/crass/${post.id}" class="crass"><span>&#x1f641; crass</span><span class="badge">${post.crass}</span></a>`;
		html += `&nbsp; &nbsp;`;
		//html += `<span class="pithy"><a title="vote it as pithy"><span>&#x1f642; pithy</span><span class="badge">${post.pithy}</span></a>\n`;
		html += `<a href="/api/pithy/${post.id}" class="pithy"><span>&#x1f642; pithy</span><span class="badge">${post.pithy}</span></a>`;

		if (req.cookies.username !== undefined)
			html += `&nbsp; &nbsp; <a style="font-family: arial; text-decoration: none; background-color: #00FF00; color: #FFFFFF; font-size: 120%; padding: 2px 6px 2px 6px;" href="/api/edit/${post.id}">edit</a>`;
		
		html += `&nbsp; &nbsp; ${post.title}</h2>\n`;

		if (fs.existsSync(`./images/${post.id}.jpg`))
			html += `<img class="postimage" src="/images/${post.id}.jpg" />`;
		//html += `</h2>`;
		var mybody = post.body.replace(/\n/g, "<br />");
		if (req.params.id == undefined)
			mybody = mybody.replace(/<!--more-->.*$/s, `<br /><a href="/api/view/${post.id}">view more</a>`);
		else
			mybody += '<br /><br /><a href="/">view all posts</a>';
		
		html += `<p style="font-family: times">`;
		if ((post.url !== null) && (post.url !== ''))
			html += `<a target="_blank" href="${post.url}">source</a> &nbsp; `;

		html += `${mybody}</p>`;
		
		var mytags = post.tags.split(",");
		mytags.forEach((tag) => 
			{
			if (tag !== '')
				html += `<a class="taglink" href="/tag/${tag}">${tag}</a> &nbsp; `;
			});
		html += `</div><br />\n`;
		
		i = i + 1;
		});
	} 
catch (e) 
	{
	if (e !== BreakException) throw e;
	}

postcount = i;
return html;
}

var cors = require('cors')
var express = require("express");
const path = require('path');
var sqlite = require("sqlite");
var ejs = require("ejs");

const app = express();

app.use(cors());

const dbPromise = sqlite.open(path.join(__dirname + '/CorP.sqlite'), { Promise });

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session      = require('express-session');
const escape_quotes = require('escape-quotes');
const fileUpload = require('express-fileupload');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(fileUpload());
app.use(cookieParser()); 

/*  PASSPORT SETUP  */

const passport = require('passport');

app.use(passport.initialize());

app.get('/api/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
    cb(err, user);
  });
});

app.use(passport.initialize());

app.get('/api/login', async (req, res, next) => {
   const myform = `
    <form action="/api/login" method="post">
	<div id="tablehead">
        <label>Username:</label>
        <input type="text" name="username" />
        <br/>
         <label>Password:</label>
        <input type="password" name="password" />
        <br />
		<input type="submit" value="Submit" />
      </div>
    </form>
    `;
	console.log('/api/login');
	//console.log(JSON.stringify(req.cookies));
	res.clearCookie('username');
	res.clearCookie('password');
	if (req.cookies.username !== undefined) // logging out
		{
		console.log(req.cookies.username+' logging out');
		res.redirect(`/`);
		}
	else
		res.send(await RenderPage(myform, null, req));
});

app.post('/api/login', 
  passport.authenticate('local', { failureRedirect: '/api/error' }),
  function(req, res) {
	res.cookie('username', req.body.username);
	res.cookie('password', req.body.password);
	res.redirect('/');
  });

const LocalStrategy = require('passport-local').Strategy;
var passwordHash = require('password-hash');

passport.use(new LocalStrategy(
  function(username, password, done) 
	{
	//console.log('logging in with '+username+' pwd '+ password);
	if (username === 'daffy')
		{
		var hashedPassword = 'sha1$a1792b4b$1$ac24871942097442e95b456511e2634c213da4a7';
		
		if (passwordHash.verify (password, hashedPassword))
			return done(null, true);
		else
			return done(null, false);
		}
	}
));

app.get('/', async (req, res, next) => {
	
const db = await dbPromise;
try 
	{
	const [posts] = await Promise.all([ db.all('SELECT * FROM posts order by id desc') ]);
	const [ads] = await Promise.all([ db.all('SELECT * FROM oneliners order by id asc') ]);
	const [jokes] = await Promise.all([ db.all('SELECT * FROM jokes') ]);

	res.send(await RenderPage(RenderPosts(posts, ads, req), jokes, req));
	} 
catch (err) 
	{
	next(err);
	}	
});

app.get('/tag/:tag', async (req, res, next) => {
	
const db = await dbPromise;
try 
	{
	const [posts] = await Promise.all([ db.all(`SELECT * FROM posts where tags like '%${req.params.tag}%' order by id desc`) ]);

	const [ads] = await Promise.all([ db.all('SELECT * FROM oneliners') ]);
	const [jokes] = await Promise.all([ db.all('SELECT * FROM jokes') ]);

	res.send(await RenderPage(RenderPosts(posts, ads, req), jokes, req));
	} 
catch (err) 
	{
	next(err);
	}	
});

app.get('/api/view/:id', async (req, res, next) => {
	
const db = await dbPromise;
try 
	{
	const [posts] = await Promise.all([ db.all(`SELECT * FROM posts where id = ${req.params.id}`) ]);

	const [ads] = await Promise.all([ db.all('SELECT * FROM oneliners') ]);
	const [jokes] = await Promise.all([ db.all('SELECT * FROM jokes') ]);

	res.send(await RenderPage(RenderPosts(posts, ads, req), jokes, req));
	} 
catch (err) 
	{
	next(err);
	}	
});

app.get('/api/text/:id', async (req, res, next) => {
	
console.log ('/api/text/'+req.params.id);
const db = await dbPromise;
try 
	{
	var product = products[req.params.id];
	var msg = {'id': req.params.id, 'text': `You really had to click that, huh?<br /><br />After fake news we now have fake ads that promise wonders but deliver nothing! Sorry there is no<br /><span style="color: red; background-color: yellow; border: 2px solid red;">${product}</span> here.`};

	res.send(msg);
	} 
catch (err) 
	{
	next(err);
	}	
});

app.get('/api/line/:id', async (req, res, next) => {
	
console.log ('/api/line/'+req.params.id);
const db = await dbPromise;
try 
	{
	const [ad] = await Promise.all([ db.get(`SELECT * FROM oneliners where id = ${req.params.id}`) ]);
	var msg = null;
	console.log('sending '+ad.part2);
	
	if (ad.part2.match(/html$/) || ad.part2.match(/mp4$/) || ad.part2.match(/pdf$/) || ad.part2.match(/jpg$/) || ad.part2.match(/^https/))
		msg = {'id': req.params.id, 'text': ad.part2};
	else
		msg = {'id': req.params.id, 'text': '<h2>'+ad.part2+'</h2>'};

	res.send(msg);
	} 
catch (err) 
	{
	next(err);
	}	
});

app.get('/api/nextjoke/:id', async (req, res, next) => {
if (req.params.id == undefined)
	req.params.id = 1;

	
var previousId = req.params.id -1;
var buttons = '';

console.log ('/api/nextjoke/'+req.params.id);
const db = await dbPromise;
try 
	{
	const [joke] = await Promise.all([ db.get(`SELECT * FROM jokes where id = ${req.params.id}`) ]);
	
	console.log('sending '+joke.text);

	if (previousId > 0)
		buttons =`
	<td width=50% align="center"><a class="taglink" href="/">ENOUGH</a></td><td align="center"><a class="taglink" href="/api/nextjoke/${previousId}">MORE</a></td>
	`;
	else
		buttons =`<td align="center"><a class="taglink" href="/"> NO MORE</a></td>`;
		
	
	const html = `
<!DOCTYPE html>
<html>
<head>
<title>Joke</title>

<style>
#overlay {
    position: fixed;
    display: block;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.75);
    z-index: 2;
    cursor: pointer;
}

#message{
    position: absolute;
    top: 50%;
    left: 50%;
   transform: translate(-50%,-50%);
    -ms-transform: translate(-50%,-50%);
 	line-height: 120%;
	
	font-family: arial;
    color: white;
}

.taglink
{
font-family: arial;
  background-color: #4a90e2;
  color: white;
  line-height: 1.5;
  text-decoration: none;
  padding: 2px 6px 2px 6px;
  border-radius: 2px;
}


@media only screen and (orientation:portrait) 
{

#message
{
font-size: 180%;
}

}

</style>

</head>

<body>
<div id="overlay">
<div id="message">

<table border=0 width=100% height=100%>
<tr width=80%>
<td height=70% align="center" colspan=2 style="color: white; line-height: 200%"><h2>${joke.text}</h2></td>
</tr>
<tr>
${buttons}
</tr>
</table>

</div> 
</div>

</body>
</html>
`;
	res.send(html);
	} 
catch (err) 
	{
	next(err);
	}	
});
//

app.get('/api/joke/:id', async (req, res, next) => {
var previousId = req.params.id - 1;
console.log ('/api/joke/'+req.params.id);
const db = await dbPromise;
try 
	{
	const [joke] = await Promise.all([ db.get(`SELECT * FROM jokes where id = ${req.params.id}`) ]);
	
	console.log('sending '+joke.text);
	
	var theJoke = `
	<table border=0 width=100% height=100%>
<tr width=80%>
<td height=70% align="center" colspan=2 style="color: white; line-height: 200%"><h2>${joke.text}</h2></td>
</tr>
<tr>
<td width=50% align="center"><a class="taglink" href="/">ENOUGH</a></td><td align="center"><a class="taglink" href="/api/nextjoke/${previousId}">MORE</a></td>
</tr>
</table>`;

	var msg = {'id': req.params.id, 'text': theJoke};

	res.send(msg);
	} 
catch (err) 
	{
	next(err);
	}	
});

app.get('/api/sort/:item', async (req, res, next) => {
	
const db = await dbPromise;
try 
	{
	const [posts] = await Promise.all([ db.all(`SELECT * FROM posts order by ${req.params.item} desc`) ]);

	const [ads] = await Promise.all([ db.all('SELECT * FROM oneliners') ]);
	const [jokes] = await Promise.all([ db.all('SELECT * FROM jokes') ]);

	res.send(await RenderPage(RenderPosts(posts, ads, req), jokes, req));
	} 
catch (err) 
	{
	next(err);
	}	
});

app.get('/api/crass/:id', async (req, res, next) => 
{
const db = await dbPromise;
try 
	{
	const [record] = await Promise.all([
	  db.all(`update posts set crass = crass+1 where id = '${req.params.id}'`),
	]);
	res.redirect(`/#${req.params.id}`);
	} 
catch (err) 
	{
	next(err);
	}
});

app.get('/api/pithy/:id', async (req, res, next) => 
{
const db = await dbPromise;
try 
	{
	const [record] = await Promise.all([
	  db.all(`update posts set pithy = pithy+1 where id = '${req.params.id}'`),
	]);
	res.redirect(`/#${req.params.id}`);
	} 
catch (err) 
	{
	next(err);
	}
});

app.get('/api/delete/:post', async (req, res, next) => {
if ((myENV !== "production") || (req.cookies.username !== undefined))
	{
	try 
		{
		const db = await dbPromise;

		await db.all(`delete from posts where id = '${req.params.post}'`);

		console.log('delete post '+ req.params.post);
		try
			{
			fs.unlinkSync(`./images/${req.params.post}.jpg`);
			console.log(`./images/${req.params.post}.jpg deleted`);
			}
		catch
			{
			console.log(`./images/${req.params.post}.jpg not found`);
			}
		res.redirect(`/`);
		} 
	catch (err) 
		{
		next(err);
		}
	}
});

app.get('/api/add', async (req, res, next) => {
if ((myENV !== "production") || (req.cookies.username !== undefined))
	{
	const myform = `
    <form "fileupload" action="/api/add" method="post" enctype="multipart/form-data">
    <div  id="tablehead" >
	<h2>Adding a new post to crass or pithy</h2>
	<p>Upload an optional image file</p>
	<table id="Schlumpf">
	<tr><td>Title</td><td><input type="text" name="title" /></td></tr>
	<tr><td>URL</td><td><input type="text" name="url" /></td></tr>
	<tr><td>Body</td><td><textarea name="body" rows="7" cols="50"></textarea></td></tr>
	<tr><td>Tags</td><td><input type="text" name="tags" /></td></tr>
    <tr><td>*.jpg, png, bmp, tiff or gif</td><td><input type="file" name="foo" /></td></tr>
    <tr><td colspan=2><input type="submit" name="button" value="add new post" /></td></tr>
    </table></div></form>
    `;
	
	res.send(await RenderPage(myform, null, req));
	}
});

/*
app.get('/api/build', async (req, res, next) => {

var array = fs.readFileSync('jokes.txt').toString().split("\r\n"); // "\n" only if not MS Windows
var mytext = '';
const db = await dbPromise;
for (i in array) 
	{
	if (array[i] !== '')
		{		
		console.log(array[i]);
		mytext = mytext + array[i] + '<br />';
		var joke = array[i].replace(/'/g, "''");
		await db.all(`INSERT INTO jokes (text) VALUES ('${joke}')`);
		}
	}
	
res.send(await RenderPage(mytext, req));
});
*/

app.post('/api/add', async (req, res, next) => {
	res.set('gonzo', 'myENV ='+myENV+' req.cookies.username ='+req.cookies.username);
if (1) // ((myENV !== "production") || (req.cookies.username !== undefined))
	{
	try 
		{
		mytitle = req.body.title.replace(/'/g, "''"); //escape_quotes(req.body.title);
		mybody = req.body.body.replace(/'/g, "''"); //escape_quotes(req.body.body);
		var crass = Math.floor(Math.random() * Math.floor(100));
		var pithy = Math.floor(Math.random() * Math.floor(100));
		var tags = req.body.tags.replace(/'/g, "''");
		const db = await dbPromise;
		await db.all(`INSERT INTO posts (title, body, url, crass, pithy, tags, author) VALUES ('${mytitle}', '${mybody}', '${req.body.url}', ${crass}, ${pithy}, '${tags}', '${req.cookies.username}')`);

		const [record] = await Promise.all([
		  db.get(`SELECT * FROM posts order by id desc LIMIT 1`),
		]);
		
		var newID = record.id;

		if (req.files !== null)
			{
			let thefile = req.files.foo;
			let store = __dirname+path.sep+'images'+path.sep+newID+'.jpg';
			console.log(thefile.name);
			console.log(store);
			
			if (thefile.name.match(/jpg$/) == false)
				{	 
				// open a file called "lenna.png"
				Jimp.read(thefile, (err, lenna) => {
				  if (err) throw err;
				  lenna
				//	.resize(256, 256) // resize
					.quality(60) // set JPEG quality
				//	.greyscale() // set greyscale
					.write(store); // save
				});
				}
			else
				{
				thefile.mv(store, function(err) 
					{
					if (err)
					  return res.status(500).send(err);
					});
				}
			}
		res.redirect(`/`);
		} 
	catch (err) 
		{
		next(err);
		}
	}
});

app.get('/api/edit/:post', async (req, res, next) => {
if ((myENV !== "production") || (req.cookies.username !== undefined))
	{
	try
		{
		const db = await dbPromise;
		const [posts] = await Promise.all([
		  db.all(`SELECT tags FROM posts`),
		]);
 
		var mytags = [];
		posts.forEach((post) => 
			{
			if ((post.tags !== undefined) && (post.tags !== ''))
				{
				var posttags = post.tags.split(",");
				posttags.forEach((thistag) => 
					{
					mytags.push(thistag);
					});
				}
			});

		let unique = [...new Set(mytags)];
		unique.sort();

		let select = `<SELECT onchange="copyTag();" NAME="myTags">\n`;
							
		unique.forEach((tag) => 			
			{
			select += `<OPTION VALUE="${tag}">${tag}\n`;
			});
			
		select += `</SELECT>\n`;

		const [record] = await Promise.all([
		  db.get(`SELECT * FROM posts where id = ${req.params.post}`),
		]);

		var myform = `
		<form name="myform" action="/api/edit" method="post" enctype="multipart/form-data">
		<div  id="tablehead" >
		<h2>Editing a post with crass or pithy</h2>
		<input type="hidden" name="id" value="${req.params.post}"/>
		<table id="Schlumpf" border=1>
		<tr><td>Title</td><td><input type="text" name="title" size="70" value="${record.title}"/></td></tr>
		<tr><td>URL</td><td><input type="text" name="url" size="70" value="${record.url}"/></td></tr>
		<tr><td>Body</td><td><textarea name="body" rows="20" cols="50">${record.body}</textarea></td></tr>
		<tr><td>crass score</td><td><input type="text" name="crass" value="${record.crass}"/></td></tr>
		<tr><td>pithy score</td><td><input type="text" name="pithy" value="${record.pithy}"/></td></tr>
		<tr><td>tags</td><td><input type="text" name="tags" value="${record.tags}"/> ${select}</td></tr>
		<tr><td>*.jpg file upload</td><td><input type="file" name="foo" /></td></tr>`;
		if (fs.existsSync(`./images/${req.params.post}.jpg`))
			myform += `<tr><td colspan=2><a title="click on image to delete it" OnClick="return confirm('Are you sure you want to delete this image?');" href="/api/delimg/${req.params.post}"><img style="width: 200px" src="/images/${req.params.post}.jpg" /></a></td></tr>`;
		
		myform += `<tr><td colspan=2>
		<input type="submit" OnClick="return confirm('Are you sure you want to delete this post?');" name="button" value="delete" /> &nbsp; &nbsp;
		<input type="submit" name="button" value="save" /></td></tr>
		</table>
		</div></form>`;
		
		res.send(await RenderPage(myform, null, req));
		} 
	catch (err) 
		{
		next(err);
		}
	}
});

app.post('/api/edit', async (req, res, next) => {
if ((myENV !== "production") || (req.cookies.username !== undefined))
	{
	if (req.body.button === 'delete')
		{
		console.log ('deleting '+req.body.title);
		res.redirect(`/api/delete/${req.body.id}`);
		}
		
	if (req.body.button === 'save')
		{
		try 
			{
			mytitle = req.body.title.replace(/'/g, "''"); //escape_quotes(req.body.title);
			mybody = req.body.body.replace(/'/g, "''"); //escape_quotes(req.body.body);
			const db = await dbPromise;
			const [record] = await Promise.all([
				db.all(`update posts set title = '${mytitle}',
					 body = '${mybody}',
					 url = '${req.body.url}',
					 crass = ${req.body.crass},
					pithy = ${req.body.pithy},
					tags = '${req.body.tags}',
					author = '${req.cookies.username}' where id = ${req.body.id}`),
			]);
			
			if (req.files !== null)
				{
				let thefile = req.files.foo;
				let store = __dirname+path.sep+'images'+path.sep+req.body.id+'.jpg';
				console.log(store);

				if (thefile.name.match(/jpg$/) == false)
					{	 
					// open a file called "lenna.png"
					Jimp.read(thefile, (err, lenna) => {
					  if (err) throw err;
					  lenna
					//	.resize(256, 256) // resize
						.quality(60) // set JPEG quality
					//	.greyscale() // set greyscale
						.write(store); // save
					});
					}
				else
					{
					thefile.mv(store, function(err) 
						{
						if (err)
						  return res.status(500).send(err);
						});
					}
				}
				
			res.redirect(`/#${req.body.id}`);
			} 
		catch (err) 
			{
			next(err);
			}
		}
	}
});

app.get('/api/delimg/:post', async (req, res, next) => {
if ((myENV !== "production") || (req.cookies.username !== undefined))
	{
	try
		{
		var img = __dirname+path.sep+'images'+path.sep+req.params.post+'.jpg';
		fs.unlinkSync(img);
		console.log(img + ' deleted');
		}
	catch(err)
		{
		console.log(err);
		console.log(img + ' not found');
		}

	res.redirect(`/api/edit/${req.params.post}`);
	}
});

app.use('/images', express.static(__dirname + '/images'));

const port = process.env.PORT || 3000;
app.listen(port);

console.log(`CrassOrPithy listening on ${port}`);
