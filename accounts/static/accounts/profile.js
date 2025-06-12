import { setupBottomSheetEvents, openBottomSheet } from "/static/bottomSheetHandler.js";

// DOM 요소 참조
const editBtn = document.getElementById('editBtn');
const fileInput = document.getElementById('fileInput');
const profileImage = document.getElementById('profileImage');

setupBottomSheetEvents();

// 프로필 사진 수정 버튼 누르면 파일 입력창 띄우기
editBtn?.addEventListener('click', () => {
  fileInput?.click();
});

// 파일 선택 시: 이미지 미리보기 + form 자동 제출
fileInput?.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    profileImage.src = e.target.result; // 미리보기
  };
  reader.readAsDataURL(file);

  // form 자동 제출
  document.getElementById('profileForm')?.submit();
});

// 로그아웃 모달 처리
const logoutBtn = document.getElementById('logoutBtn');
const modal = document.getElementById('modal');
const modalCancel = document.querySelector('.modal-cancel');
const modalConfirm = document.querySelector('.modal-confirm');

logoutBtn?.addEventListener('click', () => {
  modal.style.display = 'flex';
});
modalCancel?.addEventListener('click', () => {
  modal.style.display = 'none';
});
modalConfirm?.addEventListener('click', () => {
  modal.style.display = 'none';
  window.location.href = "/accounts/logout/";
});

// 돌아가기 화살표 클릭 시
document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.querySelector(".back-btn");
  backBtn.addEventListener("click", () => {
      console.log("backBtn 클릭됨");
      window.location.href = "/home";
  });
});

// profile.js 안에 추가
const addBtn = document.getElementById("addScheduleBtn");

addBtn?.addEventListener("click", () => {
  window.location.href = "/home?openBottomSheet=true";
});




