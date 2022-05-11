// This file was made to download images and put them in _site, where 11ty defaults store things
// Not the best solution but hey, it works!
require("dotenv").config();
const { Client } = require("@notionhq/client");
const NotionExporter = require("notion-exporter").default;
const AdmZip = require("adm-zip");
const download = require("download");
const fs = require("fs");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function main() {
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
    fs.writeFileSync(
      "my.zip",
      await download(
        await new NotionExporter(process.env.COOKIE).getZipUrl(pagedata.id)
      )
    );
    var zip = new AdmZip("./my.zip");
    var zipEntries = zip.getEntries();
    zipEntries.forEach(function (zipEntry) {
      if (
        zipEntry.entryName.includes(".jpeg") ||
        zipEntry.entryName.includes(".png")
      ) {
        var newName = zipEntry.entryName.split("/")[1];
        zip.extractEntryTo(
          zipEntry.entryName,
          __dirname + "/_site/" + newName,
          /*maintainEntryPath*/ false,
          /*overwrite*/ true
        );
        console.log(__dirname + "/_site/" + newName);
      }
    });
    i++;
  }
}
main();
