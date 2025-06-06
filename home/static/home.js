// 기준 날짜
let currentDate = new Date();

const checkedStatus = {}; //전역 상태저장

async function fetchSchedules(dateStr) {
  try {
    const response = await fetch(`/add_todo/api/schedules/?date=${dateStr}`);

    if (!response.ok) {
      throw new Error(`HTTP 에러: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("일정 불러오기 실패:", error);
    return [];
  }
}

// 더미 데이터구성 근거----------------------------------------
/*고유아이디, 날짜, 시간, 제목, 메모, 우선순위를 가져옴
일정 추가 시 저장된 데이터들의 형태가 아래와 같을거라고 예상(홈 일정리스트 UI)
1. 고유아이디: 일정별로 구분
2. 날짜: 숫자(년도, 월, 시간)을 db저장 후 불러들일때, 아래 형식으로 정리되어 불러들여짐
3. 시간: 시간 또한 위와 같음/시간 미설정시 '하루종일'로 기입
4. 제목
5. 메모: 비었을 시 '메모없음'으로 기입
6. 우선순위: 버튼->숫자로 db저장, 우선순위 미설정시 null로 들어감/우선순위대로 일정리스트 출력*/

/*const dummySchedules = [
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
]; */

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

async function renderSchedules(selectedDate) {
  const scheduleList = document.querySelector(".schedule-list");
  scheduleList.innerHTML = "";

  let schedules = await fetchSchedules(selectedDate); // 더미데이터 대신 db에서 호출

  schedules.forEach((s) => {
    s.priority = s.priority !== null ? s.priority : 0;
    s.memo = s.memo || "메모 없음";
    s.time = s.time || "하루종일";

    let displayTime = '';
    if (s.start && s.end) {
      displayTime = `${s.start} ~ ${s.end}`;
    } else if (s.start) {
      displayTime = `${s.start} ~`;
    } else if (s.end) {
      displayTime = `~ ${s.end}`;
    } else {
      displayTime = '하루종일';
    }
    s.displayTime = displayTime;
  });

  schedules.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    if (a.displayTime === '하루종일' && b.displayTime !== '하루종일') return -1;
    if (a.displayTime !== '하루종일' && b.displayTime === '하루종일') return 1;
    return a.displayTime.localeCompare(b.displayTime);
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
        <div class="schedule-time">${item.displayTime}</div>
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
    const selectedDate = document.querySelector(".day-box.selected").dataset.date;


    openConfirmModal("일정을 삭제할까요?", async () => {
      const success = await deleteSchedule(id);
      if (success) {
        renderSchedules(selectedDate);
      } else {
        alert("일정 삭제에 실패했습니다.");
      }
    });
  }
});

    /*openConfirmModal("일정을 삭제할까요?", () => {
      const date = document.querySelector(".day-box.selected").dataset.date;
      dummySchedules.splice(dummySchedules.findIndex((s) => s.id === id), 1);
      renderSchedules(date); */

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

// 일정 삭제 API 호출 함수 추가
async function deleteSchedule(scheduleId) {
    try {
        const response = await fetch(`/home/api/schedules/${scheduleId}/delete/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP 에러: ${response.status} - ${errorData.error || response.statusText}`);
        }
        return true; // 삭제 성공
    } catch (error) {
        console.error('일정 삭제 실패:', error);
        return false; // 삭제 실패
    }
}

// CSRF 토큰 가져오기
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
//--------------첫 실행 화면 띄우기----------------------

window.addEventListener('DOMContentLoaded',() => {
  const firstScreen=document.querySelector('.first');

  setTimeout(()=>{
    firstScreen.classList.add('hidden');
  }, 3000);
});