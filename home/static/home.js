// 기준 날짜
let currentDate = new Date();

const checkedStatus = {}; //전역 상태저장

// 더미 데이터구성 근거----------------------------------------
/*고유아이디, 날짜, 시간, 제목, 메모, 우선순위를 가져옴
일정 추가 시 저장된 데이터들의 형태가 아래와 같을거라고 예상(홈 일정리스트 UI)
1. 고유아이디: 일정별로 구분
2. 날짜: 숫자(년도, 월, 시간)을 db저장 후 불러들일때, 아래 형식으로 정리되어 불러들여짐
3. 시간: 시간 또한 위와 같음/시간 미설정시 '하루종일'로 기입
4. 제목
5. 메모: 비었을 시 '메모없음'으로 기입
6. 우선순위: 버튼->숫자로 db저장, 우선순위 미설정시 null로 들어감/우선순위대로 일정리스트 출력*/

const dummySchedules = [
  {
    id: 1,
    date: "2025-06-02",
    time: "09:00 - 12:00",
    title: "졸작 보고서",
    memo: "월요일 회의 예정",
    priority: 1
  },
  {
    id: 2,
    date: "2025-06-02",
    time: "",
    title: "졸작",
    memo: "",
    priority: null
  },
  {
    id: 3,
    date: "2025-06-03",
    time: "13:00 - 14:00",
    title: "빅데이터 과제",
    memo: "주제 기획",
    priority: 2
  },
  {
    id: 4,
    date: "2025-06-04",
    time: "",
    title: "교양 과제",
    memo: "기한 회의해보기",
    priority: null
  }
];

