import apiRequest from "./api_requests.js";
class App {
    constructor() {
        this._createTable = this._createTable.bind(this);
        this._onLogin = this._onLogin.bind(this);
        this._onSearch = this._onSearch.bind(this);
        this._setQuery = this._setQuery.bind(this);
        this._loadTable = this._loadTable.bind(this);
        this._refreshTable = this._refreshTable.bind(this);

        [ this._companyID, this._year, this._month, this._day ];
    }

    setup() {
        this._loginForm = document.querySelector("#loginForm");
        this._loginForm.login.addEventListener("click", this._onLogin);

        this._searchForm = document.querySelector("#searchForm");
        this._searchForm.search.addEventListener("click", this._onSearch);

        this._loginContainer = document.querySelector("#loginContainer");
        this._searchContainer = document.querySelector("#searchContainer");

        this._welcome = document.querySelector("#welcome");
        this._table = document.querySelector("#myTable");

    }

    _createTable() {
        this._welcome.classList.add("hidden");
        this._loginContainer.classList.add("hidden");
        this._searchContainer.classList.remove("hidden");
    }

    _setQuery() {
        const date = `${this._year + `-`}${this._year && this._month ? this._month + `-` : ''}${this._year && this._month && this._day ? this._day : ''}`;
        let query = {
            ...(this._companyID && { companyID: this._companyID }),
            ...(date && { date: { $regex: `${date}` } })
        }
        return query;
    }

    _refreshTable() {
        let toDel = this._table.querySelectorAll(".toDel");
        if (!toDel) return;
        toDel.forEach(elem => elem.remove());
    }

    _loadTable(res_array) {
        this._table.classList.remove("hidden");
        this._table.querySelector("#tableHeaders").classList.remove("hidden");
        let col_ids = [ "date_col", "id_col", "name_col", "holiday_col", "onWork_col", "offWork_col", "total_col" ];
        for (let obj of res_array) {
            const obj_keys = {
                date_col: obj.date, id_col: obj.companyID, name_col: "홍길동", holiday_col: obj.holiday_yn, onWork_col: obj.onworkTime, offWork_col: obj.offworkTime, total_col: obj.total
            }
            let new_row = this._table.querySelector("#tableContents").cloneNode(true);
            for (let col of col_ids) {
                new_row.querySelector(`#${col}`).textContent = obj_keys[col];
            }
            new_row.classList.remove("hidden");
            new_row.classList.add("toDel");
            this._table.children[0].appendChild(new_row);
        }
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
            this._createTable();
        }  else {
            alert("You have no access rights");
        }
    }

    async _onSearch(event) {
        event.preventDefault();
        this._refreshTable();
        let form = this._searchForm;
        [ this._companyID, this._year, this._month, this._day ] = [ form.companyID.value, form.year.value, form.month.value, form.day.value ];
        let query = this._setQuery();
        let res = await apiRequest("POST", "/commute/getUserDateList", query);
        let json = await res.json();
        this._loadTable(json.result);
    }

}

let app = new App();
app.setup();
