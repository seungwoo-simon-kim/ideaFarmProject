import apiRequest from "./api_requests.js";
class App {
    constructor() {
        this._loadTable = this._loadTable.bind(this);
        this._onLogin = this._onLogin.bind(this);
        // this._switchHeaders = this._switchHeaders.bind(this);
    }

    setup() {
        this._loginForm = document.querySelector("#loginForm");
        this._loginForm.login.addEventListener("click", this._onLogin);

        this._loginContainer = document.querySelector("#loginContainer");
        this._searchContainer = document.querySelector("#searchContainer");

        this._welcome = document.querySelector("#welcome");
        this._table = document.querySelector("#myTable");

    }

    _loadTable() {
        this._welcome.classList.add("hidden");
        this._loginContainer.classList.add("hidden");
        this._table.classList.remove("hidden");
        this._searchContainer.classList.remove("hidden");
    }

    async _onLogin(event) {
        event.preventDefault();
        let form = this._loginForm
        let body = {
            companyID: form.companyID.value,
            password: form.password.value
        }
        let res = await apiRequest("POST", "/login", body);
        let json = await res.json();
        if (json.result === "true") {
            this._loadTable();
        }  else {
            alert("You have no access rights");
        }
    }
}

let app = new App();
app.setup();
