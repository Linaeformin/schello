// 기준 날짜
let currentDate = new Date();
const checkedStatus = {}; //전역 상태저장

import { setupBottomSheetEvents, openBottomSheet, closeBottomSheet } from "/static/bottomSheetHandler.js";

//--------------첫 실행 화면 띄우기----------------------


//--------------------------------화면 띄워졌을때 nav-bar와 바텀 시트 등을 가져오기------------
window.addEventListener('DOMContentLoaded', () => {

  // 2) nav-bar와 add-todo-sheet는 이미 home.html에서 {% include %}로 포함됐다고 가정

  // 3) 하위 기능 연결
  setupBottomSheetEvents();
  attachEditBtnHandler();

  const form = document.getElementById("todoForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
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

      const formData = new FormData(form);

      if (!document.getElementById("time").checked) {
        formData.delete('start-hour');
        formData.delete('start-minute');
        formData.delete('end-hour');
        formData.delete('end-minute');
      }

      if (!document.getElementById("priority").checked) {
        formData.delete('priority-radio');
      }

      try {
        const response = await fetch('/schedules/add/', {
          method: 'POST',
          body: formData, // FormData 객체를 body로 직접 전달
        });

        if (response.ok) { // HTTP 상태 코드가 200-299 범위인 경우 (성공)
          const result = await response.json(); // 서버에서 보낸 JSON 응답 파싱
          console.log("일정 저장 성공:", result);

          if (window.editingScheduleId) { // 수정모드 상태면
            const idToDelete = window.editingScheduleId; // 수정 중이던 일정의 ID를 삭제할 ID로 사용

            try {
              const response = await fetch(`/home/${idToDelete}/delete/`, {
                method: 'POST', // Django에서는 POST로 삭제를 처리하는 경우가 많음
                headers: {
                  'X-CSRFToken': getCookie('csrftoken') // CSRF 토큰 전송
                }
              });

              if (response.ok) {
                console.log(`일정 수정 성공`);
                closeBottomSheet(); // 바텀 시트 닫기
                document.getElementById("todoForm").reset(); // 폼 초기화
                window.editingScheduleId = null; // 수정 모드 해제
                window.location.reload();
              } else {
                const errorData = await response.json();
                console.error("일정 삭제 실패:", errorData);
                alert(`일정 삭제에 실패했습니다: ${errorData.error_message || response.statusText}`);
              }
            } catch (error) {
              console.error("네트워크 오류 또는 삭제 요청 실패:", error);
              window.location.reload();
            }
            // 삭제 로직 실행 후 종료
            return;
          } else {
            window.location.reload();
          }

          const selectedDateElement = document.querySelector(".day-box.selected");
          const selectedDate = selectedDateElement ? selectedDateElement.dataset.date : null;
          if (selectedDate) {
            renderSchedules(selectedDate);
          } else { // 선택된 날짜가 없는 경우
            // currentDate 변수를 사용하여 현재 날짜를 YYYY-MM-DD 형식으로 변환
            const todayYear = currentDate.getFullYear();
            const todayMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
            const todayDay = String(currentDate.getDate()).padStart(2, '0');
            renderSchedules(`${todayYear}-${todayMonth}-${todayDay}`);
          }

          closeBottomSheet(); // 바텀 시트 닫기
          document.getElementById("todoForm").reset(); // 폼 초기화
          window.editingScheduleId = null;

        } else { // 서버 응답이 실패 (4xx, 5xx)인 경우
          const errorData = await response.json(); // 서버에서 보낸 에러 메시지 파싱
          console.error("일정 저장 실패:", errorData);
          alert(`일정 저장에 실패했습니다: ${errorData.error_message || response.statusText}`);
        }
      } catch (error) {
        console.error("네트워크 오류 또는 요청 실패:", error);
        alert("일정 저장 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.");
      }
    });
  }

  // 4) 캘린더 렌더링 및 드래그 이벤트
  renderCalendar(currentDate);

  const todayBox = document.querySelector(".day-box.today");
  if (todayBox) {
    todayBox.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  setupHorizontalDrag(document.querySelector(".week-calendar"));
  setupVerticalDrag(document.querySelector(".schedule-list"));

});

