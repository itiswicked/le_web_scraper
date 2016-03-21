var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
var app = express();

app.get('/scrape', function(req, res) {
  // Archived Launch Academy website
  var url = 'http://web.archive.org/web/20150921181955/https://www.launchacademy.com/launchers';

  request(url, function(error, response, html) {
    if (error) return;

    var getFormattedCompaniesFromHtml = _.compose(
      formattedEmployersToHtml,
      formatEmployers,
      sortByKey,
      getEmployerCountFromHtml
    );

    console.log(getFormattedCompaniesFromHtml(html));
  });
});

function formatEmployer(employer) {
  return employer[0] + ": " + employer[1];
}

function formatEmployers(employers) {
  return _.map(employers, formatEmployer);
}

function formattedEmployersToHtml(formattedEmployers) {
  return formattedEmployers.join("\n");
}

function getEmployerCountFromHtml(html) {
  var $ = cheerio.load(html);

  // regex for finding `Company` in `Job Title @ Company`
  var companies = $('.mini-profile__body li')
    .map(function() { return $(this).text().match(/^(.*) @ (.*)$/)[2]; })
    .get();
    return _.reduce(companies, function(memo, employer) {
      memo[employer] = memo[employer] ? memo[employer] + 1 : 1;
      return memo;
    }, {});
}

function sortByKey(obj) {
  var keys = Object.keys(obj).sort(function(a, b) { return obj[b] - obj[a]; });
  return _.map(keys, function(key) { return [ key, obj[key] ]; });
}



app.listen('3004');

console.log("Magic happens on port 3000");

exports = module.exports = app;
