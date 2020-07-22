import apiRequest from "./api_requests.js";
class App {
    constructor() {
        this._loadTable = this._loadTable.bind(this);
        this._onLogin = this._onLogin.bind(this);
        // this._switchHeaders = this._switchHeaders.bind(this);
    }

    setup() {
        this._loginForm = document.querySelector("#loginForm");
        this._welcome = document.querySelector("#welcome");
        this._table = document.querySelector("#myTable");
        this._tableContents = this._table.children[0];
        this._loginForm.login.addEventListener("click", this._onLogin);
        // this._loginForm.test.addEventListener("click", this._switchHeaders);
    }

    // _switchHeaders(event) {
    //     event.preventDefault();
    //     let headers = this._tableContents.children;
    //     for (let i = 0; i < headers.length; i++) {
    //         if (headers[i].classList.contains("hidden")) {
    //             headers[i].classList.remove("hidden");
    //         }  else {
    //             headers[i].classList.add("hidden");
    //         }
    //     }
    // }

    _loadTable() {
        this._welcome.classList.add("hidden");
        this._table.classList.remove("hidden");
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
