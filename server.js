import dotenv from "dotenv";
import http from "http";
import { Client } from "@notionhq/client";

dotenv.config();

const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const NOTION_SECRET = process.env.NOTION_SECRET;
const HOST = process.env.HOST;
const PORT = process.env.PORT || 8000;

const notion = new Client({
  auth: NOTION_SECRET,
});

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const query = await notion.databases.query({
    database_id: NOTION_DATABASE_ID,
  });

  const results = query.results
    .map((item) => {
      const data = {};
      if (item.properties._id.rich_text[0]) {
        data._id = item.properties._id?.rich_text[0]?.plain_text || "no _id";
        data.description =
          item.properties.description?.rich_text[0]?.plain_text ||
          "no description";
        data.price = item.properties.price.number;
        data.size = item.properties.size?.select?.name || "no size";
        data.pic = item.properties.pic?.rich_text[0]?.plain_text;
        data.hasStock = Boolean(item.properties.hasStock.select.name);

        return data;
      }
      return null;
    })
    .filter((item) => item != null);

  res.setHeader("Content-Type", "application/json");
  res.writeHead(200);
  res.end(JSON.stringify({ status: "OK", data: results }));
});

server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