function renderCalendar(baseDate) {
  const weekCalendar = document.querySelector(".week-calendar");
  weekCalendar.innerHTML = "";

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  document.getElementById("calendar-year").textContent = `${year}년`;
  document.getElementById("calendar-month").textContent = `${month + 1}월`;

  const lastDay = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= lastDay; d++) {
    const thisDate = new Date(year, month, d);
    const weekday = ["일", "월", "화", "수", "목", "금", "토"][thisDate.getDay()];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const box = document.createElement("div");
    box.classList.add("day-box");
    box.dataset.date = dateStr;

    if (isCurrentMonth && d === today.getDate()) {
      box.classList.add("today", "selected");
    }

    box.innerHTML = `
      <div class="weekday">${weekday}</div>
      <div class="day-number">${d}</div>
    `;

    box.addEventListener("click", () => {
      document.querySelector(".day-box.selected")?.classList.remove("selected");
      box.classList.add("selected");
      renderSchedules(dateStr);
    });

    weekCalendar.appendChild(box);
  }

  const defaultDate = isCurrentMonth ? today : new Date(year, month, 1);
  const defaultStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(defaultDate.getDate()).padStart(2, "0")}`;
  renderSchedules(defaultStr);
}

function renderSchedules(selectedDate) {
  const scheduleList = document.querySelector(".schedule-list");
  scheduleList.innerHTML = "";

  let schedules = dummySchedules.filter(item => item.date === selectedDate);

  schedules.forEach((s) => {
    s.priority = s.priority || 0;
    s.memo = s.memo || "메모 없음";
    s.time = s.time || "하루종일";

  });

  schedules.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.time.localeCompare(b.time);
  });

  if (schedules.length === 0) {
    scheduleList.innerHTML = `<div class="no-schedule">추가된 일정이 없습니다.</div>`;
    return;
  }

  schedules.forEach((item) => {
    const card = document.createElement("div");
    card.className = "schedule-card";

    card.innerHTML = `
      <div class="schedule-checkbox">
        <input type="checkbox" class="check-task" data-id="${item.id}">
        <span class="checkmark"></span>
      </div>
      <div class="schedule-info">
        <div class="schedule-time">${item.time}</div>
        <div class="schedule-title">${item.title}</div>
        <div class="schedule-memo">${item.memo}</div>
      </div>
      <button class="more-btn">∙∙∙</button>
      <div class="toolbar hidden">
        <button class="edit-btn">수정</button>
        <button class="delete-btn">삭제</button>
      </div>
    `;

    scheduleList.appendChild(card);

    const checkbox = card.querySelector(".check-task");
    const title = card.querySelector(".schedule-title");
    const isChecked = checkedStatus[item.id] || false;

    checkbox.checked = isChecked;
    title.style.color = isChecked ? "var(--gray-50)" : "var(--gray-80)";
    title.style.textDecoration = isChecked ? "line-through" : "none";
  });

  document.querySelectorAll(".schedule-checkbox").forEach((box) => {
    const checkbox = box.querySelector(".check-task");
    const title = box.closest(".schedule-card").querySelector(".schedule-title");

    box.addEventListener("click", (e) => {
      e.preventDefault();
      checkbox.checked = !checkbox.checked;
      checkedStatus[checkbox.dataset.id] = checkbox.checked;

      title.style.color = checkbox.checked ? "var(--gray-50)" : "var(--gray-80)";
      title.style.textDecoration = checkbox.checked ? "line-through" : "none";
    });
  });

  document.querySelectorAll(".more-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const toolbar = btn.nextElementSibling;
      toolbar.classList.toggle("hidden");

      document.querySelectorAll(".toolbar").forEach((el) => {
        if (el !== toolbar) el.classList.add("hidden");
      });
    });
  });
}

document.getElementById("prev-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

document.getElementById("next-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});

document.addEventListener("DOMContentLoaded", () => {
  weekCalendar = document.querySelector(".week-calendar");
  renderCalendar(currentDate);

  setTimeout(() => {
    const todayBox = document.querySelector(".day-box.today");
    if (todayBox) {
      todayBox.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, 50);

  setupHorizontalDrag(weekCalendar);
});

function setupHorizontalDrag(container) {
  let isDown = false;
  let startX;
  let scrollLeft;

  container.addEventListener("mousedown", (e) => {
    isDown = true;
    container.classList.add("dragging");
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  container.addEventListener("mouseleave", () => {
    isDown = false;
    container.classList.remove("dragging");
  });

  container.addEventListener("mouseup", () => {
    isDown = false;
    container.classList.remove("dragging");
  });

  container.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  });
}

document.addEventListener("click", (e) => {
  //--------------툴바----------(수정,삭제)
  const isMoreBtn = e.target.closest(".more-btn");
  const isToolbar = e.target.closest(".toolbar");

  // 버튼 클릭: 해당 toolbar toggle
  if (isMoreBtn) {
    const currentCard = isMoreBtn.closest(".schedule-card");
    const thisToolbar = currentCard.querySelector(".toolbar");

    const isOpen = !thisToolbar.classList.contains("hidden");

    // 일단 모든 툴바 닫기
    document.querySelectorAll(".toolbar").forEach(t => t.classList.add("hidden"));

    // 다시 눌렀을 땐 닫힌 상태로 유지 (즉 아무것도 안함)
    if (!isOpen) {
      thisToolbar.classList.remove("hidden");
    }

    return; // 버튼 클릭 시 여기까지만 처리
  }

  // 툴바 바깥 클릭 → 모든 툴바 닫기
  if (!isToolbar) {
    document.querySelectorAll(".toolbar").forEach(t => t.classList.add("hidden"));
  }

  //--------------------모달창 삭제--------------------
  if (e.target.classList.contains("delete-btn")) {
    const card = e.target.closest(".schedule-card");
    const id = parseInt(card.querySelector(".check-task").dataset.id);

    openConfirmModal("일정을 삭제할까요?", () => {
      const date = document.querySelector(".day-box.selected").dataset.date;
      dummySchedules.splice(dummySchedules.findIndex((s) => s.id === id), 1);
      renderSchedules(date);
    });
  }
});

function openConfirmModal(message, onConfirm) {
  const modal = document.querySelector(".modal-overlay");
  modal.querySelector("p").textContent = message;
  modal.classList.remove("hidden");

  const cancelBtn = modal.querySelector(".cancel-btn");
  const confirmBtn = modal.querySelector(".confirm-delete-btn");

  const close = () => {
    modal.classList.add("hidden");
    cancelBtn.onclick = null;
    confirmBtn.onclick = null;
  };

  cancelBtn.onclick = close;
  confirmBtn.onclick = () => {
    onConfirm();
    close();
  };
}

//--------------첫 실행 화면 띄우기----------------------

window.addEventListener('DOMContentLoaded',() => {
  const firstScreen=document.querySelector('.first');

  setTimeout(()=>{
    firstScreen.classList.add('hidden');
  }, 3000);
});