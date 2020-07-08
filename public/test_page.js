import apiRequest from "./api_requests.js";

const onCreate = async (event) => {
  event.preventDefault();
  let form = document.querySelector("#createForm");
  let name = form.name.value;
  if (!name) {
      alert("이름을 입력해주세요");
      return;
  }
  let email = form.email.value;
  if (!email) {
      alert("이메일을 입력해주세요");
      return;
  }
  let numID = form.numID.value;
  if (!numID) {
      alert("사번을 입력해주세요");
      return;
  }
  let pw = form.pw.value;
  if (!pw) {
      alert("비밀번호를 입력해주세요");
      return;
  }
  let new_usr = {
      numID: numID,
      pw: pw,
      name: name,
      email: email
  };
  let res = await apiRequest("POST", "/users", new_usr);
  let json = await res.json();
  if (res.status != 200) {
      alert(json.error);
      return;
  }
  alert(`${json.name}님 환영합니다 \n\n 사번: ${json.numID} \n\n 이메일: ${json.email}`);
};

const onLogin = async (event) => {
    event.preventDefault();
    let form = document.querySelector("#loginForm");
    let numID = form.numID.value;
    if (!numID) {
        alert("사번을 입력해주세요");
        return;
    }
    let pw = form.pw.value;
    if (!pw) {
        alert("비밀번호를 입력해주세요");
        return;
    }
    let res = await apiRequest("GET", `/users/${numID}`);
    let json = await res.json();
    if (res.status != 200) {
        alert(json.error);
        return;
    }
    if (json.pw != pw) {
        alert(`비밀번호가 일치하지 않습니다`);
        return;
    }
    alert(`로그인 성공!\n\n환영합니다 ${json.name}님!`);
}

const onClockIn = async (event) => {
    event.preventDefault();
    let form = document.querySelector("#timecheck");
    let numID = form.numID.value;
    let res = await apiRequest("PATCH", `/users/${numID}`, { event: "clockin" });
    let json = await res.json();
    alert(`${json.clockin.year}-${json.clockin.month}-${json.clockin.date} ${json.clockin.day}요일 ${json.clockin.hour}시 ${json.clockin.minute}분에 출근하셨습니다!`);
}

const onClockOut = async (event) => {
    event.preventDefault();
    let form = document.querySelector("#timecheck");
    let numID = form.numID.value;
    let res = await apiRequest("PATCH", `/users/${numID}`, { event: "clockout" });
    let json = await res.json();
    let duration_hr = Math.floor(json.clockout.total / 60);
    let duration_min = json.clockout.total % 60;
    let remaining_hr = Math.floor(json.clockout.wkly_remaining / 60);
    let remaining_min = json.clockout.wkly_remaining % 60;
    alert(`${json.clockout.year}-${json.clockout.month}-${json.clockout.date} ${json.clockout.day}요일 ${json.clockout.hour}시 ${json.clockout.minute}분에 퇴근하셨습니다!\n\n오늘 총 근무시간: ${duration_hr}시간 ${duration_min}분\n\n이번 주 남은 시간: ${remaining_hr}시간 ${remaining_min}분`);
}

const main = () => {
  document.querySelector("#createuser").addEventListener("click", onCreate);
  document.querySelector("#login").addEventListener("click", onLogin);
  document.querySelector("#clockin").addEventListener("click", onClockIn);
  document.querySelector("#clockout").addEventListener("click", onClockOut);
};
main();
