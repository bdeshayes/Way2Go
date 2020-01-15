
CrassOrPithy
============
This is a fully fledged webserver application written in node.js with express routing and SQLite database.
It is part of my **Way2Go** repository where we compare the **same app ported from node.js to golang**


**function DoHeader(myTitle, jokesarray, req)**  
This is a templating function to build the top of the webpage

**function DoFooter()**  
Generates html buttons for each unique tag across the whole blog

**async function RenderPage(content, jokesarray, req)**  
the main templating function for the webpage

**AdGenerator (adsarray)**  
inserts random adverts before each post

**function RenderPosts (postarray, adsarray, req)**  
templating function to build the html code for an individual post

**app.get('/api/login', async (req, res, next)**  
endpoint for user login - serves the html form

**app.post('/api/login',**  
endpoint for user login thru passport authentication
stores credentials in session cookies

**app.get('/', async (req, res, next)**  
homepage endpoint

**app.get('/tag/:tag', async (req, res, next)**  
displays blog posts for selected tag

**app.get('/api/view/:id', async (req, res, next)**  
displays a single post

**app.get('/api/line/:id', async (req, res, next)**  
endpoint to serve JSON data in response to the user clicking on an advert

**app.get('/api/nextjoke/:id', async (req, res, next)**  
serves the overlay message for jokes

**app.get('/api/sort/:item', async (req, res, next)**  
endpoint to display the blog ordered (typically by crass or pithy scores)

**app.get('/api/crass/:id', async (req, res, next)**  
endpoint to update the crass score

**app.get('/api/pithy/:id', async (req, res, next**  
endpoint to update the pithy score

**app.get('/api/delete/:post', async (req, res, next)**  
endpoint to delete a post (and related image if any)

**app.post('/api/add', async (req, res, next)**  
endpoint to commit a post to database

**app.get('/api/edit/:post', async (req, res, next)**  
endpoint to present an html form to edit a post

**app.post('/api/edit', async (req, res, next)**  
endpoint to delete or update a post

**app.get('/api/delimg/:post', async (req, res, next)**  
endpoint to delete an image without deleting the post
