import { setupBottomSheetEvents, openBottomSheet, resetFormFields, closeBottomSheet } from "/static/bottomSheetHandler.js";

//카카오 프로필 사진으로 초기 프로필 이미지 설정
// const kakaoProfileImageUrl = "카카오톡 프로필 사진 URL"

// const profileImage = document.getElementById('profileImage');
// profileImage.src = kakaoProfileImageUrl;

// 프로필 사진 변경 기능 (갤러리 들어가서, 사진 선택)

const editBtn = document.getElementById('editBtn');
const fileInput = document.getElementById('fileInput');
const profileImage = document.getElementById('profileImage');


editBtn.addEventListener('click', () => {
    fileInput.click(); // 
});

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            profileImage.src = e.target.result; 
        };
        reader.readAsDataURL(file);
    }
});

//모달창 js
const logoutBtn = document.getElementById('logoutBtn');
const modal = document.getElementById('modal');
const modalCancel = document.querySelector('.modal-cancel');
const modalConfirm = document.querySelector('.modal-confirm');

logoutBtn.addEventListener('click', () => {
    modal.style.display = 'flex'; // 오버레이 띄우기
});

modalCancel.addEventListener('click', () => {
    modal.style.display = 'none'; // 닫기
});

modalConfirm.addEventListener('click', () => {
    // 여기에 "로그아웃 처리" 넣으면 됨 (예: 로그인 화면으로 이동)
    alert('로그아웃 처리!');
    modal.style.display = 'none';
});

//데이터 받아오고 불러오기
// 예시 사용자 정보 변수
const userName = "김슈니";
const userEmail = "swunikim0102@daum.net";

document.getElementById('userName').textContent = userName;
document.getElementById('userEmail').textContent = userEmail;



// 공통 UI(nav-bar, add-todo-sheet) 불러오기---------------------
window.addEventListener("DOMContentLoaded", async () => {
  const navRes = await fetch("/templates/nav-bar.html");
  const navHtml = await navRes.text();
  document.querySelector(".profile-container").insertAdjacentHTML("beforeend", navHtml);

  const sheetRes = await fetch("/schedules/templates/schedules/add-todo-sheet.html");
  const sheetHtml = await sheetRes.text();
  document.querySelector(".profile-container").insertAdjacentHTML("beforeend", sheetHtml);

  setupBottomSheetEvents();

  const scheduleList = document.querySelector(".nav-icon1");
  scheduleList.style.opacity= 0.5;

  const form = document.getElementById("todoForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const titleInput = document.getElementById("todo");
    const title = titleInput.value.trim();
    if (!title) {
      titleInput.value = "";
      titleInput.placeholder = "제목은 필수 입력입니다";
      titleInput.classList.add("required-placeholder");
      return;
    }
    titleInput.addEventListener("input", () => {
      if (titleInput.classList.contains("required-placeholder")) {
        titleInput.classList.remove("required-placeholder");
        titleInput.placeholder = "일정 제목";
      }
    });

    const memo = document.getElementById("memo").value;
    const year = document.getElementById("year").value;
    const month = document.getElementById("month").value;
    const day = document.getElementById("day").value;
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const sh = document.getElementById("start-hour").value;
    const sm = document.getElementById("start-minute").value;
    const eh = document.getElementById("end-hour").value;
    const em = document.getElementById("end-minute").value;
    const timeChecked = document.getElementById("time").checked;
    const time = timeChecked && sh && eh ? `${sh}:${sm} - ${eh}:${em}` : "하루종일";
    const priorityChecked = document.getElementById("priority").checked;
    const pr = document.querySelector("input[name='priority-radio']:checked");
    const priority = priorityChecked && pr ? parseInt(pr.value) : null;

    if (window.editingScheduleId !== null) {
      const target = dummySchedules.find(s => s.id === window.editingScheduleId);
      if (target) {
        target.title = title || target.title;
        target.memo = memo || target.memo;
        target.date = date;
        target.time = time;
        target.priority = priority;
        console.log("[수정 완료]", target);
      }
    } else {
      const newId = dummySchedules.length ? Math.max(...dummySchedules.map(s => s.id)) + 1 : 1;
      const newSchedule = { id: newId, title, memo, date, time, priority };
      dummySchedules.push(newSchedule);
      console.log("[추가 완료]", newSchedule);
    }

    closeBottomSheet();
    form.reset();
    window.editingScheduleId = null;
  });
});

// nav-bar 색상 강조 처리
document.addEventListener("DOMContentLoaded", () => {
  const profileIcon = document.querySelector(".profile-button");
  if (profileIcon) {
    profileIcon.classList.add("active-nav-icon");
  }
});

// 더미 스케줄 전역 배열
window.dummySchedules = window.dummySchedules || [];