//일정 우선순위에 따른 아이콘(1순위,2순위, 3순위 아이콘)
const priorityIcons = {
  1: "/static/images/prio1.svg",
  2: "/static/images/prio2.svg",
  3: "/static/images/prio3.svg"
};

//캘린더-------------------
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

    box.innerHTML = `<div class="weekday">${weekday}</div><div class="day-number">${d}</div>`;
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

//일정 추가, 수정 등 완료 후 렌더링 할때
function renderSchedules(selectedDate) {
  const scheduleList = document.querySelector(".schedule-list");

  scheduleList.innerHTML = "";

  let schedules = dummySchedules.filter(item => item.date === selectedDate);

  schedules.forEach(s => {
    // s.memo = s.memo || "메모 없음";
    s.displayMemo = s.memo && s.memo.trim() !== "" ? s.memo : "메모 없음";  // 렌더링용만 따로

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
    const priorityA = a.priority === null ? Infinity : a.priority;
    const priorityB = b.priority === null ? Infinity : b.priority;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    const isAllDayA = a.displayTime === '하루종일';
    const isAllDayB = b.displayTime === '하루종일';

    if (isAllDayA && !isAllDayB) {
      return 1;
    }
    if (!isAllDayA && isAllDayB) {
      return -1;
    }
    if (isAllDayA && isAllDayB) {
      return 0;
    }

    const timeA = a.displayTime.split(' ')[0];
    const timeB = b.displayTime.split(' ')[0];

    const hourA = parseInt(timeA.split(':')[0], 10);
    const minuteA = parseInt(timeA.split(':')[1], 10);
    const totalMinutesA = hourA * 60 + minuteA;

    const hourB = parseInt(timeB.split(':')[0], 10);
    const minuteB = parseInt(timeB.split(':')[1], 10);
    const totalMinutesB = hourB * 60 + minuteB;

    return totalMinutesA - totalMinutesB;
  });

  if (!schedules.length) {
    scheduleList.innerHTML = `<div class="no-schedule">추가된 일정이 없습니다.</div>`;
    return;
  }

  schedules.forEach(item => {
    const card = document.createElement("div");
    const iconHtml = item.priority && priorityIcons[item.priority]
      ? `<img src="${priorityIcons[item.priority]}" class="priority-icon" alt="우선순위 ${item.priority}">`
      : "";

    card.className = "schedule-card";
    card.innerHTML = `
      <div class = "schedule-left">
        <div class="prior-icon">${iconHtml}</div>
        <div class="schedule-checkbox">
          <input type="checkbox" class="check-task" data-id="${item.id}" ${item.is_checked ? "checked" : ""}>
          <span class="checkmark"></span>
        </div>
      </div>
      <div class="schedule-info">
        <div class="schedule-time">${item.time}</div>
        <div class="schedule-title">${item.title}</div>
        <div class="schedule-memo">${item.displayMemo}</div>
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

    // 초기 렌더링 시 is_checked 상태 반영
    title.style.color = item.is_checked ? "var(--gray-50)" : "var(--gray-80)";
    title.style.textDecoration = item.is_checked ? "line-through" : "none";
  });

  //const isChecked = checkedStatus[item.id] || false;
  //checkbox.checked = isChecked;

  // 이벤트 리스너를 개별 체크박스에 추가
  document.querySelectorAll(".schedule-checkbox").forEach(box => {
    const checkbox = box.querySelector(".check-task");
    const title = box.closest(".schedule-card").querySelector(".schedule-title");

    box.addEventListener("click", (e) => {
      e.preventDefault(); // 기본 체크박스 동작 방지
      const newCheckedState = !checkbox.checked; // 새로운 상태
      checkbox.checked = newCheckedState; // UI 업데이트

      // UI 스타일 업데이트
      title.style.color = newCheckedState ? "var(--gray-50)" : "var(--gray-80)";
      title.style.textDecoration = newCheckedState ? "line-through" : "none";

      updateScheduleCheckedStatus(checkbox.dataset.id, newCheckedState);
    });
  });

  document.querySelectorAll(".more-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const toolbar = btn.nextElementSibling;
      toolbar.classList.toggle("hidden");
      document.querySelectorAll(".toolbar").forEach(el => {
        if (el !== toolbar) el.classList.add("hidden");
      });
    });
  });
}

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

async function updateScheduleCheckedStatus(scheduleId, isChecked) {
  try {
    const response = await fetch(`/schedules/${scheduleId}/update_checked_status/`, {
      method: 'POST', // POST 또는 PATCH 사용 권장
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken') // CSRF 토큰 전송
      },
      body: JSON.stringify({ is_checked: isChecked })
    });

    if (!response.ok) {
      // 에러 발생 시 UI를 원래 상태로 되돌리거나 사용자에게 알림
      const errorData = await response.json();
      console.error('백엔드 업데이트 실패:', errorData.message);
      // UI를 원래 상태로 되돌리는 로직 (예: 해당 체크박스를 다시 원래 상태로)
      const checkbox = document.querySelector(`.check-task[data-id="${scheduleId}"]`);
      if (checkbox) {
        checkbox.checked = !isChecked; // 원래 상태로 되돌림
        const title = checkbox.closest(".schedule-card").querySelector(".schedule-title");
        title.style.color = !isChecked ? "var(--gray-50)" : "var(--gray-80)";
        title.style.textDecoration = !isChecked ? "line-through" : "none";
      }
      alert(`일정 상태 업데이트 실패: ${errorData.message}`);
      return;
    }

    const data = await response.json();
    console.log('백엔드 업데이트 성공:', data);

  } catch (error) {
    console.error('네트워크 또는 기타 오류:', error);
    alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    // UI를 원래 상태로 되돌리는 로직
    const checkbox = document.querySelector(`.check-task[data-id="${scheduleId}"]`);
    if (checkbox) {
      checkbox.checked = !isChecked;
      const title = checkbox.closest(".schedule-card").querySelector(".schedule-title");
      title.style.color = !isChecked ? "var(--gray-50)" : "var(--gray-80)";
      title.style.textDecoration = !isChecked ? "line-through" : "none";
    }
  }
}


//캘린더 이전달과 다음달----------------------------
document.getElementById("prev-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

document.getElementById("next-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});
//----------------------------------------------------

//스크롤(수직-일정리스트, 수평-주간뷰)-------------------
document.addEventListener("DOMContentLoaded", () => {
  const weekCalendar = document.querySelector(".week-calendar");
  const scheduleList = document.querySelector(".schedule-list");
  renderCalendar(currentDate);
  setTimeout(() => {
    const todayBox = document.querySelector(".day-box.today");
    if (todayBox) todayBox.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, 50);
  setupHorizontalDrag(weekCalendar);
  setupVerticalDrag(scheduleList);
});

function setupHorizontalDrag(container) {
  let isDown = false, startX, scrollLeft;
  container.addEventListener("mousedown", e => {
    isDown = true;
    container.classList.add("dragging");
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });
  container.addEventListener("mouseleave", () => isDown = false);
  container.addEventListener("mouseup", () => isDown = false);
  container.addEventListener("mousemove", e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  });
}
function setupVerticalDrag(container) {
  let isDown = false, startY, scrollTop;

  container.addEventListener("mousedown", e => {
    isDown = true;
    container.classList.add("dragging");
    startY = e.pageY;
    scrollTop = container.scrollTop;
  });

  container.addEventListener("mouseleave", () => {
    isDown = false;
    container.classList.remove("dragging");
  });

  container.addEventListener("mouseup", () => {
    isDown = false;
    container.classList.remove("dragging");
  });

  container.addEventListener("mousemove", e => {
    if (!isDown) return;
    e.preventDefault();
    const y = e.pageY;
    const walk = (y - startY) * 1.5; // 이동 거리
    container.scrollTop = scrollTop - walk;
  });
}
//*---------------------------------------------------


//모달창 -일정 삭제를 위한
document.addEventListener("click", (e) => {
  const isMoreBtn = e.target.closest(".more-btn");
  const isToolbar = e.target.closest(".toolbar");
  if (isMoreBtn) {
    const currentCard = isMoreBtn.closest(".schedule-card");
    const thisToolbar = currentCard.querySelector(".toolbar");
    const isOpen = !thisToolbar.classList.contains("hidden");
    document.querySelectorAll(".toolbar").forEach(t => t.classList.add("hidden"));
    if (!isOpen) thisToolbar.classList.remove("hidden");
    return;
  }
  if (!isToolbar) {
    document.querySelectorAll(".toolbar").forEach(t => t.classList.add("hidden"));
  }

  if (e.target.classList.contains("delete-btn")) {
    const card = e.target.closest(".schedule-card");
    const id = parseInt(card.querySelector(".check-task").dataset.id);
  }
});
//삭제를 위한 모달창 함수
function openConfirmModal(message, onConfirm) {
  const overlay = document.querySelector(".modal-overlay");
  const modal = document.querySelector(".modal");
  modal.querySelector("p").textContent = message;
  overlay.classList.remove("hidden");
  modal.classList.remove("hidden");
  const cancelBtn = modal.querySelector(".cancel-btn2");
  const confirmBtn = modal.querySelector(".confirm-delete-btn");
  const close = () => {
    overlay.classList.add("hidden");
    modal.classList.add("hidden");
    cancelBtn.onclick = null;
    confirmBtn.onclick = null;
  };
  cancelBtn.onclick = close;
  confirmBtn.onclick = () => { onConfirm(); close(); };
}


document.addEventListener("click", (e) => {
  const isMoreBtn = e.target.closest(".more-btn");
  const isToolbar = e.target.closest(".toolbar");

  if (isMoreBtn) {
    const currentCard = isMoreBtn.closest(".schedule-card");
    const thisToolbar = currentCard.querySelector(".toolbar");
    const isOpen = !thisToolbar.classList.contains("hidden");
    document.querySelectorAll(".toolbar").forEach(t => t.classList.add("hidden"));
    if (!isOpen) thisToolbar.classList.remove("hidden");
    return;
  }

  if (!isToolbar) {
    document.querySelectorAll(".toolbar").forEach(t => t.classList.add("hidden"));
  }

  if (e.target.classList.contains("delete-btn")) {
    const card = e.target.closest(".schedule-card");
    const id = parseInt(card.querySelector(".check-task").dataset.id);

    openConfirmModal("일정을 삭제할까요?", async () => {
      try {
        const response = await fetch(`/home/${id}/delete/`, {
          method: 'POST',
          headers: {
            'X-CSRFToken': getCookie('csrftoken')
          }
        });

        if (response.ok) {
          window.location.reload();  // 성공 시 새로고침
        } else {
          alert("삭제 실패: 서버에서 오류가 발생했습니다.");
        }
      } catch (error) {
        console.error("삭제 요청 실패:", error);
        alert("삭제 중 오류가 발생했습니다.");
      }
    });
  }
});

//일정 수정 바텀시트를 위한 일정 추가 재사용
function attachEditBtnHandler() {
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("edit-btn")) {
      const card = e.target.closest(".schedule-card");
      const id = parseInt(card.querySelector(".check-task").dataset.id);

      const schedule = dummySchedules.find((s) => s.id === id);
      if (schedule) {
        openBottomSheet('edit', schedule);
      }
    }
  });
}