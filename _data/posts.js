require("dotenv").config();
const { Client } = require("@notionhq/client");
const NotionExporter = require("notion-exporter").default;
const moment = require("moment");
const slugify = require("slugify");
const readingTime = require("reading-time");
const AdmZip = require("adm-zip");
const download = require("download");
const fs = require("fs");

const md = require("markdown-it")({
  html: true,
  breaks: true,
  linkify: true,
});

const notion = new Client({ auth: process.env.NOTION_API_KEY });
function rewriteNotionImages(html) {
  const cheerio = require("cheerio");
  const $ = cheerio.load(html);

  $("img").each(function (i, elm) {
    const src = $(this).attr("src");
    $(this).attr("src", "/" + src.split("/")[1] + "/" + src.split("/")[1]);
  });
  return $.html();
}
function desc(t) {
  if (t.length > 150) {
    return t.slice(0, 150) + "...";
  } else {
    return t;
  }
}

module.exports = function () {
  return new Promise(async (resolve, reject) => {
    const databaseId = process.env.NOTION_API_TABLE;
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        or: [
          {
            property: "Published",
            checkbox: {
              equals: true,
            },
          },
        ],
      },
      sorts: [],
    });
    var i = 0;
    var obj = [];

    while (i < response.results.length) {
      var page = response.results[i];
      var pagedata = await notion.pages.retrieve({ page_id: page.id });
      var mddata = await new NotionExporter(process.env.COOKIE).getMdString(
        pagedata.id
      );
      var html = rewriteNotionImages(md.render(mddata));
      var title = pagedata.properties.Title.title[0].plain_text;
      obj.push({
        title: title,
        date: moment(new Date(pagedata.properties.Date.date.start)).format(
          "MMMM do[,] YYYY"
        ),
        html: html.split("\n").slice(5).join("\n"),
        readTime: readingTime(mddata).text,
        slug: slugify(title),
        description: desc(html).replace(/(<([^>]+)>)/gi, ""),
      });
      i++;
    }

    resolve(
      obj.sort(function (a, b) {
        return new Date(b.dateObj) - new Date(a.dateObj);
      })
    );
  });
};
