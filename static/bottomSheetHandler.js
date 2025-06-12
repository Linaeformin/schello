// 일정 추가/수정 바텀시트를 공통으로 쓰며, 수정 시 값 채우기 & 폼 제출 처리 통합

export function setupBottomSheetEvents() {
  // 동적으로 삽입된 뒤 실행돼야 하므로 DOMContentLoaded 이후 실행되도록 export만 함
  document.addEventListener("click", (e) => {
    const openBtn = e.target.closest(".plus-circle");
    const cancelBtn = document.querySelector(".add-todo-sheet .cancel-btn");

    const addSheet = document.querySelector(".add-todo-sheet");

    if (openBtn) {
      window.editingScheduleId = null;
      resetFormFields();

      addSheet.classList.remove("hidden");
      setTimeout(() => addSheet.classList.add("active"), 10);
    }

    if (cancelBtn && cancelBtn.contains(e.target)) {
      addSheet.classList.remove("active");
      setTimeout(() => addSheet.classList.add("hidden"), 300);
    }
  });
}


export function openBottomSheet(mode = 'add', schedule = null) {
  const sheet = document.querySelector(".add-todo-sheet");
  const titleEl = document.querySelector(".add-todo-title");
  document.body.style.overflow = 'hidden';
  if (!sheet || !titleEl) {
    console.warn("바텀시트 요소가 아직 로드되지 않았습니다.");
    return;
  }

  titleEl.textContent = mode !== 'edit' ? "새 일정" : "수정하기";

  if (mode === 'edit' && schedule) {
    // 수정할 일정 데이터로 값 채우기
    document.getElementById("todo").value = schedule.title;
    // document.getElementById("memo").value = schedule.memo || "";
    const memoValue = (!schedule.memo || schedule.memo.trim() === "" || schedule.memo === "메모 없음") ? "" : schedule.memo;
    document.getElementById("memo").value = memoValue;
    const [year, month, day] = schedule.date.split("-");
    document.getElementById("year").value = year;
    document.getElementById("month").value = parseInt(month);
    document.getElementById("day").value = parseInt(day);

    if (schedule.time && schedule.time.includes("-")) {
      const [start, end] = schedule.time.split("-");
      const [sh, sm] = start.split(":");
      const [eh, em] = end.split(":");
      document.getElementById("time").checked = true;
      document.getElementById("start-hour").value = sh;
      document.getElementById("start-minute").value = sm;
      document.getElementById("end-hour").value = eh;
      document.getElementById("end-minute").value = em;
    }

    if (schedule.priority) {
      document.getElementById("priority").checked = true;
      const prRadio = document.querySelector(`input[name="priority-radio"][value="${schedule.priority}"]`);
      if (prRadio) prRadio.checked = true;
    }

    window.editingScheduleId = schedule.id;

  } else {
    resetFormFields();
    window.editingScheduleId = null;
  }

  sheet.classList.remove("hidden");
  setTimeout(() => sheet.classList.add("active"), 10);
}


export function resetFormFields() {
  document.getElementById("todoForm").reset();
  document.getElementById("time").checked = false;
  document.getElementById("priority").checked = false;
  const titleEl = document.querySelector(".add-todo-title");
  titleEl.textContent = "새 일정";
  const checkedRadio = document.querySelector('input[name="priority-radio"]:checked');
  if (checkedRadio) checkedRadio.checked = false;
}

export function closeBottomSheet() {
  const sheet = document.querySelector(".add-todo-sheet");
  sheet.classList.remove("active");
  setTimeout(() => sheet.classList.add("hidden"), 300);

  document.getElementById("todoForm").reset();
  window.editingScheduleId = null;

}

document.addEventListener("DOMContentLoaded", () => {
  //홈, 프로필 페이지마다 아이콘 색 조정
  const bottomIcon1 = document.querySelector(".nav-icon1");
  const bottomIcon2 = document.querySelector(".nav-icon2");

  const path = window.location.pathname;

  if (path.includes("/home")) {
    if (bottomIcon2) bottomIcon2.src = "/static/images/profile-gray.png";
  }
  else if (path.includes("/profile")) {
    if (bottomIcon1) bottomIcon1.src = "/static/images/home-gray.png";
  }

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const path = e.currentTarget.dataset.url;

      if (path) {
        window.location.href = path;
      }
    });
  });

});
