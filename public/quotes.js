import apiRequest from "./api_requests.js";
class App {
    constructor() {
        this._onLogin = this._onLogin.bind(this);
        this._onInsert = this._onInsert.bind(this);
        this._user;
    }

    setup() {
        this._loginContainer = document.querySelector("#loginContainer");
        this._loginForm = this._loginContainer.querySelector("#loginForm");
        this._loginForm.login.addEventListener("click", this._onLogin);

        this._insertForm = document.querySelector("#insertForm");
        this._insertForm.insert.addEventListener("click", this._onInsert);

        this._welcome = document.querySelector("#welcome");

        this._idDiv = document.querySelector("#idDiv");
        this._idDivText = this._idDiv.querySelector("h2");

        this._insertForm = document.querySelector("#insertForm");
    }

    async _onLogin(event) {
        event.preventDefault();
        let form = this._loginForm;
        let user_id = form.companyID.value;
        let body = {
            companyID: user_id,
            password: form.password.value
        }
        let res = await apiRequest("POST", "/login", body);
        let json = await res.json();
        if (json.result === "true") {
            this._loginContainer.classList.add("hidden");
            this._welcome.classList.add("hidden");
            let user_res = await apiRequest("POST", "/user/getUserInfo", { companyID: user_id });
            this._user = await user_res.json();
            this._idDivText.textContent = this._user.nickname;
            this._idDiv.classList.remove("hidden");
            this._insertForm.classList.remove("hidden");
        }  else {
            alert("You have no access rights");
        }
    }

    async _onInsert(event) {
        event.preventDefault();
        let form = this._insertForm;
        let date_arr = [];
        for (let elem of form.date.value.split('-')) {
            if (elem[0] === "0") elem = elem[1];
            date_arr.push(elem);
        }
        let date_str = date_arr.join('-');
        let res = await apiRequest("POST", "/etc/writeQuotes", { date: date_str, quote: form.quote.value, person: form.author.value });
        let json = await res.json();
    }
}

let app = new App();
app.setup();
