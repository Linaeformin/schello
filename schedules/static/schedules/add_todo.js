//일정 추가를 위한 입력값들 받아오는 js

const todoForm = document.getElementById('todoForm');

        todoForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // 값 읽어와서 변수에 저장
            const todo = document.getElementById('todo').value;
            const memo = document.getElementById('memo').value;
            const year = document.getElementById('year').value;
            const month = document.getElementById('month').value;
            const day = document.getElementById('day').value;

            const startHour = document.getElementById('start-hour').value;
            const startMinute = document.getElementById('start-minute').value;
            const endHour = document.getElementById('end-hour').value;
            const endMinute = document.getElementById('end-minute').value;

            const priorityRadio = document.querySelector('input[name="priority-radio"]:checked');
            const priority = priorityRadio ? priorityRadio.value : null;

            const is_checked = document.getElementById('is-checked').checked; //체크 필드 추가

            //값이 들어있는 todoData 객체
            const todoData = {
                todo,
                memo,
                date: `${year}-${month}-${day}`,
                startTime: `${startHour}:${startMinute}`,
                endTime: `${endHour}:${endMinute}`,
                priority,
                is_checked,
            };

            localStorage.setItem('todoData', JSON.stringify(todoData));
            //<- 로컬스토리지 저장 

        });