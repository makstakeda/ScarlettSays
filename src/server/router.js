const fs = require('fs');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const path = require('path');

const router = (app, server) => {
  const snippetsDirPath = path.join('snippets/');
  app.get('/snippets', urlencodedParser, (req, res) => {
    if (req.method === 'GET') {
      fs.readdir(snippetsDirPath, (error, files) => {
        if (error) {
          return console.log(`Can not load snippets: ${error}`);
        };
        const snippets = [];
        files.forEach(file => {
          if (file.substr(-3) === '.js') {
            snippets.push(file);
          };
        });
        res.end(JSON.stringify(snippets));
      });
    } else {
      res.end(`[${req.method}] method is unsupported on /snippets`);
    };
  });
  app.post('/save-snippet', urlencodedParser, function(req, res) {
    if (req.method === 'POST') {
      let requestBody = '';
      req.on('data', buffer => {
        requestBody += buffer.toString();
      });
      req.on('end', () => {
        const parsedRequestBody = JSON.parse(requestBody);
        console.log(parsedRequestBody.file, parsedRequestBody.body);
        fs.writeFile(`${snippetsDirPath}/${parsedRequestBody.file}`, parsedRequestBody.body, function (error) {
          if (error) throw error;
          res.end();
        }); 
      });
    } else {
      res.end(`[${req.method}] method is unsupported on /save-snippet`);
    };
  });
  app.get('/read-snippet', urlencodedParser, function(req, res) {
    fs.readFile(`${snippetsDirPath}/${req.query.file}`, 'utf8', function (error, data) {
      if (error) {
        res.writeHead(404);
        res.write('Whoops! File not found!');
      } else {
        res.write(data);
      }
      res.end();
    });
  });
};

module.exports = router;
