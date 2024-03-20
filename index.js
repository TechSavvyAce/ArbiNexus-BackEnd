const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const http = require("http");
const con = require("./DB/mysql");
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Specify extended option

app.set("view engine", "html");

//Routes
app.use("/", require("./routes/router"));
app.use(express.static(path.join(__dirname, "/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

async function setReward() {
  let count = 0;
  while (true) {
    try {
      count++;
      console.log(count);

      if (count === 24) {
        await processRewards("usdcreward", "depositusdc");
        await processRewards("usdtreward", "depositusdt");
        count = 0;
      }
    } catch (error) {
      console.error("Error in setReward:", error);
    }
    await sleep(3600 * 1000);
  }
}

async function processRewards(rewardTable, depositTable) {
  const rewardQuery = `SELECT * FROM ${rewardTable}`;
  const rewards = await queryDatabase(rewardQuery);

  for (const reward of rewards) {
    let { userwalletaddress, rewardamount } = reward;
    console.log(rewardamount, userwalletaddress, rewardTable.toUpperCase());

    const depositQuery = `SELECT * FROM ${depositTable} WHERE useraddress='${userwalletaddress}' AND (status='2' OR status='3')`;
    const deposits = await queryDatabase(depositQuery);

    for (const deposit of deposits) {
      rewardamount += deposit.amount / 200;
    }
    console.log(rewardamount, "after", rewardTable.toUpperCase());

    const updateQuery = `UPDATE ${rewardTable} SET rewardamount = '${rewardamount}' WHERE userwalletaddress='${userwalletaddress}'`;
    await queryDatabase(updateQuery);
  }
}

function queryDatabase(query) {
  return new Promise((resolve, reject) => {
    con.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

setReward();

const portHttp = process.env.HTTP || 5000;
app.listen(portHttp, "0.0.0.0", () =>
  console.log(`Started http service on port ${portHttp}`)
);
