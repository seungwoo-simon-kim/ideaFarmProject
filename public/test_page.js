import apiRequest from "./api_requests.js";

const onLogin = async (event) => {
    event.preventDefault();
    let form = document.querySelector("#loginForm");
    let body = {
        companyID: form.companyID.value,
        password: form.password.value
    }

    let res = await apiRequest("POST", `/login`, body);
    let json = await res.json();
    console.log(JSON.stringify(json, null, 4));
}

const onGetUser = async (event) => {
    event.preventDefault();
    let form = document.querySelector("#userInfoForm");
    let body = {
        companyID: form.companyID.value
    }
    let res = await apiRequest("POST", `/user/getUserInfo`, body);
    let json = await res.json();
    console.log(JSON.stringify(json, null, 4));
}

const onGetDate = async (event) => {
    event.preventDefault();
    let form = document.querySelector("#userDateForm");
    let body = {
        companyID: form.companyID.value
    }
    if (form.date.value) body.date = form.date.value;
    (form.getWeek.value == "true") ? body.getWeek = true : (form.getWeek.value == "false") ? false : null;
    let res = await apiRequest("POST", '/commute/getUserDateList', body);
    let json_arr = await res.json();
    console.log(JSON.stringify(json_arr, null, 4));
}

const onSetOn = async (event) => {
    event.preventDefault();
    let form = document.querySelector("#onWork");

    let body = {
        companyID: form.companyID.value,
        date: form.date.value,
        hour: form.hour.value,
        minute: form.minute.value
    }
    let { companyID, date } = body;
    let prev = await apiRequest("POST", '/commute/getUserDateList', { companyID, date });
    let prev_json = await prev.json();

    let patch = await apiRequest("POST", '/commute/setOnWork', body);

    let updated = await apiRequest("POST", '/commute/getUserDateList', { companyID, date });
    let updated_json = await updated.json();

    console.log(`PREVIOUS: \n${JSON.stringify(prev_json, null, 4)} \n\n UPDATED: \n ${JSON.stringify(updated_json, null, 4)} `);
}

const onSetOff = async (event) => {
    event.preventDefault();
    let form = document.querySelector("#offWork");
    let body = {
        companyID: form.companyID.value,
        date: form.date.value,
        hour: form.hour.value,
        minute: form.minute.value
    }
    let { companyID, date } = body;
    let prev = await apiRequest("POST", '/commute/getUserDateList', { companyID, date });
    let prev_json = await prev.json();

    let patch = await apiRequest("POST", '/commute/setOffWork', body);

    let updated = await apiRequest("POST", '/commute/getUserDateList', { companyID, date });
    let updated_json = await updated.json();

    console.log(`PREVIOUS: \n${JSON.stringify(prev_json, null, 4)} \n\n UPDATED: \n ${JSON.stringify(updated_json, null, 4)} `);
}

const onGetQuotes = async (event) => {
    event.preventDefault();
    let form = document.querySelector("#getQuotes");
    let res = await apiRequest("POST", '/etc/getQuotes', { date: form.date.value });
    let json = await res.json();
    console.log(JSON.stringify(json, null, 4));
}

const main = () => {
  document.querySelector("#login").addEventListener("click", onLogin);
  document.querySelector("#getUserInfo").addEventListener("click", onGetUser);
  document.querySelector("#getUserDate").addEventListener("click", onGetDate);
  document.querySelector("#clockin").addEventListener("click", onSetOn);
  document.querySelector("#clockout").addEventListener("click", onSetOff);
  document.querySelector("#getquotes").addEventListener("click", onGetQuotes);
};
main();
