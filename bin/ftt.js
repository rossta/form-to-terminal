#! /usr/bin/env node
'use strict';

const spawn = require('child_process').spawn;

const google = "https://docs.google.com/forms/d/e/__IDENTIFIER__/viewform";
const CONFIG = {
  test: "1FAIpQLSelxra8HleSW9EYkFhymK-VNA5t4lY91vSw3jXARyWuE5eYGA",
  codenewbie: "1FAIpQLSc8RiS384YnakNfv5X_hUYokvzD3hEcIRE9B2xxc8uI5V2-sQ"
}

const args = process.argv.slice(2);

if (args.length == 0) {
  console.log("Please specify a Google Form by URL or id");
  process.exit();
}

const urls = args.map(function(arg) {
  let url;

  if (arg.match(/^https:\/\//)) {
    url = arg;
  } else {
    const identifier = CONFIG[arg] || arg;
    url = google.replace(/__IDENTIFIER__/, identifier);
  }

  return url;
});

const child = spawn('casperjs', ['index.js'].concat(urls));

child.stdin.setEncoding('utf-8');
child.stdout.pipe(process.stdout);
process.stdin.pipe(child.stdin);
child.on('exit', process.exit);
