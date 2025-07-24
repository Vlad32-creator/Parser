# 🕷️ Parser API — powerful website data extractor

📌 **Repository**: [https://github.com/Vlad32-creator/Parser](https://github.com/Vlad32-creator/Parser)

## 📖 Description

This is a universal website scraping API with two modes:

You can try the API at this link [https://parser-x9js.onrender.com](https://parser-x9js.onrender.com)

- **`/easePars`** — fast and simple. Send a JSON request and get results quickly.
- **`/mainPars`** — advanced and powerful. Allows full browser interaction (clicks, typing, waiting, navigation, scraping, etc).

---

## HAW TO DOWNLOAD AND RUN THE PROJECT: 

git clone https://github.com/Vlad32-creator/Parser
cd parser
npm install
npx playwright install chromium
npm start

project work 🎉


## 🛠️ Technologies Used

- [Express](https://expressjs.com/)
- [Puppeteer](https://pptr.dev/)
- [Cheerio](https://cheerio.js.org/)
- [Axios](https://axios-http.com/)

---

## 🚀 Quick Mode: `/easePars`

This mode is optimized for speed and simplicity. It accepts a JSON payload that describes what to extract from which elements.

### ✅ Supported attributes:

`text`, `style`, `html`, `title`, `id`, `name`, `width`, `height`, `alt`, `src`, `href`, `role`, `target`, `type`, `data`, `maxlength`, `checked`

### ✅ Request format:

```json
{
  "#elementId": "text",
  ".className": ["style", "text"],
  "url": "http://example.com"
}
Keys: valid CSS selectors (#id, .class, div, etc.)

Values: string or array of attributes to extract

url is required

🔁 Response format:
Returns an array of values in the exact same order you defined them in the request.
For example:

json
{
  "result": [
    "value from #element1",
    "value from .className"
  ]
}
➡️ data1 will not come before data0, even if it loads faster — order is preserved!

🔧 Advanced Mode: /mainPars
This mode gives you full browser automation, using plain text instructions separated by semicolons (;).

🔹 Supported commands:
url:<page> — navigate to a URL

click:<selector> — click an element

input:[<selector>,<value>] — type into an input

wait:<milliseconds> — pause execution

data:[<selector>, <attribute>] — extract attribute from first matching element

alldata:[<selector>, <attribute>] — extract attribute from all matching elements

scrinshot — (coming soon)

🔹 Notes:
The order of commands matters — execution happens sequentially

url can be placed anywhere in the command list

Each command must end with a semicolon ;

Use data for #ids, and alldata for .classes and tags

🔁 Response format:
Returns a JSON object:

json
{
  "success": {
    "data": [...],
    "screenshot": "optional/path.png"
  }
}
or in case of error:

json
{
  "error": "Something went wrong"
}
🔹 Example:
css
url:https://example.com;
wait:2000;
click:#submitBtn;
input:[input[name="password"],value];
data:[#username,text];
alldata:[.post,html];
⚖️ Comparison: Quick vs. Advanced Mode
Feature	/easePars (Quick)	/mainPars (Advanced)
🔄 Response Type	Array of values	JSON object with keys
⚡ Speed	Very fast (1-5 sec)	Slower (up to 2–3 min)
🛠️ Flexibility	Limited	Very flexible
🧠 Works with JS SPAs	❌ React/Vue/Angular not supported	✅ Full JS page interaction
👨‍💻 Use Cases	Static content scraping	Logging in, submitting forms, deep scraping
🛑 Limitations	No clicks, no inputs	Requires more setup and time

📬 How to Use the API
POST /easePars
Content-Type: application/json

Body: JSON with selectors and url

Returns: Array of values in requested order

POST /mainPars
Content-Type: text/plain

Body: text commands

Returns: JSON with success or error

🧪 Request Examples
Simple mode:
http
POST /easePars
Content-Type: application/json

{
  ".header": ["text", "style"],
  "url": "https://example.com"
}
Advanced mode:
http
POST /mainPars
Content-Type: text/plain

url:https://example.com;
wait:3000;
click:.btn-login;
input:[input[type="password"],value];
data:[#user,text];
alldata:[.comment,html];
📝 Final Words
⚠️ This is my first parser project — still a work in progress, but already very powerful!
Use the quick path for simple scraping, and advanced mode when you want full control.

💡 Whether you're scraping public data or automating your account login — this tool can handle it.

Author: Vlad32-creator
Stars ⭐️ and feedback are always welcome!
