const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();
const dbPath = path.join(__dirname, "covid19India.db");
app.use(express.json());
let database = null;
const initializeDbAndServer = async () => {
  try {
    database = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`Data base Error is ${error}`);
    process.exit(1);
  }
};
initializeDbAndServer();

// API 1

app.get("/states/", async (request, response) => {
  const getStateQuery = `select state_id as stateId, state_name as stateName, population from state;`;
  const getPlayersQueryResponse = await database.all(getStateQuery);
  response.send(getPlayersQueryResponse);
});

//API 2
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `select state_id as stateId, state_name as stateName, population from state where state_id = ${stateId};`;
  const getPlayersQueryResponse = await database.get(getStateQuery);
  response.send(getPlayersQueryResponse);
});

//API 3
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const createPlayerQuery = `insert into district(district_name, state_id, cases, cured, active, deaths) values('${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths});`;
  const createPlayerQueryResponse = await database.run(createPlayerQuery);
  response.send("District Successfully Added");
});

//API 4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `select district_id as districtId, district_name as districtName, state_id as stateId, cases, cured, active, deaths from district where district_id=${districtId};`;
  const dbResponse = await database.get(deleteDistrictQuery);
  response.send(dbResponse);
});

//API 5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `delete from district where district_id=${districtId};`;
  await database.run(deleteDistrictQuery);
  response.send("District Removed");
});

//API 6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const updateDistrictQuery = `update district set district_name='${districtName}', state_id = ${stateId}, cases=${cases}, cured=${cured}, active=${active}, deaths= ${deaths};`;
  await database.run(updateDistrictQuery);
  response.send("District Details Updated");
});

//API 7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStatsQuery = `select sum(cases) as totalCases, sum(cured) as totalCured, sum(active) as totalActive, sum(deaths) as totalDeaths from district where state_id = ${stateId};`;
  const dbResponse = await database.get(getStatsQuery);
  response.send(dbResponse);
});

//API 8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getStatsQuery = `select state_name as stateName from state inner join district on state.state_id = district.state_id where district_id = ${districtId};`;
  const dbResponse = await database.get(getStatsQuery);
  response.send(dbResponse);
});

module.exports = app;
