// Executes in the phantomjs runtime via casperjs
var casper = require("casper").create();
var urls = casper.cli.args;
var system = require('system');

function readLine() {
  return system.stdin.readLine();
}

function getFormTitle() {
  function firstTextContent(node) {
    var child, text;

    for(var i = 0; i < node.childNodes.length; i++) {
      child = node.childNodes[i];

      if (child.childNodes.length == 0) {
        if (child.textContent.length > 0) {
          return child.textContent;
        }
      } else {
        text = firstTextContent(child);
        if (text.length > 0) {
          return text;
        }
      }
    }
  }

  return firstTextContent(document.forms[0]);
}

function getFormInputs() {
  function getFormInputsForForm(form) {
    var inputEls = form.querySelectorAll("input");
    var inputs = [];
    var attrs, inputEl;

    for (var i = 0; i < inputEls.length; i++) {
      attrs = {};
      inputEl = inputEls[i];

      attrs.type = inputEl.type;
      attrs.label = inputEl.getAttribute('aria-label');
      attrs.required = inputEl.required;
      attrs.value = inputEl.value;
      attrs.name = inputEl.name;
      attrs.id = inputEl.id;

      inputs.push(attrs);
    }

    return inputs;
  }

  return getFormInputsForForm(document.forms[0]);
}

function submitAnswers(answers) {
  function fillOutForm(form, answers) {
    var answer, input;
    for(var i = 0; i < answers.length; i++) {
      answer = answers[i];
      input = form.querySelector("[name='"+answer.name+"']");
      input.value = answer.value;
    }
    return form.submit();
  }

  return fillOutForm(document.forms[0], answers);
}

var formTitle, answers, url;

for(var j = 0; j < urls.length; j++) {
  url = urls[j];
  casper.echo("Fetching Google Form at: " + url);

  casper.start(url, function() {
    this.waitForSelector("form");
  });

  casper.then(function() {
    formTitle = this.evaluate(getFormTitle);
  });

  casper.then(function() {
    var page = this;
    page.echo("Please fill out " + formTitle);
    page.echo("----------------" + formTitle.length);
    answers = page.evaluate(getFormInputs)

    answers.filter(function(input) {
      return input.type == "text";
    }).map(function(input, i) {
      page.echo("");
      page.echo(""+(i+1)+") "+input.label+":");
      input.value = readLine();
      return input;
    });
  });

  casper.then(function() {
    this.evaluate(submitAnswers, {answers: answers});
    page.echo("");
    this.echo("Thanks!");
  });
}

casper.run();
